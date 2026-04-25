/**
 * Checkout page — multi-step form.
 */

import { getState, getCartTotal, addOrder, clearCart } from '../state.js';
import { $, esc } from '../utils/dom.js';
import { fmtDZD } from '../utils/format.js';
import { generateId } from '../utils/helpers.js';
import { validate, required, phone, minLength, showErrors, collectFormData } from '../utils/validation.js';
import { wilayaSelectHTML, initWilayaSelect } from '../components/WilayaSelect.js';
import { showSuccessModal } from '../components/Modal.js';
import { launchConfetti } from '../components/Confetti.js';
import { showToast } from '../components/Toast.js';
import { getDeliveryFee } from '../data/wilayas.js';

export default function CheckoutPage() {
  const { cart } = getState();

  if (!cart.length) {
    return {
      html: `
        <div class="page section">
          <div class="container container--sm">
            <div class="empty-state">
              <div class="empty-state__icon">🛒</div>
              <h3 class="empty-state__title">سلتك فارغة</h3>
              <p class="empty-state__text">أضف منتجات للسلة قبل إتمام الطلب.</p>
              <a href="#products" class="btn btn--primary mt-4">تصفّح المنتجات</a>
            </div>
          </div>
        </div>
      `,
    };
  }

  const subtotal = getCartTotal();

  return {
    html: `
      <div class="page section">
        <div class="container container--sm">
          <div class="section__header" style="text-align:start;margin-bottom:var(--space-8)">
            <span class="section__label">📋 إتمام الطلب</span>
            <h1 class="page-title">معلومات الطلب</h1>
          </div>

          <div class="checkout-layout">
            <form id="checkoutForm" class="checkout-form glass" novalidate>
              <div class="form-section">
                <h3 class="form-section__title">👤 المعلومات الشخصية</h3>
                <div class="form-row form-row--2">
                  <div class="form-group">
                    <label class="form-label">الاسم الكامل <span class="form-label__required">*</span></label>
                    <input type="text" name="fullName" class="form-input" placeholder="أدخل اسمك الكامل" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">رقم الهاتف <span class="form-label__required">*</span></label>
                    <input type="tel" name="phone" class="form-input" placeholder="0555000000" dir="ltr" required />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3 class="form-section__title">📍 عنوان التوصيل</h3>
                ${wilayaSelectHTML()}
                <div class="form-group">
                  <label class="form-label">العنوان التفصيلي <span class="form-label__required">*</span></label>
                  <textarea name="address" class="form-input form-textarea" placeholder="الحي، الشارع، رقم المبنى..." rows="3" required></textarea>
                </div>
              </div>

              <div class="form-section">
                <h3 class="form-section__title">📝 ملاحظات</h3>
                <div class="form-group">
                  <label class="form-label">ملاحظات إضافية</label>
                  <textarea name="notes" class="form-input form-textarea" placeholder="أي تعليمات خاصة بالطلب..." rows="2"></textarea>
                </div>
              </div>

              <button type="submit" class="btn btn--gold btn--lg btn--full" id="submitOrder">
                تأكيد الطلب — <span id="orderTotal">${fmtDZD(subtotal)}</span>
              </button>
            </form>

            <div class="checkout-summary glass">
              <h3 style="font-weight:700;margin-bottom:var(--space-4)">ملخص الطلب</h3>
              ${cart.map((item) => `
                <div class="checkout-summary__item">
                  <span>${esc(item.name)} × ${item.qty}</span>
                  <span>${fmtDZD(item.price * item.qty)}</span>
                </div>
              `).join('')}
              <div class="divider" style="margin:var(--space-3) 0"></div>
              <div class="checkout-summary__item">
                <span>المجموع الفرعي</span>
                <span>${fmtDZD(subtotal)}</span>
              </div>
              <div class="checkout-summary__item">
                <span>التوصيل</span>
                <span id="deliveryFeeDisplay" class="text-muted">يحدد حسب الولاية</span>
              </div>
              <div class="divider" style="margin:var(--space-3) 0"></div>
              <div class="checkout-summary__item" style="font-weight:700;font-size:var(--text-lg)">
                <span>المجموع الكلي</span>
                <span class="gold-text" id="grandTotal">${fmtDZD(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    init() {
      const cleanups = [];
      let deliveryFee = 0;

      // Wilaya select
      const wilayaContainer = document.getElementById('wilayaSelect');
      if (wilayaContainer) {
        const wilayaCleanup = initWilayaSelect(wilayaContainer.closest('.form-group') || wilayaContainer, (code, fee) => {
          deliveryFee = fee;
          updateTotals(subtotal, fee);
        });
        if (wilayaCleanup) cleanups.push(wilayaCleanup);
      }

      // Form submit
      const form = $('#checkoutForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          handleSubmit(form, subtotal, deliveryFee);
        });
      }

      return () => cleanups.forEach((fn) => fn());
    },
  };
}

function updateTotals(subtotal, deliveryFee) {
  const feeDisplay = $('#deliveryFeeDisplay');
  const grandDisplay = $('#grandTotal');
  const orderTotal = $('#orderTotal');

  if (feeDisplay) feeDisplay.textContent = fmtDZD(deliveryFee);
  if (grandDisplay) grandDisplay.textContent = fmtDZD(subtotal + deliveryFee);
  if (orderTotal) orderTotal.textContent = fmtDZD(subtotal + deliveryFee);
}

function handleSubmit(form, subtotal, deliveryFee) {
  const data = collectFormData(form);

  const { valid, errors } = validate(data, {
    fullName: [required(), minLength(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')],
    phone: [required(), phone()],
    wilaya: [required('يرجى اختيار الولاية')],
    address: [required(), minLength(10, 'يرجى كتابة عنوان تفصيلي')],
  });

  if (!valid) {
    showErrors(form, errors);
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }

  const cart = getState().cart;
  const orderId = generateId('ORD');

  const order = {
    id: orderId,
    ref: orderId.slice(4, 12).toUpperCase(),
    customer: {
      fullName: data.fullName,
      phone: data.phone,
      wilaya: data.wilaya,
      address: data.address,
      notes: data.notes || '',
    },
    items: cart.map((item) => ({ ...item })),
    subtotal,
    deliveryFee: deliveryFee || getDeliveryFee(data.wilaya),
    total: subtotal + (deliveryFee || getDeliveryFee(data.wilaya)),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addOrder(order);
  clearCart();

  launchConfetti(60);
  showSuccessModal({
    title: 'تم تأكيد طلبك بنجاح! 🎉',
    message: 'سنتواصل معك قريبًا لتأكيد التفاصيل والتوصيل.',
    ref: `رقم الطلب: #${order.ref}`,
  });

  location.hash = '#orders';
}
