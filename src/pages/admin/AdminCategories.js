/**
 * Admin categories management.
 */

import { getState, upsertCategory, deleteCategory } from '../../state.js';
import { $, delegate, esc, setHTML } from '../../utils/dom.js';
import { openModal, closeModal } from '../../components/Modal.js';
import { showToast } from '../../components/Toast.js';
import { generateId } from '../../utils/helpers.js';
import { collectFormData } from '../../utils/validation.js';

export default function AdminCategoriesPage() {
  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-3)">
          <div>
            <h1 class="admin-page__title">إدارة التصنيفات</h1>
            <p class="text-muted">${getState().categories.length} تصنيف</p>
          </div>
          <button class="btn btn--gold" id="addCategoryBtn">+ إضافة تصنيف</button>
        </div>
        <div id="categoriesTable">${renderCategoriesTable()}</div>
      </div>
    `,
    init() {
      const cleanups = [];

      const addBtn = $('#addCategoryBtn');
      if (addBtn) {
        const addHandler = () => showCategoryModal();
        addBtn.addEventListener('click', addHandler);
        cleanups.push(() => addBtn.removeEventListener('click', addHandler));
      }

      cleanups.push(delegate(document, 'click', '.js-edit-cat', (_e, btn) => {
        const cat = getState().categories.find((c) => c.id === btn.dataset.id);
        if (cat) showCategoryModal(cat);
      }));

      cleanups.push(delegate(document, 'click', '.js-delete-cat', (_e, btn) => {
        if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
          deleteCategory(btn.dataset.id);
          setHTML('#categoriesTable', renderCategoriesTable());
          showToast('تم حذف التصنيف', 'info');
        }
      }));

      return () => cleanups.forEach((fn) => fn());
    },
  };
}

function renderCategoriesTable() {
  const { categories, products } = getState();
  if (!categories.length) {
    return '<p class="text-muted text-center" style="padding:var(--space-10)">لا توجد تصنيفات.</p>';
  }

  return `
    <div class="data-table-wrap glass" style="margin-top:var(--space-6)">
      <table class="data-table">
        <thead>
          <tr>
            <th>الأيقونة</th>
            <th>الاسم</th>
            <th>عدد المنتجات</th>
            <th>الترتيب</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${categories.map((c) => {
            const count = products.filter((p) => p.category === c.id).length;
            return `
              <tr>
                <td style="font-size:1.5rem">${c.icon || '📂'}</td>
                <td style="font-weight:500">${esc(c.name)}</td>
                <td>${count}</td>
                <td>${c.order ?? '—'}</td>
                <td>
                  <div style="display:flex;gap:var(--space-2)">
                    <button class="btn btn--ghost btn--sm js-edit-cat" data-id="${esc(c.id)}">✏️</button>
                    <button class="btn btn--ghost btn--sm js-delete-cat" data-id="${esc(c.id)}" style="color:var(--danger)">🗑️</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showCategoryModal(category = null) {
  const isEdit = category != null;

  openModal({
    title: isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد',
    body: `
      <form id="categoryForm">
        <div class="form-group">
          <label class="form-label">الاسم *</label>
          <input type="text" name="name" class="form-input" value="${isEdit ? esc(category.name) : ''}" required />
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">الأيقونة (إيموجي)</label>
            <input type="text" name="icon" class="form-input" value="${isEdit ? esc(category.icon || '') : ''}" placeholder="📂" />
          </div>
          <div class="form-group">
            <label class="form-label">الترتيب</label>
            <input type="number" name="order" class="form-input" value="${isEdit ? (category.order ?? '') : ''}" min="0" />
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--ghost js-modal-close">إلغاء</button>
      <button class="btn btn--gold" id="saveCategoryBtn">${isEdit ? 'حفظ' : 'إضافة'}</button>
    `,
  });

  const saveBtn = document.getElementById('saveCategoryBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const form = document.getElementById('categoryForm');
      if (!form) return;
      const data = collectFormData(form);
      if (!data.name?.trim()) {
        showToast('يرجى إدخال اسم التصنيف', 'error');
        return;
      }
      upsertCategory({
        id: isEdit ? category.id : generateId('cat'),
        name: data.name.trim(),
        icon: data.icon || '📂',
        order: data.order ? Number(data.order) : 0,
      });
      closeModal();
      setHTML('#categoriesTable', renderCategoriesTable());
      showToast(isEdit ? 'تم تعديل التصنيف' : 'تم إضافة التصنيف', 'success');
    });
  }
}
