/**
 * Contact page.
 */

import { $ } from '../utils/dom.js';
import { showToast } from '../components/Toast.js';
import { validate, required, minLength, showErrors, collectFormData } from '../utils/validation.js';
import config from '../config.js';
import { applyScrollReveals } from '../animations/init.js';

export default function ContactPage() {
  return {
    html: `
      <div class="page section">
        <div class="container container--sm">
          <div class="section__header reveal" style="text-align:start;margin-bottom:var(--space-10)">
            <span class="section__label">📞 تواصل معنا</span>
            <h1 class="page-title">نحب نسمع منك</h1>
            <p class="text-secondary">لديك سؤال أو استفسار؟ تواصل معنا وسنرد عليك في أقرب وقت.</p>
          </div>

          <div class="contact-grid">
            <div class="contact-cards">
              <a href="https://wa.me/${config.whatsappNumber}" target="_blank" rel="noopener" class="contact-card glass reveal">
                <div class="contact-card__icon" style="color:#25d366">💬</div>
                <h3 class="contact-card__title">واتساب</h3>
                <p class="contact-card__text">تواصل مباشرة عبر واتساب للاستفسارات السريعة</p>
                <span class="contact-card__action" style="color:#25d366">ابدأ المحادثة ←</span>
              </a>

              <div class="contact-card glass reveal">
                <div class="contact-card__icon">📧</div>
                <h3 class="contact-card__title">البريد الإلكتروني</h3>
                <p class="contact-card__text">${config.contactEmail || 'info@luxe.dz'}</p>
                <span class="contact-card__action text-purple">أرسل رسالة ←</span>
              </div>

              <div class="contact-card glass reveal">
                <div class="contact-card__icon">🕐</div>
                <h3 class="contact-card__title">ساعات العمل</h3>
                <p class="contact-card__text">السبت — الخميس<br>9:00 صباحاً — 9:00 مساءً</p>
              </div>
            </div>

            <form class="contact-form glass reveal" id="contactForm" novalidate>
              <h3 style="font-weight:700;margin-bottom:var(--space-4)">أرسل رسالة</h3>
              <div class="form-group">
                <label class="form-label">الاسم <span class="form-label__required">*</span></label>
                <input type="text" name="name" class="form-input" placeholder="اسمك الكامل" required />
              </div>
              <div class="form-row form-row--2">
                <div class="form-group">
                  <label class="form-label">الهاتف</label>
                  <input type="tel" name="phone" class="form-input" placeholder="0555000000" dir="ltr" />
                </div>
                <div class="form-group">
                  <label class="form-label">البريد</label>
                  <input type="email" name="email" class="form-input" placeholder="email@example.com" dir="ltr" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">الموضوع <span class="form-label__required">*</span></label>
                <select name="subject" class="form-input">
                  <option value="">اختر الموضوع</option>
                  <option value="order">استفسار عن طلب</option>
                  <option value="product">استفسار عن منتج</option>
                  <option value="return">إرجاع أو استبدال</option>
                  <option value="complaint">شكوى</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">الرسالة <span class="form-label__required">*</span></label>
                <textarea name="message" class="form-input form-textarea" rows="5" placeholder="اكتب رسالتك هنا..." required></textarea>
              </div>
              <button type="submit" class="btn btn--gold btn--full">إرسال الرسالة</button>
            </form>
          </div>
        </div>
      </div>
    `,
    init() {
      setTimeout(() => applyScrollReveals(), 100);

      const form = $('#contactForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const data = collectFormData(form);

          const { valid, errors } = validate(data, {
            name: [required(), minLength(2)],
            subject: [required('يرجى اختيار الموضوع')],
            message: [required(), minLength(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل')],
          });

          if (!valid) {
            showErrors(form, errors);
            return;
          }

          showToast('تم إرسال رسالتك بنجاح! سنرد عليك قريبًا.', 'success');
          form.reset();
        });
      }
    },
  };
}
