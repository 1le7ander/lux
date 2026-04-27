/**
 * Admin orders management — via backend API.
 */

import { getState, setOrders } from '../../state.js';
import { $, delegate, esc, setHTML } from '../../utils/dom.js';
import { fmtDZD, fmtDate } from '../../utils/format.js';
import { showToast } from '../../components/Toast.js';
import * as api from '../../api/client.js';

const STATUSES = [
  { value: 'pending', label: 'قيد الانتظار', icon: '⏳' },
  { value: 'confirmed', label: 'مؤكد', icon: '✓' },
  { value: 'delivering', label: 'قيد التوصيل', icon: '🚚' },
  { value: 'delivered', label: 'تم التوصيل', icon: '📦' },
  { value: 'cancelled', label: 'ملغي', icon: '✕' },
];

let _orders = [];

export default function AdminOrdersPage() {
  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header">
          <h1 class="admin-page__title">إدارة الطلبات</h1>
          <p class="text-muted" id="ordersCount">جاري التحميل...</p>
        </div>
        <div id="ordersTable"><p class="text-muted text-center" style="padding:var(--space-10)">جاري تحميل الطلبات...</p></div>
      </div>
    `,
    async init() {
      await loadOrders();

      const cleanups = [];

      cleanups.push(delegate(document, 'change', '.js-order-status', async (_e, select) => {
        const orderId = select.dataset.orderId;
        const newStatus = select.value;
        try {
          await api.updateOrderStatus(orderId, newStatus);
          showToast('تم تحديث حالة الطلب', 'success');
          await loadOrders();
        } catch (err) {
          showToast(err.message || 'فشل تحديث الحالة', 'error');
        }
      }));

      return () => cleanups.forEach((fn) => fn());
    },
  };
}

async function loadOrders() {
  try {
    const result = await api.getOrders({ limit: 200 });
    _orders = result?.items ?? result ?? [];
    if (Array.isArray(_orders)) setOrders(_orders);
  } catch {
    _orders = getState().orders;
  }
  setHTML('#ordersTable', renderOrdersTable());
  const countEl = $('#ordersCount');
  if (countEl) countEl.textContent = `${_orders.length} طلب`;
}

function renderOrdersTable() {
  if (!_orders.length) {
    return '<p class="text-muted text-center" style="padding:var(--space-10)">لا توجد طلبات بعد.</p>';
  }

  return `
    <div class="data-table-wrap glass" style="margin-top:var(--space-6)">
      <table class="data-table">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>العميل</th>
            <th>الولاية</th>
            <th>المنتجات</th>
            <th>المجموع</th>
            <th>الحالة</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          ${_orders.map((o) => `
            <tr>
              <td style="font-weight:600">#${esc(o.ref || o.id)}</td>
              <td>
                <div>${esc(o.customer_name ?? o.customer?.fullName ?? '—')}</div>
                <div class="text-sm text-muted">${esc(o.customer_phone ?? o.customer?.phone ?? '')}</div>
              </td>
              <td>${esc(o.customer_wilaya ?? o.customer?.wilaya ?? '—')}</td>
              <td>
                <div class="text-sm">
                  ${(o.items ?? []).map((i) => `${esc(i.product_name ?? i.name)} ×${i.quantity ?? i.qty}`).join('<br>') || '—'}
                </div>
              </td>
              <td class="gold-text" style="font-weight:600">${fmtDZD(o.total)}</td>
              <td>
                <select class="form-input js-order-status" data-order-id="${esc(o.id)}" style="padding:6px 10px;font-size:var(--text-sm);min-width:140px">
                  ${STATUSES.map((s) => `
                    <option value="${s.value}" ${o.status === s.value ? 'selected' : ''}>${s.icon} ${s.label}</option>
                  `).join('')}
                </select>
              </td>
              <td class="text-sm text-muted" style="white-space:nowrap">${fmtDate(o.created_at ?? o.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
