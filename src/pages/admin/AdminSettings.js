/**
 * Admin settings page.
 */

import { getState, setSettings } from '../../state.js';
import { $, esc } from '../../utils/dom.js';
import { showToast } from '../../components/Toast.js';
import { collectFormData } from '../../utils/validation.js';

export default function AdminSettingsPage() {
  const { settings } = getState();

  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header">
          <h1 class="admin-page__title">الإعدادات</h1>
          <p class="text-muted">إعدادات المتجر العامة</p>
        </div>

        <form id="settingsForm" class="glass" style="padding:var(--space-8);border-radius:var(--radius-lg);margin-top:var(--space-6)">
          <div class="form-section">
            <h3 class="form-section__title">🏪 معلومات المتجر</h3>
            <div class="form-row form-row--2">
              <div class="form-group">
                <label class="form-label">اسم المتجر</label>
                <input type="text" name="storeName" class="form-input" value="${esc(settings.storeName || 'LUXE')}" />
              </div>
              <div class="form-group">
                <label class="form-label">العملة</label>
                <input type="text" name="currency" class="form-input" value="${esc(settings.currency || 'DZD')}" readonly />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">وصف المتجر</label>
              <textarea name="storeDescription" class="form-input form-textarea" rows="2">${esc(settings.storeDescription || '')}</textarea>
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section__title">📢 شريط الإعلانات</h3>
            <div class="form-group">
              <label class="form-label">نص الإعلان</label>
              <input type="text" name="announcement" class="form-input" value="${esc(settings.announcement || '')}" placeholder="🎉 شحن مجاني للطلبات فوق 15,000 د.ج" />
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section__title">🚚 الشحن</h3>
            <div class="form-group">
              <label class="form-label">حد الشحن المجاني (د.ج)</label>
              <input type="number" name="freeShippingThreshold" class="form-input" value="${settings.freeShippingThreshold ?? 15000}" min="0" />
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section__title">🔧 الميزات</h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-3)">
              <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
                <input type="checkbox" name="enableOrders" ${settings.enableOrders !== false ? 'checked' : ''} />
                تفعيل الطلبات
              </label>
              <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
                <input type="checkbox" name="enableWhatsapp" ${settings.enableWhatsapp !== false ? 'checked' : ''} />
                تفعيل واتساب
              </label>
              <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
                <input type="checkbox" name="enableEmail" ${settings.enableEmail !== false ? 'checked' : ''} />
                تفعيل البريد الإلكتروني
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn--gold btn--lg" style="margin-top:var(--space-6)">💾 حفظ الإعدادات</button>
        </form>
      </div>
    `,
    init() {
      const form = $('#settingsForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const data = collectFormData(form);

          setSettings({
            storeName: data.storeName || 'LUXE',
            storeDescription: data.storeDescription || '',
            currency: data.currency || 'DZD',
            currencySymbol: 'د.ج',
            announcement: data.announcement || '',
            freeShippingThreshold: Number(data.freeShippingThreshold) || 15000,
            enableOrders: form.querySelector('[name="enableOrders"]')?.checked ?? true,
            enableWhatsapp: form.querySelector('[name="enableWhatsapp"]')?.checked ?? true,
            enableEmail: form.querySelector('[name="enableEmail"]')?.checked ?? true,
          });

          showToast('تم حفظ الإعدادات بنجاح', 'success');
        });
      }
    },
  };
}
