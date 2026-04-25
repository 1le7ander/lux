/**
 * LUXE — Application entry point.
 * Bootstraps state, router, components, animations.
 */

import { route, initRouter } from './router.js';
import { getState, setProducts, setCategories, setOffers, setSettings } from './state.js';
import { defaultProducts, defaultCategories, defaultOffers, defaultSettings } from './data/seed.js';
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderAnnouncementBar } from './components/AnnouncementBar.js';
import { initAnimations } from './animations/init.js';
import { wrapAdminLayout, initAdminLayout } from './pages/admin/AdminLayout.js';
import { isAdminLoggedIn } from './state.js';

/* ── Seed default data if empty ─────────────────── */
function seedData() {
  const state = getState();
  if (!state.products.length) setProducts(defaultProducts);
  if (!state.categories.length) setCategories(defaultCategories);
  if (!state.offers.length) setOffers(defaultOffers);
  if (!Object.keys(state.settings).length) setSettings(defaultSettings);
}

/* ── Register routes ────────────────────────────── */
function registerRoutes() {
  // Storefront
  route('home', async () => {
    const { default: HomePage } = await import('./pages/Home.js');
    return HomePage();
  });

  route('products', async () => {
    const { default: ProductsPage } = await import('./pages/Products.js');
    return ProductsPage();
  });

  route('categories', async () => {
    const { default: CategoriesPage } = await import('./pages/Categories.js');
    return CategoriesPage();
  });

  route('category/:id', async (params) => {
    const { default: CategoryPage } = await import('./pages/Category.js');
    return CategoryPage(params);
  });

  route('product/:id', async (params) => {
    const { default: ProductPage } = await import('./pages/Product.js');
    return ProductPage(params);
  });

  route('cart', async () => {
    const { default: CartPage } = await import('./pages/Cart.js');
    return CartPage();
  });

  route('checkout', async () => {
    const { default: CheckoutPage } = await import('./pages/Checkout.js');
    return CheckoutPage();
  });

  route('orders', async () => {
    const { default: OrdersPage } = await import('./pages/Orders.js');
    return OrdersPage();
  });

  route('about', async () => {
    const { default: AboutPage } = await import('./pages/About.js');
    return AboutPage();
  });

  route('contact', async () => {
    const { default: ContactPage } = await import('./pages/Contact.js');
    return ContactPage();
  });

  // Admin
  route('admin', async () => {
    if (isAdminLoggedIn()) {
      location.hash = '#admin/dashboard';
      return { html: '' };
    }
    const { default: AdminLoginPage } = await import('./pages/admin/AdminLogin.js');
    return AdminLoginPage();
  });

  route('admin/dashboard', async () => {
    const { default: AdminDashboardPage } = await import('./pages/admin/AdminDashboard.js');
    const page = AdminDashboardPage();
    return adminRoute(page, '#admin/dashboard');
  });

  route('admin/products', async () => {
    const { default: AdminProductsPage } = await import('./pages/admin/AdminProducts.js');
    const page = AdminProductsPage();
    return adminRoute(page, '#admin/products');
  });

  route('admin/orders', async () => {
    const { default: AdminOrdersPage } = await import('./pages/admin/AdminOrders.js');
    const page = AdminOrdersPage();
    return adminRoute(page, '#admin/orders');
  });

  route('admin/categories', async () => {
    const { default: AdminCategoriesPage } = await import('./pages/admin/AdminCategories.js');
    const page = AdminCategoriesPage();
    return adminRoute(page, '#admin/categories');
  });

  route('admin/offers', async () => {
    const { default: AdminOffersPage } = await import('./pages/admin/AdminOffers.js');
    const page = AdminOffersPage();
    return adminRoute(page, '#admin/offers');
  });

  route('admin/settings', async () => {
    const { default: AdminSettingsPage } = await import('./pages/admin/AdminSettings.js');
    const page = AdminSettingsPage();
    return adminRoute(page, '#admin/settings');
  });
}

function adminRoute(page, currentHash) {
  if (!isAdminLoggedIn()) {
    location.hash = '#admin';
    return { html: '' };
  }
  return {
    html: wrapAdminLayout(page.html, currentHash),
    init() {
      initAdminLayout();
      if (typeof page.init === 'function') page.init();
    },
  };
}

/* ── Preloader ──────────────────────────────────── */
function dismissPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  preloader.style.opacity = '0';
  preloader.style.pointerEvents = 'none';
  setTimeout(() => preloader.remove(), 800);
}

/* ── Boot ────────────────────────────────────────── */
async function boot() {
  seedData();
  renderAnnouncementBar();
  renderHeader();
  renderFooter();
  registerRoutes();
  initRouter();

  // Dismiss preloader
  setTimeout(dismissPreloader, 1200);

  // Animations (async, non-blocking)
  initAnimations();

  // Optional services (non-blocking)
  import('./services/firebase.js')
    .then((m) => m.initFirebase())
    .catch(() => {});
  import('./services/email.js')
    .then((m) => m.initEmailJS())
    .catch(() => {});
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
