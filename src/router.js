/**
 * Hash-based SPA router with page transitions.
 */

import { $, setHTML } from './utils/dom.js';

const routes = new Map();
let _currentPage = null; // eslint-disable-line no-unused-vars
let _currentCleanup = null;

/**
 * Register a route.
 * @param {string} pattern — hash pattern (e.g., 'home', 'product/:id')
 * @param {(params: object) => Promise<{ html: string, init?: () => (() => void)|void }>} handler
 */
export function route(pattern, handler) {
  routes.set(pattern, handler);
}

/** Initialize the router */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

/** Navigate programmatically */
export function navigate(hash) {
  location.hash = hash;
}

/** Get current hash without # */
export function getCurrentHash() {
  return location.hash.slice(1) || 'home';
}

async function handleRoute() {
  const hash = getCurrentHash();
  const app = $('#app');
  if (!app) return;

  // Cleanup previous page
  if (typeof _currentCleanup === 'function') {
    try { _currentCleanup(); } catch { /* ignore */ }
    _currentCleanup = null;
  }

  // Match route
  const { handler, params } = matchRoute(hash);
  if (!handler) {
    setHTML(app, `
      <div class="page section">
        <div class="container text-center">
          <div class="empty-state">
            <div class="empty-state__icon">🔍</div>
            <h2 class="empty-state__title">الصفحة غير موجودة</h2>
            <p class="empty-state__text">الصفحة التي تبحث عنها غير موجودة.</p>
            <a href="#home" class="btn btn--primary">العودة للرئيسية</a>
          </div>
        </div>
      </div>
    `);
    return;
  }

  // Page transition: fade out
  app.style.opacity = '0';
  app.style.transform = 'translateY(10px)';

  try {
    const result = await handler(params);
    setHTML(app, result.html);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Page transition: fade in
    requestAnimationFrame(() => {
      app.style.transition = 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';
    });

    // Initialize page-specific JS
    if (typeof result.init === 'function') {
      _currentCleanup = result.init();
    }

    _currentPage = hash;

    // Trigger reveal animations
    initRevealAnimations();
  } catch {
    setHTML(app, `
      <div class="page section">
        <div class="container text-center">
          <div class="empty-state">
            <div class="empty-state__icon">⚠️</div>
            <h2 class="empty-state__title">حدث خطأ</h2>
            <p class="empty-state__text">حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.</p>
            <a href="#home" class="btn btn--primary">العودة للرئيسية</a>
          </div>
        </div>
      </div>
    `);
    app.style.opacity = '1';
    app.style.transform = 'translateY(0)';
  }
}

function matchRoute(hash) {
  // Direct match
  if (routes.has(hash)) {
    return { handler: routes.get(hash), params: {} };
  }

  // Pattern matching (e.g., product/:id)
  for (const [pattern, handler] of routes) {
    const patternParts = pattern.split('/');
    const hashParts = hash.split('/');

    if (patternParts.length !== hashParts.length) continue;

    const params = {};
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = hashParts[i];
      } else if (patternParts[i] !== hashParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler, params };
  }

  return { handler: null, params: {} };
}

/** Simple intersection-observer based reveal (fallback when GSAP not loaded) */
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    reveals.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
          el.style.opacity = '1';
          el.style.transform = 'none';
          observer.unobserve(el);
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}
