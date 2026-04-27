/**
 * About page.
 */

import { applyScrollReveals } from '../animations/init.js';

export default function AboutPage() {
  return {
    html: `
      <div class="page">
        <section class="section" style="padding-top:var(--space-16)">
          <div class="container container--sm text-center">
            <span class="section__label reveal">✨ من نحن</span>
            <h1 class="page-title reveal" style="margin-bottom:var(--space-4)">
              <span class="gold-text">LUXE</span> — أناقة بلا حدود
            </h1>
            <p class="text-secondary reveal" style="font-size:var(--text-lg);max-width:600px;margin-inline:auto">
              نؤمن بأن الأناقة حق لكل امرأة جزائرية. نختار لكِ أفضل الأقمشة
              والتصاميم من أرقى الموردين لنقدم لكِ تجربة تسوّق فاخرة بمعايير عالمية.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="features-grid">
              ${[
                { icon: '🎯', title: 'رؤيتنا', text: 'أن نكون الوجهة الأولى للأزياء الفاخرة في الجزائر، مع تقديم تجربة تسوّق لا تُنسى تجمع بين الجودة والأناقة والخدمة المتميزة.' },
                { icon: '💎', title: 'قيمنا', text: 'الجودة أولاً — كل منتج يمر بفحص دقيق قبل عرضه. نلتزم بالصدق والشفافية مع عملائنا في كل تفاصيل المنتج.' },
                { icon: '🤝', title: 'التزامنا', text: 'نسعى لبناء علاقة ثقة طويلة الأمد مع عملائنا من خلال منتجات أصلية، أسعار عادلة، وخدمة ما بعد البيع المتميزة.' },
                { icon: '🌍', title: 'تغطيتنا', text: 'نوصل لجميع ولايات الجزائر الـ 58 مع خدمة توصيل سريعة وآمنة. الدفع عند الاستلام لراحتك التامة.' },
              ].map((item) => `
                <div class="feature-card reveal">
                  <div class="feature-card__icon">${item.icon}</div>
                  <h3 class="feature-card__title">${item.title}</h3>
                  <p class="feature-card__text">${item.text}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <section class="section" style="background:var(--bg-void)">
          <div class="container">
            <div class="section__header reveal text-center">
              <span class="section__label">📊 بالأرقام</span>
              <h2 class="section__title">لماذا يثق بنا عملاؤنا</h2>
            </div>
            <div class="stats-grid reveal">
              ${[
                { value: '58', label: 'ولاية مغطاة' },
                { value: '+500', label: 'عميلة سعيدة' },
                { value: '+200', label: 'منتج فاخر' },
                { value: '4.9', label: 'تقييم العملاء' },
              ].map((s) => `
                <div class="stat-card glass">
                  <div class="stat-card__value gold-text">${s.value}</div>
                  <div class="stat-card__label">${s.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      </div>
    `,
    init() {
      setTimeout(() => applyScrollReveals(), 100);
    },
  };
}
