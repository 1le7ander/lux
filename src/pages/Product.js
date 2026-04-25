/**
 * Product detail page.
 */

import { getState, addToCart } from '../state.js';
import { $, $$, delegate, esc } from '../utils/dom.js';
import { fmtDZD } from '../utils/format.js';
import { showToast } from '../components/Toast.js';
import config from '../config.js';

export default function ProductPage({ id }) {
  const { products, categories } = getState();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return {
      html: `
        <div class="page section">
          <div class="container">
            <div class="empty-state">
              <div class="empty-state__icon">🔍</div>
              <h2 class="empty-state__title">المنتج غير موجود</h2>
              <a href="#products" class="btn btn--primary mt-4">تصفح المنتجات</a>
            </div>
          </div>
        </div>
      `,
    };
  }

  const cat = categories.find((c) => c.id === product.category);
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const price = hasDiscount ? product.salePrice : product.price;

  return {
    html: `
      <div class="page section">
        <div class="container">
          <div class="product-detail">
            <div class="product-gallery">
              <div class="product-gallery__main">
                ${product.images?.[0]
                  ? `<img src="${esc(product.images[0])}" alt="${esc(product.name)}" id="mainImage">`
                  : `<div class="img-placeholder" style="height:100%">📷</div>`}
              </div>
              ${product.images?.length > 1 ? `
                <div class="product-gallery__thumbs">
                  ${product.images.map((img, i) => `
                    <button class="product-gallery__thumb ${i === 0 ? 'is-active' : ''}" data-src="${esc(img)}">
                      <img src="${esc(img)}" alt="${esc(product.name)} ${i + 1}" loading="lazy">
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div class="product-info">
              <div class="product-info__breadcrumb">
                <a href="#home">الرئيسية</a>
                <span>/</span>
                ${cat ? `<a href="#category/${esc(cat.id)}">${esc(cat.name)}</a><span>/</span>` : ''}
                <span>${esc(product.name)}</span>
              </div>

              ${cat ? `<div class="product-info__category">${esc(cat.name)}</div>` : ''}
              <h1 class="product-info__name">${esc(product.name)}</h1>

              <div class="product-info__price">
                <span class="product-info__price-current">${fmtDZD(price)}</span>
                ${hasDiscount ? `<span class="product-info__price-old">${fmtDZD(product.price)}</span>` : ''}
              </div>

              <p class="product-info__desc">${esc(product.description || '')}</p>

              ${product.sizes?.length ? `
                <div class="selector">
                  <div class="selector__label">المقاس: <span id="selectedSize" style="color:var(--purple-glow)">—</span></div>
                  <div class="selector__options">
                    ${product.sizes.map((s) => `
                      <button class="selector__option js-size" data-size="${esc(s)}">${esc(s)}</button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${product.colors?.length ? `
                <div class="selector">
                  <div class="selector__label">اللون: <span id="selectedColor" style="color:var(--purple-glow)">—</span></div>
                  <div class="selector__options">
                    ${product.colors.map((c) => `
                      <button class="selector__option js-color" data-color="${esc(c)}">${esc(c)}</button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <div class="selector">
                <div class="selector__label">الكمية</div>
                <div class="qty-selector">
                  <button class="qty-selector__btn js-qty-minus">−</button>
                  <span class="qty-selector__value" id="qtyValue">1</span>
                  <button class="qty-selector__btn js-qty-plus">+</button>
                </div>
              </div>

              <div class="product-actions">
                <button class="btn btn--gold btn--lg" id="addToCartBtn" style="flex:1">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                  أضف للسلة — ${fmtDZD(price)}
                </button>
                <a href="https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن: ${product.name}`)}" target="_blank" rel="noopener" class="btn btn--whatsapp btn--lg btn--icon" aria-label="واتساب" style="border-radius:50%">💬</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    init() {
      const cleanups = [];
      let selectedSize = '';
      let selectedColor = '';
      let qty = 1;

      // Size selection
      cleanups.push(delegate(document, 'click', '.js-size', (_e, btn) => {
        $$('.js-size').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedSize = btn.dataset.size;
        const el = $('#selectedSize');
        if (el) el.textContent = selectedSize;
      }));

      // Color selection
      cleanups.push(delegate(document, 'click', '.js-color', (_e, btn) => {
        $$('.js-color').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedColor = btn.dataset.color;
        const el = $('#selectedColor');
        if (el) el.textContent = selectedColor;
      }));

      // Quantity
      cleanups.push(delegate(document, 'click', '.js-qty-minus', () => {
        qty = Math.max(1, qty - 1);
        const el = $('#qtyValue');
        if (el) el.textContent = qty;
      }));

      cleanups.push(delegate(document, 'click', '.js-qty-plus', () => {
        qty = Math.min(99, qty + 1);
        const el = $('#qtyValue');
        if (el) el.textContent = qty;
      }));

      // Add to cart
      const addBtn = $('#addToCartBtn');
      if (addBtn) {
        const addHandler = () => {
          addToCart(product, qty, selectedSize, selectedColor);
          showToast(`تمت إضافة "${product.name}" إلى السلة`, 'success');
        };
        addBtn.addEventListener('click', addHandler);
        cleanups.push(() => addBtn.removeEventListener('click', addHandler));
      }

      // Thumbnail click
      cleanups.push(delegate(document, 'click', '.product-gallery__thumb', (_e, btn) => {
        $$('.product-gallery__thumb').forEach((t) => t.classList.remove('is-active'));
        btn.classList.add('is-active');
        const img = $('#mainImage');
        if (img) img.src = btn.dataset.src;
      }));

      return () => cleanups.forEach((fn) => fn());
    },
  };
}
