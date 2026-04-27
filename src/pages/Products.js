/**
 * Products listing page — all products with filtering and sorting.
 */

import { getState, addToCart } from '../state.js';
import { productGridHTML } from '../components/ProductCard.js';
import { showToast } from '../components/Toast.js';
import { $, $$, delegate, esc, setHTML } from '../utils/dom.js';
import { applyScrollReveals } from '../animations/init.js';

export default function ProductsPage() {
  const { categories, products } = getState();

  return {
    html: `
      <div class="page section">
        <div class="container">
          <div class="section__header" style="text-align:start;margin-bottom:var(--space-8)">
            <span class="section__label">🛍️ المنتجات</span>
            <h1 class="page-title">جميع المنتجات</h1>
            <p class="text-secondary">${products.length} منتج متاح</p>
          </div>

          <div class="filter-bar glass" style="margin-bottom:var(--space-8);padding:var(--space-4);border-radius:var(--radius-lg);display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center">
            <div class="filter-bar__group" style="display:flex;gap:var(--space-2);flex-wrap:wrap;flex:1">
              <button class="pill pill--purple is-active js-filter" data-cat="all">الكل</button>
              ${categories.map((c) => `
                <button class="pill js-filter" data-cat="${esc(c.id)}">${esc(c.name)}</button>
              `).join('')}
            </div>
            <div class="filter-bar__sort" style="display:flex;gap:var(--space-2);align-items:center">
              <label class="text-sm text-muted" style="white-space:nowrap">ترتيب حسب:</label>
              <select class="form-input" id="sortSelect" style="width:auto;min-width:150px;padding:8px 12px;font-size:var(--text-sm)">
                <option value="featured">المميزة أولاً</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
                <option value="newest">الأحدث</option>
                <option value="name">الاسم</option>
              </select>
            </div>
          </div>

          <div id="productsGrid">
            ${productGridHTML(sortProducts(products, 'featured'))}
          </div>
        </div>
      </div>
    `,
    init() {
      const cleanups = [];
      let currentCat = 'all';
      let currentSort = 'featured';

      setTimeout(() => applyScrollReveals(), 100);

      // Filter by category
      cleanups.push(delegate(document, 'click', '.js-filter', (_e, btn) => {
        $$('.js-filter').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentCat = btn.dataset.cat;
        updateGrid(currentCat, currentSort);
      }));

      // Sort
      const sortSelect = $('#sortSelect');
      if (sortSelect) {
        const sortHandler = () => {
          currentSort = sortSelect.value;
          updateGrid(currentCat, currentSort);
        };
        sortSelect.addEventListener('change', sortHandler);
        cleanups.push(() => sortSelect.removeEventListener('change', sortHandler));
      }

      // Quick add
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

function updateGrid(cat, sort) {
  const { products } = getState();
  const filtered = cat === 'all' ? products : products.filter((p) => p.category === cat);
  const sorted = sortProducts(filtered, sort);
  const el = $('#productsGrid');
  if (el) {
    setHTML(el, productGridHTML(sorted));
    applyScrollReveals(el);
  }
}

function sortProducts(products, sort) {
  const sorted = [...products];
  switch (sort) {
    case 'featured':
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    case 'price-asc':
      return sorted.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case 'price-desc':
      return sorted.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    default:
      return sorted;
  }
}
