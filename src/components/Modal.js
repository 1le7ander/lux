/**
 * Modal dialog component.
 */

import { $, addClass, removeClass } from '../utils/dom.js';

let _currentModal = null;

/**
 * Open a modal.
 * @param {{ title?: string, body: string, footer?: string, className?: string }} opts
 */
export function openModal({ title = '', body, footer = '', className = '' }) {
  closeModal();

  const overlay = $('#modalOverlay');
  if (!overlay) return;

  const modal = document.createElement('div');
  modal.className = `modal ${className}`.trim();

  modal.innerHTML = `
    ${title ? `
      <div class="modal__header">
        <h2 class="modal__title">${title}</h2>
        <button class="modal__close js-modal-close" aria-label="إغلاق">✕</button>
      </div>
    ` : `
      <button class="modal__close js-modal-close" style="position:absolute;top:16px;left:16px;z-index:2" aria-label="إغلاق">✕</button>
    `}
    <div class="modal__body">${body}</div>
    ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
  `;

  overlay.appendChild(modal);
  _currentModal = modal;

  requestAnimationFrame(() => {
    addClass(overlay, 'is-open');
    overlay.setAttribute('aria-hidden', 'false');
  });

  overlay.addEventListener('click', handleOverlayClick);
  modal.querySelectorAll('.js-modal-close').forEach((btn) => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', handleEscape);
  document.body.style.overflow = 'hidden';
}

/** Close current modal */
export function closeModal() {
  if (!_currentModal) return;
  const overlay = $('#modalOverlay');

  if (overlay) {
    removeClass(overlay, 'is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  const modal = _currentModal;
  _currentModal = null;

  setTimeout(() => modal.remove(), 400);

  overlay?.removeEventListener('click', handleOverlayClick);
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
}

/**
 * Show success modal (order confirmation style).
 */
export function showSuccessModal({ title, message, ref }) {
  const body = `
    <div class="success-modal">
      <div class="success-check">
        <svg width="36" height="36" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 style="font-size:var(--text-h2); margin-bottom:var(--space-3)">${title}</h3>
      <p style="color:var(--text-secondary); margin-bottom:var(--space-4)">${message}</p>
      ${ref ? `<div class="success-ref">${ref}</div>` : ''}
    </div>
  `;
  openModal({
    body,
    footer: `<button class="btn btn--primary btn--full js-modal-close">حسناً</button>`,
  });
}

function handleOverlayClick(e) {
  if (e.target.id === 'modalOverlay') closeModal();
}

function handleEscape(e) {
  if (e.key === 'Escape') closeModal();
}
