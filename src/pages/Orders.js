/**
 * Customer orders page — order history and tracking.
 */

import { getState } from '../state.js';
import { esc } from '../utils/dom.js';
import { fmtDZD, fmtDate } from '../utils/format.js';

const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', class: 'pending', icon: '⏳' },
  confirmed: { label: 'مؤكد', class: 'confirmed', icon: '✓' },
  delivering: { label: 'قيد التوصيل', class: 'delivering', icon: '🚚' },
  delivered: { label: 'تم التوصيل', class: 'delivered', icon: '📦' },
  cancelled: { label: 'ملغي', class: 'cancelled', icon: '✕' },
};

export default function OrdersPage() {
  const { orders } = getState();

  return {
    html: `
      <div class="page section">
        <div class="container container--sm">
          <div class="section__header" style="text-align:start;margin-bottom:var(--space-8)">
            <span class="section__label">📦 طلباتي</span>
            <h1 class="page-title">تتبع طلباتك</h1>
          </div>

          ${orders.length ? `
            <div class="orders-list">
              ${orders.map(orderCardHTML).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state__icon">📦</div>
              <h3 class="empty-state__title">لا توجد طلبات</h3>
              <p class="empty-state__text">لم تقم بأي طلب بعد. تصفح منتجاتنا وابدأ التسوّق!</p>
              <a href="#products" class="btn btn--primary mt-4">تصفّح المنتجات</a>
            </div>
          `}
        </div>
      </div>
    `,
  };
}

function orderCardHTML(order) {
  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;

  return `
    <div class="order-card glass">
      <div class="order-card__header">
        <div>
          <div class="order-card__ref">#${esc(order.ref || order.id)}</div>
          <div class="order-card__date text-muted text-sm">${fmtDate(order.createdAt)}</div>
        </div>
        <span class="status-badge status-badge--${status.class}">
          ${status.icon} ${status.label}
        </span>
      </div>

      <div class="order-card__items">
        ${order.items.map((item) => `
          <div class="order-card__item">
            <span>${esc(item.name)} × ${item.qty}</span>
            <span>${fmtDZD(item.price * item.qty)}</span>
          </div>
        `).join('')}
      </div>

      <div class="order-card__footer">
        <div class="order-card__customer text-sm text-muted">
          ${esc(order.customer?.fullName || '')} — ${esc(order.customer?.phone || '')}
        </div>
        <div class="order-card__total">
          <span class="text-muted">المجموع:</span>
          <span class="gold-text" style="font-weight:700">${fmtDZD(order.total)}</span>
        </div>
      </div>
    </div>
  `;
}
