/**
 * Site footer — brand, links, social, copyright.
 */

import { $ } from '../utils/dom.js';
import config from '../config.js';

export function renderFooter() {
  const el = $('#siteFooter');
  if (!el) return;

  el.className = 'footer';
  el.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="footer__brand-name gold-text">LUXE</div>
          <p class="footer__brand-desc">
            أرقى الأزياء الفاخرة في الجزائر. نقدم لكم أحدث صيحات الموضة
            بجودة عالمية وشحن سريع لكل الولايات.
          </p>
          <div class="footer__social">
            <a href="https://wa.me/${config.whatsappNumber}" target="_blank" rel="noopener" class="footer__social-link" aria-label="واتساب">💬</a>
            <a href="#" class="footer__social-link" aria-label="انستغرام">📸</a>
            <a href="#" class="footer__social-link" aria-label="فيسبوك">📘</a>
            <a href="#" class="footer__social-link" aria-label="تيك توك">🎵</a>
          </div>
        </div>

        <div>
          <h4 class="footer__heading">روابط سريعة</h4>
          <nav class="footer__links">
            <a href="#home" class="footer__link">الرئيسية</a>
            <a href="#products" class="footer__link">المنتجات</a>
            <a href="#categories" class="footer__link">التصنيفات</a>
            <a href="#about" class="footer__link">من نحن</a>
            <a href="#contact" class="footer__link">تواصل معنا</a>
          </nav>
        </div>

        <div>
          <h4 class="footer__heading">خدمة العملاء</h4>
          <nav class="footer__links">
            <a href="#orders" class="footer__link">تتبع طلبك</a>
            <a href="#contact" class="footer__link">الدعم والمساعدة</a>
            <a href="#about" class="footer__link">سياسة الإرجاع</a>
            <a href="#about" class="footer__link">شروط الاستخدام</a>
          </nav>
        </div>

        <div>
          <h4 class="footer__heading">معلومات التواصل</h4>
          <div class="footer__links">
            <span class="footer__link">📞 ${config.whatsappNumber}</span>
            <span class="footer__link">📧 ${config.contactEmail || 'info@luxe.dz'}</span>
            <span class="footer__link">📍 الجزائر — شحن لكل الولايات</span>
            <span class="footer__link">🕐 السبت – الخميس: 9 صباحاً – 9 مساءً</span>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <span class="footer__copy">© ${new Date().getFullYear()} LUXE — جميع الحقوق محفوظة</span>
        <div class="footer__payments">
          <span>💳 الدفع عند الاستلام</span>
          <span>🔒 تسوّق آمن</span>
        </div>
      </div>
    </div>
  `;
}
