/**
 * Admin offers management.
 */

import { getState, upsertOffer, deleteOffer } from '../../state.js';
import { $, delegate, esc, setHTML } from '../../utils/dom.js';
import { fmtDate } from '../../utils/format.js';
import { openModal, closeModal } from '../../components/Modal.js';
import { showToast } from '../../components/Toast.js';
import { generateId } from '../../utils/helpers.js';
import { collectFormData } from '../../utils/validation.js';

export default function AdminOffersPage() {
  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-3)">
          <div>
            <h1 class="admin-page__title">إدارة العروض</h1>
            <p class="text-muted">${getState().offers.length} عرض</p>
          </div>
          <button class="btn btn--gold" id="addOfferBtn">+ إضافة عرض</button>
        </div>
        <div id="offersTable">${renderOffersTable()}</div>
      </div>
    `,
    init() {
      const addBtn = $('#addOfferBtn');
      if (addBtn) addBtn.addEventListener('click', () => showOfferModal());

      delegate(document, 'click', '.js-edit-offer', (_e, btn) => {
        const offer = getState().offers.find((o) => o.id === btn.dataset.id);
        if (offer) showOfferModal(offer);
      });

      delegate(document, 'click', '.js-delete-offer', (_e, btn) => {
        if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
          deleteOffer(btn.dataset.id);
          setHTML('#offersTable', renderOffersTable());
          showToast('تم حذف العرض', 'info');
        }
      });
    },
  };
}

function renderOffersTable() {
  const { offers } = getState();
  if (!offers.length) {
    return '<p class="text-muted text-center" style="padding:var(--space-10)">لا توجد عروض.</p>';
  }

  return `
    <div class="data-table-wrap glass" style="margin-top:var(--space-6)">
      <table class="data-table">
        <thead>
          <tr>
            <th>العنوان</th>
            <th>الخصم</th>
            <th>الكود</th>
            <th>ينتهي</th>
            <th>الحالة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${offers.map((o) => `
            <tr>
              <td style="font-weight:500">${esc(o.title)}</td>
              <td class="gold-text">${o.discount}%</td>
              <td><code style="background:var(--bg-surface);padding:2px 8px;border-radius:4px">${esc(o.code || '—')}</code></td>
              <td class="text-sm">${fmtDate(o.expiresAt)}</td>
              <td>
                <span class="pill ${o.active ? 'pill--gold' : 'pill--sm'}">${o.active ? 'نشط' : 'معطّل'}</span>
              </td>
              <td>
                <div style="display:flex;gap:var(--space-2)">
                  <button class="btn btn--ghost btn--sm js-edit-offer" data-id="${esc(o.id)}">✏️</button>
                  <button class="btn btn--ghost btn--sm js-delete-offer" data-id="${esc(o.id)}" style="color:var(--danger)">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showOfferModal(offer = null) {
  const isEdit = offer != null;

  openModal({
    title: isEdit ? 'تعديل العرض' : 'إضافة عرض جديد',
    body: `
      <form id="offerForm">
        <div class="form-group">
          <label class="form-label">عنوان العرض *</label>
          <input type="text" name="title" class="form-input" value="${isEdit ? esc(offer.title) : ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea name="description" class="form-input form-textarea" rows="2">${isEdit ? esc(offer.description || '') : ''}</textarea>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">نسبة الخصم %</label>
            <input type="number" name="discount" class="form-input" value="${isEdit ? offer.discount : ''}" min="0" max="100" />
          </div>
          <div class="form-group">
            <label class="form-label">كود الخصم</label>
            <input type="text" name="code" class="form-input" value="${isEdit ? esc(offer.code || '') : ''}" />
          </div>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">تاريخ الانتهاء</label>
            <input type="datetime-local" name="expiresAt" class="form-input" value="${isEdit && offer.expiresAt ? offer.expiresAt.slice(0, 16) : ''}" />
          </div>
          <div class="form-group" style="display:flex;align-items:end">
            <label class="form-label" style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" name="active" ${isEdit ? (offer.active ? 'checked' : '') : 'checked'} />
              عرض نشط
            </label>
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--ghost js-modal-close">إلغاء</button>
      <button class="btn btn--gold" id="saveOfferBtn">${isEdit ? 'حفظ' : 'إضافة'}</button>
    `,
  });

  const saveBtn = document.getElementById('saveOfferBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const form = document.getElementById('offerForm');
      if (!form) return;
      const data = collectFormData(form);
      if (!data.title?.trim()) {
        showToast('يرجى إدخال عنوان العرض', 'error');
        return;
      }
      upsertOffer({
        id: isEdit ? offer.id : generateId('offer'),
        title: data.title.trim(),
        description: data.description || '',
        discount: Number(data.discount) || 0,
        code: data.code || '',
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        active: form.querySelector('[name="active"]')?.checked || false,
      });
      closeModal();
      setHTML('#offersTable', renderOffersTable());
      showToast(isEdit ? 'تم تعديل العرض' : 'تم إضافة العرض', 'success');
    });
  }
}
