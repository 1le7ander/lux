/**
 * Product card component — reusable across home, category, search.
 */

import { esc } from '../utils/dom.js';
import { fmtDZD } from '../utils/format.js';
import { getState } from '../state.js';

/**
 * Render a product card HTML string.
 * @param {object} product
 * @returns {string} HTML
 */
export function productCardHTML(product) {
  const { id, name, price, salePrice, images, category } = product;
  const imgSrc = images?.[0] || '';
  const imgSrc2 = images?.[1] || '';
  const hasDiscount = salePrice != null && salePrice < price;
  const discountPct = hasDiscount
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  const categories = getState().categories;
  const catObj = categories.find((c) => c.id === category);
  const catName = catObj?.name ?? '';

  return `
    <article class="p-card reveal" data-product-id="${esc(id)}">
      <div class="p-card__image">
        ${imgSrc
          ? `<img src="${esc(imgSrc)}" alt="${esc(name)}" loading="lazy">`
          : `<div class="img-placeholder">📷</div>`}
        ${imgSrc2
          ? `<img src="${esc(imgSrc2)}" alt="${esc(name)}" loading="lazy">`
          : ''}

        <div class="p-card__badges">
          ${hasDiscount ? `<span class="pill pill--danger">-${discountPct}%</span>` : ''}
          ${product.featured ? '<span class="pill pill--gold">مميز</span>' : ''}
        </div>

        <div class="p-card__quick">
          <button class="btn btn--sm btn--primary js-quick-add" data-id="${esc(id)}" aria-label="إضافة سريعة">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            أضف للسلة
          </button>
        </div>
      </div>

      <a href="#product/${esc(id)}" class="p-card__body">
        ${catName ? `<span class="p-card__category">${esc(catName)}</span>` : ''}
        <h3 class="p-card__name">${esc(name)}</h3>
        <div class="p-card__price">
          <span class="p-card__price-current">${fmtDZD(hasDiscount ? salePrice : price)}</span>
          ${hasDiscount ? `<span class="p-card__price-old">${fmtDZD(price)}</span>` : ''}
          ${hasDiscount ? `<span class="p-card__discount">وفّر ${discountPct}%</span>` : ''}
        </div>
      </a>
    </article>
  `;
}

/**
 * Render a grid of product cards.
 * @param {object[]} products
 * @returns {string}
 */
export function productGridHTML(products) {
  if (!products.length) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">🛍️</div>
        <h3 class="empty-state__title">لا توجد منتجات</h3>
        <p class="empty-state__text">لم يتم العثور على منتجات في هذا التصنيف.</p>
      </div>
    `;
  }
  return `<div class="product-grid">${products.map(productCardHTML).join('')}</div>`;
}
