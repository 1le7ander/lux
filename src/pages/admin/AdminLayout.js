/**
 * Admin layout — sidebar navigation + content area.
 */

import { isAdminLoggedIn, clearAdminSession } from '../../state.js';
import { logout as apiLogout } from '../../api/client.js';

const ADMIN_NAV = [
  { hash: '#admin/dashboard', label: 'لوحة التحكم', icon: '📊' },
  { hash: '#admin/products', label: 'المنتجات', icon: '🛍️' },
  { hash: '#admin/orders', label: 'الطلبات', icon: '📦' },
  { hash: '#admin/categories', label: 'التصنيفات', icon: '📂' },
  { hash: '#admin/offers', label: 'العروض', icon: '🏷️' },
  { hash: '#admin/settings', label: 'الإعدادات', icon: '⚙️' },
];

/**
 * Wrap admin page content in admin layout with sidebar.
 */
export function wrapAdminLayout(pageHTML, currentHash) {
  if (!isAdminLoggedIn()) {
    location.hash = '#admin';
    return '';
  }

  return `
    <div class="admin-layout">
      <aside class="admin-sidebar glass">
        <div class="admin-sidebar__header">
          <a href="#home" class="admin-sidebar__logo gold-text">LUXE</a>
          <span class="text-muted text-sm">لوحة التحكم</span>
        </div>

        <nav class="admin-sidebar__nav">
          ${ADMIN_NAV.map((item) => `
            <a href="${item.hash}" class="admin-sidebar__link ${currentHash === item.hash ? 'is-active' : ''}">
              <span class="admin-sidebar__link-icon">${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </nav>

        <div class="admin-sidebar__footer">
          <a href="#home" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">🏠</span>
            <span>العودة للمتجر</span>
          </a>
          <button class="admin-sidebar__link" id="adminLogout" style="width:100%;text-align:start;border:none;background:none;cursor:pointer;color:var(--danger)">
            <span class="admin-sidebar__link-icon">🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main class="admin-content">
        ${pageHTML}
      </main>
    </div>
  `;
}

export function initAdminLayout() {
  const logoutBtn = document.getElementById('adminLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      apiLogout();
      clearAdminSession();
      location.hash = '#admin';
    });
  }
}
