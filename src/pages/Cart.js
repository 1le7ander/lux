/**
 * Shopping cart page.
 */

import { getState, removeFromCart, updateCartQty, getCartTotal, clearCart } from '../state.js';
import { subscribe } from '../state.js';
import { $, delegate, esc, setHTML } from '../utils/dom.js';
import { fmtDZD } from '../utils/format.js';
import { showToast } from '../components/Toast.js';

export default function CartPage() {
  return {
    html: `
      <div class="page section">
        <div class="container container--sm">
          <div class="section__header" style="text-align:start;margin-bottom:var(--space-8)">
            <span class="section__label">🛒 السلة</span>
            <h1 class="page-title">سلة التسوّق</h1>
          </div>
          <div id="cartContent">${renderCartContent()}</div>
        </div>
      </div>
    `,
    init() {
      const cleanups = [];

      cleanups.push(subscribe(() => {
        const el = $('#cartContent');
        if (el) setHTML(el, renderCartContent());
      }));

      // Quantity change
      cleanups.push(delegate(document, 'click', '.js-cart-minus', (_e, btn) => {
        const { id, size, color } = btn.dataset;
        const item = getState().cart.find(
          (i) => i.id === id && i.size === (size ?? '') && i.color === (color ?? '')
        );
        if (item) updateCartQty(id, item.qty - 1, size ?? '', color ?? '');
      }));

      cleanups.push(delegate(document, 'click', '.js-cart-plus', (_e, btn) => {
        const { id, size, color } = btn.dataset;
        const item = getState().cart.find(
          (i) => i.id === id && i.size === (size ?? '') && i.color === (color ?? '')
        );
        if (item) updateCartQty(id, item.qty + 1, size ?? '', color ?? '');
      }));

      cleanups.push(delegate(document, 'click', '.js-cart-remove', (_e, btn) => {
        const { id, size, color } = btn.dataset;
        removeFromCart(id, size ?? '', color ?? '');
        showToast('تم إزالة المنتج من السلة', 'info');
      }));

      cleanups.push(delegate(document, 'click', '#clearCartBtn', () => {
        clearCart();
        showToast('تم تفريغ السلة', 'info');
      }));

      return () => cleanups.forEach((fn) => fn());
    },
  };
}

function renderCartContent() {
  const { cart } = getState();

  if (!cart.length) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <h3 class="empty-state__title">سلتك فارغة</h3>
        <p class="empty-state__text">لم تضف أي منتج بعد. تصفح منتجاتنا وأضف ما يعجبك!</p>
        <a href="#products" class="btn btn--primary mt-4">تصفّح المنتجات</a>
      </div>
    `;
  }

  const total = getCartTotal();

  return `
    <div class="cart-items">
      ${cart.map((item) => `
        <div class="cart-item">
          <div class="cart-item__image">
            ${item.image
              ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`
              : `<div class="img-placeholder">📷</div>`}
          </div>
          <div class="cart-item__details">
            <a href="#product/${esc(item.id)}" class="cart-item__name">${esc(item.name)}</a>
            <div class="cart-item__meta">
              ${item.size ? `<span class="pill pill--sm">${esc(item.size)}</span>` : ''}
              ${item.color ? `<span class="pill pill--sm">${esc(item.color)}</span>` : ''}
            </div>
            <div class="cart-item__price">${fmtDZD(item.price)}</div>
          </div>
          <div class="cart-item__actions">
            <div class="qty-selector">
              <button class="qty-selector__btn js-cart-minus" data-id="${esc(item.id)}" data-size="${esc(item.size)}" data-color="${esc(item.color)}">−</button>
              <span class="qty-selector__value">${item.qty}</span>
              <button class="qty-selector__btn js-cart-plus" data-id="${esc(item.id)}" data-size="${esc(item.size)}" data-color="${esc(item.color)}">+</button>
            </div>
            <div class="cart-item__subtotal">${fmtDZD(item.price * item.qty)}</div>
            <button class="btn btn--ghost btn--sm js-cart-remove" data-id="${esc(item.id)}" data-size="${esc(item.size)}" data-color="${esc(item.color)}" aria-label="إزالة">✕</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="cart-summary glass">
      <div class="cart-summary__row">
        <span>المجموع الفرعي</span>
        <span>${fmtDZD(total)}</span>
      </div>
      <div class="cart-summary__row">
        <span>التوصيل</span>
        <span class="text-muted">يحدد عند الطلب</span>
      </div>
      <div class="divider" style="margin:var(--space-3) 0"></div>
      <div class="cart-summary__row" style="font-size:var(--text-lg);font-weight:700">
        <span>المجموع</span>
        <span class="gold-text">${fmtDZD(total)}</span>
      </div>
      <div style="display:flex;gap:var(--space-3);margin-top:var(--space-5)">
        <a href="#checkout" class="btn btn--gold btn--lg" style="flex:1">إتمام الطلب</a>
        <button class="btn btn--ghost btn--sm" id="clearCartBtn">تفريغ السلة</button>
      </div>
    </div>
  `;
}
