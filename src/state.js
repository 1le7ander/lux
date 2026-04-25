/**
 * Centralized reactive state with localStorage persistence.
 * Immutable updates — always returns new state objects.
 */

const STORAGE_KEY = 'luxe_state';

const defaultState = {
  cart: [],
  orders: [],
  categories: [],
  products: [],
  offers: [],
  settings: {},
  admin: {
    isLoggedIn: false,
    sessionToken: null,
    sessionExpiry: null,
    loginAttempts: 0,
    lockoutUntil: null,
  },
};

let _state = loadState();
const _listeners = new Set();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    }
  } catch {
    // corrupted storage — reset
  }
  return structuredClone(defaultState);
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded — silent fail
  }
}

function notify() {
  for (const fn of _listeners) {
    try { fn(_state); } catch { /* listener error */ }
  }
}

/** Get current state (read-only snapshot) */
export function getState() {
  return _state;
}

/** Update state immutably via updater function */
export function setState(updater) {
  const next = typeof updater === 'function' ? updater(_state) : updater;
  _state = { ..._state, ...next };
  persist(_state);
  notify();
  return _state;
}

/** Subscribe to state changes */
export function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/* ── Cart helpers (immutable) ──────────────────────── */

export function addToCart(product, qty = 1, size = '', color = '') {
  const existing = _state.cart.find(
    (i) => i.id === product.id && i.size === size && i.color === color
  );
  if (existing) {
    const updatedCart = _state.cart.map((i) =>
      i === existing ? { ...i, qty: i.qty + qty } : i
    );
    return setState({ cart: updatedCart });
  }
  const item = {
    id: product.id,
    name: product.name,
    price: product.salePrice ?? product.price,
    originalPrice: product.price,
    image: product.images?.[0] ?? '',
    size,
    color,
    qty,
    category: product.category ?? '',
  };
  return setState({ cart: [..._state.cart, item] });
}

export function removeFromCart(id, size = '', color = '') {
  return setState({
    cart: _state.cart.filter(
      (i) => !(i.id === id && i.size === size && i.color === color)
    ),
  });
}

export function updateCartQty(id, qty, size = '', color = '') {
  if (qty <= 0) return removeFromCart(id, size, color);
  return setState({
    cart: _state.cart.map((i) =>
      i.id === id && i.size === size && i.color === color
        ? { ...i, qty }
        : i
    ),
  });
}

export function clearCart() {
  return setState({ cart: [] });
}

export function getCartTotal() {
  return _state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function getCartCount() {
  return _state.cart.reduce((sum, i) => sum + i.qty, 0);
}

/* ── Orders ────────────────────────────────────────── */

export function addOrder(order) {
  return setState({ orders: [order, ..._state.orders] });
}

export function updateOrderStatus(orderId, status) {
  return setState({
    orders: _state.orders.map((o) =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ),
  });
}

/* ── Admin ─────────────────────────────────────────── */

export function setAdminSession(token) {
  return setState({
    admin: {
      ..._state.admin,
      isLoggedIn: true,
      sessionToken: token,
      sessionExpiry: Date.now() + 30 * 60 * 1000,
      loginAttempts: 0,
      lockoutUntil: null,
    },
  });
}

export function clearAdminSession() {
  return setState({
    admin: { ...defaultState.admin },
  });
}

export function incrementLoginAttempts() {
  const attempts = _state.admin.loginAttempts + 1;
  const lockoutUntil = attempts >= 5
    ? Date.now() + 15 * 60 * 1000
    : _state.admin.lockoutUntil;
  return setState({
    admin: { ..._state.admin, loginAttempts: attempts, lockoutUntil },
  });
}

export function isAdminLoggedIn() {
  const { isLoggedIn, sessionExpiry } = _state.admin;
  if (!isLoggedIn) return false;
  if (sessionExpiry && Date.now() > sessionExpiry) {
    clearAdminSession();
    return false;
  }
  return true;
}

export function isLockedOut() {
  const { lockoutUntil } = _state.admin;
  if (!lockoutUntil) return false;
  if (Date.now() > lockoutUntil) {
    setState({
      admin: { ..._state.admin, loginAttempts: 0, lockoutUntil: null },
    });
    return false;
  }
  return true;
}

/* ── CRUD helpers for admin ────────────────────────── */

export function setProducts(products) { return setState({ products }); }
export function setCategories(categories) { return setState({ categories }); }
export function setOffers(offers) { return setState({ offers }); }
export function setSettings(settings) { return setState({ settings }); }
export function setOrders(orders) { return setState({ orders }); }

export function upsertProduct(product) {
  const exists = _state.products.find((p) => p.id === product.id);
  if (exists) {
    return setState({
      products: _state.products.map((p) => (p.id === product.id ? { ...p, ...product } : p)),
    });
  }
  return setState({ products: [..._state.products, product] });
}

export function deleteProduct(id) {
  return setState({ products: _state.products.filter((p) => p.id !== id) });
}

export function upsertCategory(category) {
  const exists = _state.categories.find((c) => c.id === category.id);
  if (exists) {
    return setState({
      categories: _state.categories.map((c) => (c.id === category.id ? { ...c, ...category } : c)),
    });
  }
  return setState({ categories: [..._state.categories, category] });
}

export function deleteCategory(id) {
  return setState({ categories: _state.categories.filter((c) => c.id !== id) });
}

export function upsertOffer(offer) {
  const exists = _state.offers.find((o) => o.id === offer.id);
  if (exists) {
    return setState({
      offers: _state.offers.map((o) => (o.id === offer.id ? { ...o, ...offer } : o)),
    });
  }
  return setState({ offers: [..._state.offers, offer] });
}

export function deleteOffer(id) {
  return setState({ offers: _state.offers.filter((o) => o.id !== id) });
}
