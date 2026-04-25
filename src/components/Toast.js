/**
 * Toast notification system.
 */

import { $, createElement } from '../utils/dom.js';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const DURATIONS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3500,
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} [duration]
 */
export function showToast(message, type = 'info', duration) {
  const container = $('#toastContainer');
  if (!container) return;

  const ms = duration ?? DURATIONS[type] ?? 3000;

  const toast = createElement('div', { className: `toast toast--${type}` });
  toast.innerHTML = `
    <span class="toast__icon">${ICONS[type] || 'ℹ'}</span>
    <div class="toast__content">
      <p class="toast__message">${message}</p>
    </div>
    <button class="toast__close" aria-label="إغلاق">×</button>
    <div class="toast__progress" style="width:100%; transition-duration:${ms}ms"></div>
  `;

  container.appendChild(toast);

  // Start progress bar shrink
  requestAnimationFrame(() => {
    const bar = toast.querySelector('.toast__progress');
    if (bar) bar.style.width = '0%';
  });

  // Close on click
  toast.querySelector('.toast__close')?.addEventListener('click', () => dismiss(toast));

  // Auto dismiss
  const timer = setTimeout(() => dismiss(toast), ms);

  // Pause on hover
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => dismiss(toast), 1500);
  });
}

function dismiss(toast) {
  if (toast.classList.contains('is-exiting')) return;
  toast.classList.add('is-exiting');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
  // Fallback removal
  setTimeout(() => toast.remove(), 500);
}
