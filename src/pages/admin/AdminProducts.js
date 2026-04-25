/**
 * Admin products management — CRUD.
 */

import { getState, upsertProduct, deleteProduct } from '../../state.js';
import { $, delegate, esc, setHTML } from '../../utils/dom.js';
import { fmtDZD } from '../../utils/format.js';
import { openModal, closeModal } from '../../components/Modal.js';
import { showToast } from '../../components/Toast.js';
import { generateId } from '../../utils/helpers.js';
import { collectFormData } from '../../utils/validation.js';

export default function AdminProductsPage() {
  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-3)">
          <div>
            <h1 class="admin-page__title">إدارة المنتجات</h1>
            <p class="text-muted">${getState().products.length} منتج</p>
          </div>
          <button class="btn btn--gold" id="addProductBtn">+ إضافة منتج</button>
        </div>

        <div id="productsTable">${renderProductsTable()}</div>
      </div>
    `,
    init() {
      const addBtn = $('#addProductBtn');
      if (addBtn) addBtn.addEventListener('click', () => showProductModal());

      delegate(document, 'click', '.js-edit-product', (_e, btn) => {
        const product = getState().products.find((p) => p.id === btn.dataset.id);
        if (product) showProductModal(product);
      });

      delegate(document, 'click', '.js-delete-product', (_e, btn) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
          deleteProduct(btn.dataset.id);
          setHTML('#productsTable', renderProductsTable());
          showToast('تم حذف المنتج', 'info');
        }
      });
    },
  };
}

function renderProductsTable() {
  const { products, categories } = getState();
  if (!products.length) {
    return '<p class="text-muted text-center" style="padding:var(--space-10)">لا توجد منتجات. أضف منتجك الأول!</p>';
  }

  return `
    <div class="data-table-wrap glass" style="margin-top:var(--space-6)">
      <table class="data-table">
        <thead>
          <tr>
            <th>المنتج</th>
            <th>التصنيف</th>
            <th>السعر</th>
            <th>المخزون</th>
            <th>مميز</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((p) => {
            const cat = categories.find((c) => c.id === p.category);
            return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-3)">
                    <div style="width:40px;height:40px;border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);flex-shrink:0">
                      ${p.images?.[0] ? `<img src="${esc(p.images[0])}" alt="" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:1.2rem">📷</div>'}
                    </div>
                    <span style="font-weight:500">${esc(p.name)}</span>
                  </div>
                </td>
                <td>${cat ? esc(cat.name) : '—'}</td>
                <td>
                  ${p.salePrice ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:var(--text-sm)">${fmtDZD(p.price)}</span> ` : ''}
                  <span class="gold-text">${fmtDZD(p.salePrice ?? p.price)}</span>
                </td>
                <td>${p.stock ?? '—'}</td>
                <td>${p.featured ? '⭐' : '—'}</td>
                <td>
                  <div style="display:flex;gap:var(--space-2)">
                    <button class="btn btn--ghost btn--sm js-edit-product" data-id="${esc(p.id)}">✏️</button>
                    <button class="btn btn--ghost btn--sm js-delete-product" data-id="${esc(p.id)}" style="color:var(--danger)">🗑️</button>
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

function showProductModal(product = null) {
  const isEdit = product != null;
  const { categories } = getState();

  openModal({
    title: isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد',
    body: `
      <form id="productForm">
        <div class="form-group">
          <label class="form-label">اسم المنتج *</label>
          <input type="text" name="name" class="form-input" value="${isEdit ? esc(product.name) : ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label">التصنيف</label>
          <select name="category" class="form-input">
            <option value="">بدون تصنيف</option>
            ${categories.map((c) => `<option value="${esc(c.id)}" ${isEdit && product.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">السعر *</label>
            <input type="number" name="price" class="form-input" value="${isEdit ? product.price : ''}" min="0" required />
          </div>
          <div class="form-group">
            <label class="form-label">سعر التخفيض</label>
            <input type="number" name="salePrice" class="form-input" value="${isEdit && product.salePrice ? product.salePrice : ''}" min="0" />
          </div>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">المخزون</label>
            <input type="number" name="stock" class="form-input" value="${isEdit ? (product.stock ?? '') : ''}" min="0" />
          </div>
          <div class="form-group" style="display:flex;align-items:end;gap:var(--space-2)">
            <label class="form-label" style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
              <input type="checkbox" name="featured" ${isEdit && product.featured ? 'checked' : ''} />
              منتج مميز ⭐
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea name="description" class="form-input form-textarea" rows="3">${isEdit ? esc(product.description || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">المقاسات (مفصولة بفاصلة)</label>
          <input type="text" name="sizes" class="form-input" value="${isEdit ? (product.sizes || []).join(', ') : ''}" placeholder="S, M, L, XL" />
        </div>
        <div class="form-group">
          <label class="form-label">الألوان (مفصولة بفاصلة)</label>
          <input type="text" name="colors" class="form-input" value="${isEdit ? (product.colors || []).join(', ') : ''}" placeholder="أسود, أبيض, ذهبي" />
        </div>
        <div class="form-group">
          <label class="form-label">روابط الصور (مفصولة بفاصلة)</label>
          <textarea name="images" class="form-input form-textarea" rows="2" placeholder="https://...">${isEdit ? (product.images || []).join(', ') : ''}</textarea>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--ghost js-modal-close">إلغاء</button>
      <button class="btn btn--gold" id="saveProductBtn">${isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
    `,
  });

  const saveBtn = document.getElementById('saveProductBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const form = document.getElementById('productForm');
      if (!form) return;
      const data = collectFormData(form);

      if (!data.name?.trim() || !data.price) {
        showToast('يرجى ملء الحقول المطلوبة', 'error');
        return;
      }

      const newProduct = {
        id: isEdit ? product.id : generateId('prod'),
        name: data.name.trim(),
        category: data.category || '',
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        description: data.description || '',
        images: data.images ? data.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        sizes: data.sizes ? data.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        colors: data.colors ? data.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        stock: data.stock ? Number(data.stock) : 0,
        featured: form.querySelector('[name="featured"]')?.checked || false,
        createdAt: isEdit ? product.createdAt : new Date().toISOString(),
      };

      upsertProduct(newProduct);
      closeModal();
      setHTML('#productsTable', renderProductsTable());
      showToast(isEdit ? 'تم تعديل المنتج' : 'تم إضافة المنتج', 'success');
    });
  }
}
