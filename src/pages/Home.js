/**
 * Home page — Hero, Categories, Featured Products, Offers, Features.
 */

import { getState } from '../state.js';
import { addToCart } from '../state.js';
import { productCardHTML } from '../components/ProductCard.js';
import { countdownHTML, startCountdown } from '../components/CountdownTimer.js';
import { showToast } from '../components/Toast.js';
import { delegate, esc } from '../utils/dom.js';
import { animateHero, applyScrollReveals } from '../animations/init.js';

export default function HomePage() {
  const { categories, products, offers } = getState();
  const featured = products.filter((p) => p.featured);
  const activeOffer = offers.find((o) => o.active);

  const html = `
    <div class="page">
      ${heroSection()}
      ${marqueeSection()}
      ${categoriesSection(categories)}
      ${featuredSection(featured)}
      ${activeOffer ? offerSection(activeOffer) : ''}
      ${statsSection()}
      ${featuresSection()}
    </div>
  `;

  return {
    html,
    init() {
      const cleanups = [];

      // Hero animation
      setTimeout(() => animateHero(), 100);
      setTimeout(() => applyScrollReveals(), 200);

      // Quick add to cart
      cleanups.push(delegate(document, 'click', '.js-quick-add', (e, btn) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        const product = getState().products.find((p) => p.id === id);
        if (product) {
          addToCart(product);
          showToast(`تمت إضافة "${product.name}" إلى السلة`, 'success');
        }
      }));

      // Countdown
      if (activeOffer) {
        const countdownCleanup = startCountdown('offerCountdown');
        if (countdownCleanup) cleanups.push(countdownCleanup);
      }

      // Hero particles
      createParticles();

      return () => cleanups.forEach((fn) => fn());
    },
  };
}

function heroSection() {
  return `
    <section class="hero">
      <div class="hero__bg">
        <div class="hero__orb hero__orb--1"></div>
        <div class="hero__orb hero__orb--2"></div>
        <div class="hero__orb hero__orb--3"></div>
        <div class="hero__particles" id="heroParticles"></div>
      </div>

      <div class="hero__content">
        <div class="hero__label">
          <span class="pill pill--gold">✨ مجموعة 2025</span>
        </div>

        <h1 class="hero__title">
          <span class="hero__title-line gold-text">أناقة بلا حدود</span>
          <span class="hero__title-line" style="color:var(--text-hero)">تسوّق أرقى الأزياء</span>
        </h1>

        <p class="hero__subtitle">
          اكتشفي أحدث صيحات الموضة الفاخرة بجودة عالمية. تشكيلة مختارة بعناية
          من أرقى الأقمشة والتصاميم العصرية مع شحن سريع لكل الولايات.
        </p>

        <div class="hero__cta">
          <a href="#products" class="btn btn--gold btn--lg">
            تسوّق الآن
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="#categories" class="btn btn--ghost btn--lg">استكشف التصنيفات</a>
        </div>

        <div class="hero__trust">
          <span class="trust-badge">🚚 شحن لكل الولايات</span>
          <span class="trust-badge">💳 الدفع عند الاستلام</span>
          <span class="trust-badge">🔄 إرجاع سهل</span>
        </div>
      </div>

      <div class="scroll-indicator">
        <span>اكتشف المزيد</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>
    </section>
  `;
}

