/**
 * Admin dashboard — stats, charts, recent orders.
 */

import { getState } from '../../state.js';
import { esc } from '../../utils/dom.js';
import { fmtDZD, fmtDate } from '../../utils/format.js';

export default function AdminDashboardPage() {
  const { products, orders, categories } = getState();

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const recentOrders = orders.slice(0, 5);

  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header">
          <h1 class="admin-page__title">لوحة التحكم</h1>
          <p class="text-muted">مرحباً بك في لوحة التحكم — إليك ملخص أداء المتجر</p>
        </div>

        <div class="admin-stats">
          ${statCard('💰', 'إجمالي الإيرادات', fmtDZD(totalRevenue), 'gold')}
          ${statCard('📦', 'إجمالي الطلبات', orders.length, 'purple')}
          ${statCard('⏳', 'طلبات معلّقة', pendingOrders, 'warning')}
          ${statCard('✓', 'طلبات مكتملة', deliveredOrders, 'success')}
          ${statCard('🛍️', 'المنتجات', products.length, 'purple')}
          ${statCard('📂', 'التصنيفات', categories.length, 'info')}
        </div>

        <div class="admin-grid" style="margin-top:var(--space-8)">
          <div class="admin-card glass">
            <h3 class="admin-card__title">📊 المبيعات</h3>
            <div id="salesChart" style="width:100%;height:250px;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
              <canvas id="salesCanvas"></canvas>
            </div>
          </div>

          <div class="admin-card glass">
            <h3 class="admin-card__title">📦 آخر الطلبات</h3>
            ${recentOrders.length ? `
              <div class="admin-orders-list">
                ${recentOrders.map((o) => `
                  <div class="admin-order-row">
                    <div>
                      <div style="font-weight:600">#${esc(o.ref || o.id)}</div>
                      <div class="text-sm text-muted">${esc(o.customer?.fullName || '—')}</div>
                    </div>
                    <div style="text-align:end">
                      <div class="gold-text">${fmtDZD(o.total)}</div>
                      <div class="text-sm text-muted">${fmtDate(o.createdAt)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-muted text-center">لا توجد طلبات بعد</p>'}
          </div>
        </div>
      </div>
    `,
    init() {
      initSalesChart(orders);
    },
  };
}

function statCard(icon, label, value, color) {
  return `
    <div class="admin-stat glass">
      <div class="admin-stat__icon">${icon}</div>
      <div class="admin-stat__body">
        <div class="admin-stat__value" style="color:var(--${color === 'gold' ? 'gold-base' : color === 'purple' ? 'purple-neon' : color === 'warning' ? 'warning' : color === 'success' ? 'success' : 'info'})">${value}</div>
        <div class="admin-stat__label">${label}</div>
      </div>
    </div>
  `;
}

async function initSalesChart(orders) {
  const canvas = document.getElementById('salesCanvas');
  if (!canvas) return;

  try {
    const chartModule = await import('chart.js/auto');
    const Chart = chartModule.default || chartModule.Chart;

    // Group orders by day (last 7 days)
    const days = [];
    const revenues = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days.push(date.toLocaleDateString('ar-DZ', { weekday: 'short' }));
      const dayOrders = orders.filter(
        (o) => o.createdAt?.startsWith(key) && o.status !== 'cancelled'
      );
      revenues.push(dayOrders.reduce((s, o) => s + (o.total || 0), 0));
    }

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'المبيعات (د.ج)',
            data: revenues,
            backgroundColor: 'rgba(168, 85, 247, 0.5)',
            borderColor: '#a855f7',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#8b8ba0' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          x: {
            ticks: { color: '#8b8ba0' },
            grid: { display: false },
          },
        },
      },
    });
  } catch {
    canvas.parentElement.innerHTML = '<p class="text-muted text-center">لا تتوفر بيانات كافية للرسم البياني</p>';
  }
}
