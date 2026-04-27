/**
 * Site header — logo, nav, cart badge, mobile menu.
 */

import { $, $$, delegate, toggleClass } from '../utils/dom.js';
import { subscribe, getCartCount } from '../state.js';
import { throttle } from '../utils/helpers.js';

const NAV_LINKS = [
  { hash: '#home',       label: 'الرئيسية', icon: '🏠' },
  { hash: '#categories', label: 'التصنيفات', icon: '📂' },
  { hash: '#products',   label: 'المنتجات',  icon: '🛍️' },
  { hash: '#about',      label: 'من نحن',   icon: 'ℹ️' },
  { hash: '#contact',    label: 'تواصل',    icon: '📞' },
];

export function renderHeader() {
  const el = $('#siteHeader');
  if (!el) return;

  el.className = 'header';
  el.innerHTML = `
    <div class="header__inner">
      <a href="#home" class="header__logo" aria-label="LUXE الرئيسية">LUXE</a>

      <nav class="header__nav" aria-label="التنقل الرئيسي">
        ${NAV_LINKS.map((l) => `
          <a href="${l.hash}" class="header__link" data-nav="${l.hash}">${l.label}</a>
        `).join('')}
      </nav>

      <div class="header__actions">
        <a href="#cart" class="header__cart-btn" aria-label="السلة">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
          <span class="header__cart-badge" id="cartBadge"></span>
        </a>

        <button class="header__menu-btn" id="menuToggle" aria-label="القائمة" aria-expanded="false">
          <span class="hamburger">
            <span class="hamburger__line"></span>
            <span class="hamburger__line"></span>
            <span class="hamburger__line"></span>
          </span>
        </button>
      </div>
    </div>
  `;

  renderMobileNav();
  initScrollBehavior();
  initMenuToggle();
  updateCartBadge();
  updateActiveNav();

  subscribe(() => updateCartBadge());
  window.addEventListener('hashchange', updateActiveNav);
}

function renderMobileNav() {
  let mobileNav = $('#mobileNav');
  if (!mobileNav) {
    mobileNav = document.createElement('nav');
    mobileNav.id = 'mobileNav';
    mobileNav.className = 'mobile-nav';
    mobileNav.setAttribute('aria-label', 'القائمة المحمولة');
    document.body.appendChild(mobileNav);
  }

  mobileNav.innerHTML = NAV_LINKS.map((l) => `
    <a href="${l.hash}" class="mobile-nav__link" data-nav="${l.hash}">
      <span>${l.icon}</span>
      <span>${l.label}</span>
    </a>
  `).join('') + `
    <a href="#orders" class="mobile-nav__link" data-nav="#orders">
      <span>📦</span><span>طلباتي</span>
    </a>
    <a href="#admin" class="mobile-nav__link" data-nav="#admin">
      <span>🔐</span><span>لوحة التحكم</span>
    </a>
  `;

  delegate(mobileNav, 'click', '.mobile-nav__link', () => {
    closeMobileMenu();
  });
}

function initScrollBehavior() {
  const header = $('#siteHeader');
  if (!header) return;

  const onScroll = throttle(() => {
    const scrolled = window.scrollY > 40;
    toggleClass(header, 'is-scrolled', scrolled);
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMenuToggle() {
  const btn = $('#menuToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const nav = $('#mobileNav');
    const isOpen = nav?.classList.contains('is-open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

function openMobileMenu() {
  const nav = $('#mobileNav');
  const btn = $('#menuToggle');
  if (nav) nav.classList.add('is-open');
  if (btn) {
    btn.classList.add('is-active');
    btn.setAttribute('aria-expanded', 'true');
  }
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const nav = $('#mobileNav');
  const btn = $('#menuToggle');
  if (nav) nav.classList.remove('is-open');
  if (btn) {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

function updateCartBadge() {
  const badge = $('#cartBadge');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count > 0 ? count : '';
}

function updateActiveNav() {
  const hash = location.hash || '#home';
  for (const link of $$('[data-nav]')) {
    toggleClass(link, 'is-active', link.dataset.nav === hash);
  }
}