function categoriesSection(categories) {
  if (!categories.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section__header reveal">
          <span class="section__label">💎 التصنيفات</span>
          <h2 class="section__title">تسوّق حسب الفئة</h2>
          <p class="section__subtitle">اختاري من تشكيلتنا المتنوعة — فساتين، عبايات، حقائب وأكثر</p>
        </div>
        <div class="cat-grid">
          ${categories.slice(0, 5).map((cat) => `
            <a href="#category/${esc(cat.id)}" class="cat-card reveal">
              <div class="cat-card__bg" style="background-color:var(--purple-900)"></div>
              <div class="cat-card__overlay">
                <span class="cat-card__icon">${cat.icon || '🛍️'}</span>
                <h3 class="cat-card__name">${esc(cat.name)}</h3>
                <span class="cat-card__count">تصفّح المجموعة ←</span>
              </div>
              <div class="cat-card__arrow">←</div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function featuredSection(products) {
  if (!products.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section__header reveal">
          <span class="section__label">🌟 مميز</span>
          <h2 class="section__title">المنتجات المميزة</h2>
          <p class="section__subtitle">أفضل ما اخترنا لكِ هذا الموسم</p>
        </div>
        <div class="product-grid">
          ${products.slice(0, 8).map(productCardHTML).join('')}
        </div>
        <div class="text-center mt-8">
          <a href="#products" class="btn btn--ghost">عرض جميع المنتجات</a>
        </div>
      </div>
    </section>
  `;
}

function offerSection(offer) {
  return `
    <section class="section">
      <div class="container">
        <div class="offer-banner reveal">
          <span class="section__label">🔥 عروض حصرية</span>
          <h2 class="offer-banner__title">${esc(offer.title)}</h2>
          <p class="text-secondary mb-4">${esc(offer.description)}</p>
          ${countdownHTML(offer.expiresAt, 'offerCountdown')}
          ${offer.code ? `
            <div style="margin-top:var(--space-4)">
              <span class="pill pill--gold" style="font-size:var(--text-body);padding:10px 24px">
                كود الخصم: <strong>${esc(offer.code)}</strong>
              </span>
            </div>
          ` : ''}
          <div class="mt-6">
            <a href="#products" class="btn btn--gold">تسوّق العروض</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function featuresSection() {
  const features = [
    { icon: '🚚', title: 'شحن لكل الولايات', text: 'توصيل سريع لجميع الولايات الـ 58 مع تتبع الطلب' },
    { icon: '💳', title: 'الدفع عند الاستلام', text: 'ادفع عند استلام طلبك — لا حاجة لبطاقة بنكية' },
    { icon: '🔄', title: 'إرجاع سهل', text: 'سياسة إرجاع مرنة خلال 7 أيام من الاستلام' },
    { icon: '💎', title: 'جودة مضمونة', text: 'منتجات أصلية بأعلى معايير الجودة العالمية' },
  ];

  return `
    <section class="section" style="background:var(--bg-void)">
      <div class="container">
        <div class="section__header reveal">
          <span class="section__label">⭐ لماذا LUXE</span>
          <h2 class="section__title">تجربة تسوّق استثنائية</h2>
        </div>
        <div class="features-grid">
          ${features.map((f) => `
            <div class="feature-card reveal">
              <div class="feature-card__icon">${f.icon}</div>
              <h3 class="feature-card__title">${f.title}</h3>
              <p class="feature-card__text">${f.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function marqueeSection() {
  const words = ['LUXE', '·', 'أزياء فاخرة', '·', 'FASHION', '·', 'أناقة', '·', 'ELEGANCE', '·', 'تصاميم عصرية', '·', 'STYLE', '·'];
  const track = words.concat(words).map((w) => `<span class="marquee__word">${w}</span>`).join('');
  return `
    <section class="marquee-section">
      <div class="marquee__track">${track}</div>
    </section>
  `;
}

function statsSection() {
  const stats = [
    { value: '10K+', label: 'عميل سعيد' },
    { value: '500+', label: 'منتج فاخر' },
    { value: '58', label: 'ولاية توصيل' },
    { value: '24/7', label: 'دعم العملاء' },
  ];
  return `
    <section class="section stats-section reveal">
      <div class="container">
        <div class="stats-row">
          ${stats.map((s) => `
            <div class="stats-item">
              <span class="stats-item__value gold-text">${s.value}</span>
              <span class="stats-item__label">${s.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('span');
    p.className = 'hero__particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: -5%;
      animation-duration: ${4 + Math.random() * 6}s;
      animation-delay: ${Math.random() * 5}s;
      width: ${2 + Math.random() * 3}px;
      height: ${2 + Math.random() * 3}px;
    `;
    container.appendChild(p);
  }
}
