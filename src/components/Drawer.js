/**
 * Slide-out drawer component.
 */

import { $, addClass, removeClass } from '../utils/dom.js';

let _currentDrawer = null;

/**
 * Open a drawer.
 * @param {{ title: string, body: string, footer?: string, width?: string }} opts
 */
export function openDrawer({ title, body, footer = '', width }) {
  closeDrawer(); // close any existing

  const overlay = $('#drawerOverlay');
  if (!overlay) return;

  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  if (width) drawer.style.width = width;

  drawer.innerHTML = `
    <div class="drawer__header">
      <h2 class="drawer__title">${title}</h2>
      <button class="drawer__close js-drawer-close" aria-label="إغلاق">✕</button>
    </div>
    <div class="drawer__body">${body}</div>
    ${footer ? `<div class="drawer__footer">${footer}</div>` : ''}
  `;

  overlay.appendChild(drawer);
  _currentDrawer = drawer;

  // Animate in
  requestAnimationFrame(() => {
    addClass(overlay, 'is-open');
    addClass(drawer, 'is-open');
  });

  // Close handlers
  overlay.addEventListener('click', handleOverlayClick);
  drawer.querySelector('.js-drawer-close')?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', handleEscape);
  document.body.style.overflow = 'hidden';
}

/** Close current drawer */
export function closeDrawer() {
  if (!_currentDrawer) return;
  const overlay = $('#drawerOverlay');

  removeClass(_currentDrawer, 'is-open');
  if (overlay) removeClass(overlay, 'is-open');

  const drawer = _currentDrawer;
  _currentDrawer = null;

  setTimeout(() => drawer.remove(), 500);

  overlay?.removeEventListener('click', handleOverlayClick);
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
}

/** Update drawer body content */
export function updateDrawerBody(html) {
  if (!_currentDrawer) return;
  const body = _currentDrawer.querySelector('.drawer__body');
  if (body) body.innerHTML = html;
}

function handleOverlayClick(e) {
  if (e.target.id === 'drawerOverlay') closeDrawer();
}

function handleEscape(e) {
  if (e.key === 'Escape') closeDrawer();
}
