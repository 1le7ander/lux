/**
 * Category page — filtered product listing.
 */

import { getState, addToCart } from '../state.js';
import { productGridHTML } from '../components/ProductCard.js';
import { showToast } from '../components/Toast.js';
import { delegate, esc } from '../utils/dom.js';
import { applyScrollReveals } from '../animations/init.js';

export default function CategoryPage({ id }) {
  const { categories, products } = getState();
  const category = categories.find((c) => c.id === id);
  const catProducts = products.filter((p) => p.category === id);

  if (!category) {
    return {
      html: `
        <div class="page section">
          <div class="container">
            <div class="empty-state">
              <div class="empty-state__icon">📂</div>
              <h2 class="empty-state__title">التصنيف غير موجود</h2>
              <a href="#categories" class="btn btn--primary mt-4">عرض جميع التصنيفات</a>
            </div>
          </div>
        </div>
      `,
    };
  }

  return {
    html: `
      <div class="page section">
        <div class="container">
          <nav style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-6);display:flex;gap:var(--space-2)">
            <a href="#home" style="color:var(--text-muted)">الرئيسية</a>
            <span>/</span>
            <a href="#categories" style="color:var(--text-muted)">التصنيفات</a>
            <span>/</span>
            <span style="color:var(--purple-glow)">${esc(category.name)}</span>
          </nav>

          <div class="section__header" style="text-align:start;margin-bottom:var(--space-8)">
            <span class="section__label">${category.icon || '📂'} ${esc(category.name)}</span>
            <h1 class="page-title">${esc(category.name)}</h1>
            <p class="text-secondary">${catProducts.length} منتج</p>
          </div>

          ${productGridHTML(catProducts)}
        </div>
      </div>
    `,
    init() {
      const cleanups = [];
      setTimeout(() => applyScrollReveals(), 100);

      cleanups.push(delegate(document, 'click', '.js-quick-add', (e, btn) => {
        e.preventDefault();
        e.stopPropagation();
        const product = getState().products.find((p) => p.id === btn.dataset.id);
        if (product) {
          addToCart(product);
          showToast(`تمت إضافة "${product.name}" إلى السلة`, 'success');
        }
      }));

      return () => cleanups.forEach((fn) => fn());
    },
  };
}
