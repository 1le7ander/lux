/**
 * LUXE API Client — communicates with FastAPI backend.
 * Handles JWT auth, token refresh, and request/response formatting.
 */

const TOKEN_KEY = 'luxe_access_token';
const REFRESH_KEY = 'luxe_refresh_token';

let _accessToken = sessionStorage.getItem(TOKEN_KEY);
let _refreshToken = sessionStorage.getItem(REFRESH_KEY);
let _refreshPromise = null;

function persistTokens() {
  if (_accessToken) sessionStorage.setItem(TOKEN_KEY, _accessToken);
  else sessionStorage.removeItem(TOKEN_KEY);
  if (_refreshToken) sessionStorage.setItem(REFRESH_KEY, _refreshToken);
  else sessionStorage.removeItem(REFRESH_KEY);
}

const API_BASE = import.meta.env.VITE_API_URL || '';

function headers(withAuth = false) {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth && _accessToken) {
    h['Authorization'] = `Bearer ${_accessToken}`;
  }
  return h;
}

async function refreshAccessToken() {
  if (!_refreshToken) throw new Error('لا يوجد توكن تحديث');
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: _refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) {
        _accessToken = null;
        _refreshToken = null;
        persistTokens();
        throw new Error('فشل تحديث التوكن');
      }
      const data = await res.json();
      _accessToken = data.access_token;
      persistTokens();
      return _accessToken;
    })
    .finally(() => { _refreshPromise = null; });
  return _refreshPromise;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  let res = await fetch(url, options);

  if (res.status === 401 && _refreshToken && options.headers?.Authorization) {
    try {
      await refreshAccessToken();
      options.headers.Authorization = `Bearer ${_accessToken}`;
      res = await fetch(url, options);
    } catch {
      throw new Error('جلسة منتهية — سجل دخول مرة أخرى');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'حدث خطأ غير متوقع' }));
    throw new Error(err.detail || `خطأ ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}


// ── Auth ─────────────────────────────────────────────────
export async function login(username, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, password }),
  });
  _accessToken = data.access_token;
  _refreshToken = data.refresh_token;
  persistTokens();
  return data;
}

export function logout() {
  _accessToken = null;
  _refreshToken = null;
  persistTokens();
}

export function isLoggedIn() {
  return !!_accessToken;
}


// ── Categories ───────────────────────────────────────────
export function getCategories() {
  return request('/api/categories', { headers: headers() });
}

export function getCategory(id) {
  return request(`/api/categories/${id}`, { headers: headers() });
}

export function createCategory(data) {
  return request('/api/admin/categories', {
    method: 'POST', headers: headers(true), body: JSON.stringify(data),
  });
}

export function updateCategory(id, data) {
  return request(`/api/admin/categories/${id}`, {
    method: 'PUT', headers: headers(true), body: JSON.stringify(data),
  });
}

export function deleteCategory(id) {
  return request(`/api/admin/categories/${id}`, {
    method: 'DELETE', headers: headers(true),
  });
}


// ── Products ─────────────────────────────────────────────
export function getProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category_id) qs.set('category_id', params.category_id);
  if (params.featured !== undefined) qs.set('featured', params.featured);
  if (params.page) qs.set('page', params.page);
  if (params.limit) qs.set('limit', params.limit);
  const q = qs.toString();
  return request(`/api/products${q ? '?' + q : ''}`, { headers: headers() });
}

export function getProduct(id) {
  return request(`/api/products/${id}`, { headers: headers() });
}

export function createProduct(data) {
  return request('/api/admin/products', {
    method: 'POST', headers: headers(true), body: JSON.stringify(data),
  });
}

export function updateProduct(id, data) {
  return request(`/api/admin/products/${id}`, {
    method: 'PUT', headers: headers(true), body: JSON.stringify(data),
  });
}

export function deleteProduct(id) {
  return request(`/api/admin/products/${id}`, {
    method: 'DELETE', headers: headers(true),
  });
}

export async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE}/api/admin/products/${productId}/images`;
  const res = await fetch(url, {
    method: 'POST',
    headers: _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'فشل رفع الصورة' }));
    throw new Error(err.detail || `خطأ ${res.status}`);
  }
  return res.json();
}

export function deleteProductImage(productId, imageId) {
  return request(`/api/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE', headers: headers(true),
  });
}


// ── Orders ───────────────────────────────────────────────
export function createOrder(data) {
  return request('/api/orders', {
    method: 'POST', headers: headers(), body: JSON.stringify(data),
  });
}

export function trackOrder(ref) {
  return request(`/api/orders/${ref}`, { headers: headers() });
}

export function getOrders(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', params.page);
  if (params.limit) qs.set('limit', params.limit);
  const q = qs.toString();
  return request(`/api/admin/orders${q ? '?' + q : ''}`, { headers: headers(true) });
}

export function updateOrderStatus(orderId, status) {
  return request(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT', headers: headers(true), body: JSON.stringify({ status }),
  });
}


// ── Offers ───────────────────────────────────────────────
export function getOffers() {
  return request('/api/offers', { headers: headers() });
}

export function getAdminOffers() {
  return request('/api/admin/offers', { headers: headers(true) });
}

export function createOffer(data) {
  return request('/api/admin/offers', {
    method: 'POST', headers: headers(true), body: JSON.stringify(data),
  });
}

export function updateOffer(id, data) {
  return request(`/api/admin/offers/${id}`, {
    method: 'PUT', headers: headers(true), body: JSON.stringify(data),
  });
}

export function deleteOffer(id) {
  return request(`/api/admin/offers/${id}`, {
    method: 'DELETE', headers: headers(true),
  });
}


// ── Settings ─────────────────────────────────────────────
export function getSettings() {
  return request('/api/settings', { headers: headers() });
}

export function getSetting(key) {
  return request(`/api/settings/${key}`, { headers: headers() });
}

export function updateSetting(key, value) {
  return request(`/api/admin/settings/${key}`, {
    method: 'PUT', headers: headers(true), body: JSON.stringify({ value }),
  });
}
