/**
 * Admin orders management.
 */

import { getState, updateOrderStatus } from '../../state.js';
import { delegate, esc, setHTML } from '../../utils/dom.js';
import { fmtDZD, fmtDate } from '../../utils/format.js';
import { showToast } from '../../components/Toast.js';

const STATUSES = [
  { value: 'pending', label: 'قيد الانتظار', icon: '⏳' },
  { value: 'confirmed', label: 'مؤكد', icon: '✓' },
  { value: 'delivering', label: 'قيد التوصيل', icon: '🚚' },
  { value: 'delivered', label: 'تم التوصيل', icon: '📦' },
  { value: 'cancelled', label: 'ملغي', icon: '✕' },
];

export default function AdminOrdersPage() {
  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header">
          <h1 class="admin-page__title">إدارة الطلبات</h1>
          <p class="text-muted">${getState().orders.length} طلب</p>
        </div>
        <div id="ordersTable">${renderOrdersTable()}</div>
      </div>
    `,
    init() {
      const cleanups = [];

      cleanups.push(delegate(document, 'change', '.js-order-status', (_e, select) => {
        const orderId = select.dataset.orderId;
        const newStatus = select.value;
        updateOrderStatus(orderId, newStatus);
        setHTML('#ordersTable', renderOrdersTable());
        showToast('تم تحديث حالة الطلب', 'success');
      }));

      return () => cleanups.forEach((fn) => fn());
    },
  };
}

function renderOrdersTable() {
  const { orders } = getState();
  if (!orders.length) {
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
          ${orders.map((o) => `
            <tr>
              <td style="font-weight:600">#${esc(o.ref || o.id)}</td>
              <td>
                <div>${esc(o.customer?.fullName || '—')}</div>
                <div class="text-sm text-muted">${esc(o.customer?.phone || '')}</div>
              </td>
              <td>${esc(o.customer?.wilaya || '—')}</td>
              <td>
                <div class="text-sm">
                  ${o.items?.map((i) => `${esc(i.name)} ×${i.qty}`).join('<br>') || '—'}
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
              <td class="text-sm text-muted" style="white-space:nowrap">${fmtDate(o.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
