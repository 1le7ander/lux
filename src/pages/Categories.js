/**
 * Categories listing page.
 */

import { getState } from '../state.js';
import { esc } from '../utils/dom.js';
import { applyScrollReveals } from '../animations/init.js';

export default function CategoriesPage() {
  const { categories, products } = getState();

  return {
    html: `
      <div class="page section">
        <div class="container">
          <div class="section__header reveal">
            <span class="section__label">📂 التصنيفات</span>
            <h1 class="page-title">تصنيفات المنتجات</h1>
            <p class="section__subtitle">اختاري التصنيف المناسب لتصفح مجموعتنا المختارة</p>
          </div>
          <div class="cat-grid" style="margin-top:var(--space-10)">
            ${categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              return `
                <a href="#category/${esc(cat.id)}" class="cat-card cat-card--lg reveal">
                  <div class="cat-card__bg" style="background-color:var(--purple-900)"></div>
                  <div class="cat-card__overlay">
                    <span class="cat-card__icon" style="font-size:3rem">${cat.icon || '🛍️'}</span>
                    <h3 class="cat-card__name" style="font-size:var(--text-h3)">${esc(cat.name)}</h3>
                    <span class="cat-card__count">${count} منتج</span>
                  </div>
                  <div class="cat-card__arrow">←</div>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `,
    init() {
      setTimeout(() => applyScrollReveals(), 100);
    },
  };
}
