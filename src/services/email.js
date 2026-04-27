/**
 * EmailJS service for order notifications (optional).
 */

import config from '../config.js';

let _initialized = false;

/** Initialize EmailJS */
export async function initEmailJS() {
  if (_initialized) return;
  if (!config.emailjsPublicKey) return;

  try {
    const emailjs = await import('@emailjs/browser');
    emailjs.init(config.emailjsPublicKey);
    _initialized = true;
  } catch {
    // EmailJS not available
  }
}

/** Send order notification email */
export async function sendOrderEmail(order) {
  if (!_initialized || !config.emailjsServiceId || !config.emailjsTemplateId) return false;

  try {
    const emailjs = await import('@emailjs/browser');
    await emailjs.send(config.emailjsServiceId, config.emailjsTemplateId, {
      order_ref: order.ref || order.id,
      customer_name: order.customer?.fullName || '',
      customer_phone: order.customer?.phone || '',
      customer_wilaya: order.customer?.wilaya || '',
      customer_address: order.customer?.address || '',
      order_total: order.total,
      order_items: order.items?.map((i) => `${i.name} ×${i.qty}`).join(', ') || '',
    });
    return true;
  } catch {
    return false;
  }
}
