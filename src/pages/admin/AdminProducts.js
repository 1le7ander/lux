/**
 * Admin products management — CRUD via backend API.
 */

import { getState, setProducts, setCategories } from '../../state.js';
import { $, delegate, esc, setHTML } from '../../utils/dom.js';
import { fmtDZD } from '../../utils/format.js';
import { openModal, closeModal } from '../../components/Modal.js';
import { showToast } from '../../components/Toast.js';
import { collectFormData } from '../../utils/validation.js';
import * as api from '../../api/client.js';

export default function AdminProductsPage() {
  return {
    html: `
      <div class="admin-page">
        <div class="admin-page__header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-3)">
          <div>
            <h1 class="admin-page__title">إدارة المنتجات</h1>
            <p class="text-muted" id="productsCount">${getState().products.length} منتج</p>
          </div>
          <button class="btn btn--gold" id="addProductBtn">+ إضافة منتج</button>
        </div>

        <div id="productsTable">${renderProductsTable()}</div>
      </div>
    `,
    init() {
      const cleanups = [];

      const addBtn = $('#addProductBtn');
      if (addBtn) {
        const addHandler = () => showProductModal();
        addBtn.addEventListener('click', addHandler);
        cleanups.push(() => addBtn.removeEventListener('click', addHandler));
      }

      cleanups.push(delegate(document, 'click', '.js-edit-product', (_e, btn) => {
        const product = getState().products.find((p) => p.id === btn.dataset.id);
        if (product) showProductModal(product);
      }));

      cleanups.push(delegate(document, 'click', '.js-delete-product', async (_e, btn) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
          try {
            await api.deleteProduct(btn.dataset.id);
            await refreshProducts();
            showToast('تم حذف المنتج', 'info');
          } catch (err) {
            showToast(err.message || 'فشل حذف المنتج', 'error');
          }
        }
      }));

      cleanups.push(delegate(document, 'click', '.js-upload-img', (_e, btn) => {
        const productId = btn.dataset.id;
        showImageUploadModal(productId);
      }));

      return () => cleanups.forEach((fn) => fn());
    },
  };
}

async function refreshProducts() {
  try {
    const [products, categories] = await Promise.all([
      api.getProducts({ limit: 200 }),
      api.getCategories(),
    ]);
    const productList = products?.items ?? products;
    if (Array.isArray(productList)) setProducts(productList);
    if (Array.isArray(categories)) setCategories(categories);
  } catch { /* use cached state */ }
  setHTML('#productsTable', renderProductsTable());
  const countEl = $('#productsCount');
  if (countEl) countEl.textContent = `${getState().products.length} منتج`;
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
            const catId = p.category_id ?? p.category;
            const cat = categories.find((c) => c.id === catId);
            const imgUrl = p.images?.[0]?.url ?? p.images?.[0];
            const salePrice = p.sale_price ?? p.salePrice;
            return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-3)">
                    <div style="width:40px;height:40px;border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);flex-shrink:0">
                      ${imgUrl ? `<img src="${esc(typeof imgUrl === 'string' ? imgUrl : imgUrl)}" alt="" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:1.2rem">📷</div>'}
                    </div>
                    <span style="font-weight:500">${esc(p.name)}</span>
                  </div>
                </td>
                <td>${cat ? esc(cat.name) : '—'}</td>
                <td>
                  ${salePrice ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:var(--text-sm)">${fmtDZD(p.price)}</span> ` : ''}
                  <span class="gold-text">${fmtDZD(salePrice ?? p.price)}</span>
                </td>
                <td>${p.stock ?? '—'}</td>
                <td>${p.featured ? '⭐' : '—'}</td>
                <td>
                  <div style="display:flex;gap:var(--space-2)">
                    <button class="btn btn--ghost btn--sm js-upload-img" data-id="${esc(p.id)}" title="رفع صورة">📷</button>
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
          <select name="category_id" class="form-input">
            <option value="">بدون تصنيف</option>
            ${categories.map((c) => `<option value="${esc(c.id)}" ${isEdit && (product.category_id ?? product.category) === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">السعر *</label>
            <input type="number" name="price" class="form-input" value="${isEdit ? product.price : ''}" min="0" required />
          </div>
          <div class="form-group">
            <label class="form-label">سعر التخفيض</label>
            <input type="number" name="sale_price" class="form-input" value="${isEdit && (product.sale_price ?? product.salePrice) ? (product.sale_price ?? product.salePrice) : ''}" min="0" />
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
      </form>
    `,
    footer: `
      <button class="btn btn--ghost js-modal-close">إلغاء</button>
      <button class="btn btn--gold" id="saveProductBtn">${isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
    `,
  });

  const saveBtn = document.getElementById('saveProductBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const form = document.getElementById('productForm');
      if (!form) return;
      const data = collectFormData(form);

      if (!data.name?.trim() || !data.price) {
        showToast('يرجى ملء الحقول المطلوبة', 'error');
        return;
      }

      const payload = {
        name: data.name.trim(),
        category_id: data.category_id || null,
        price: Number(data.price),
        sale_price: data.sale_price ? Number(data.sale_price) : null,
        description: data.description || '',
        sizes: data.sizes ? data.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        colors: data.colors ? data.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        stock: data.stock ? Number(data.stock) : 0,
        featured: form.querySelector('[name="featured"]')?.checked || false,
      };

      try {
        if (isEdit) {
          await api.updateProduct(product.id, payload);
        } else {
          await api.createProduct(payload);
        }
        closeModal();
        await refreshProducts();
        showToast(isEdit ? 'تم تعديل المنتج' : 'تم إضافة المنتج', 'success');
      } catch (err) {
        showToast(err.message || 'حدث خطأ', 'error');
      }
    });
  }
}

function showImageUploadModal(productId) {
  openModal({
    title: 'رفع صورة المنتج',
    body: `
      <form id="imageUploadForm">
        <div class="form-group">
          <label class="form-label">اختر صورة (JPEG, PNG, WebP — حد 5MB)</label>
          <input type="file" name="image" class="form-input" accept="image/jpeg,image/png,image/webp,image/gif" required />
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--ghost js-modal-close">إلغاء</button>
      <button class="btn btn--gold" id="uploadImageBtn">رفع الصورة</button>
    `,
  });

  const uploadBtn = document.getElementById('uploadImageBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const form = document.getElementById('imageUploadForm');
      const fileInput = form?.querySelector('[name="image"]');
      const file = fileInput?.files?.[0];
      if (!file) {
        showToast('يرجى اختيار صورة', 'error');
        return;
      }
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'جاري الرفع...';
      try {
        await api.uploadProductImage(productId, file);
        closeModal();
        await refreshProducts();
        showToast('تم رفع الصورة بنجاح', 'success');
      } catch (err) {
        showToast(err.message || 'فشل رفع الصورة', 'error');
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'رفع الصورة';
      }
    });
  }
}
