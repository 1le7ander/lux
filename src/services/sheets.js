/**
 * Google Sheets webhook backup (optional).
 */

import config from '../config.js';

/** Send order data to Google Sheets via webhook */
export async function backupToSheets(order) {
  if (!config.sheetsWebhookUrl) return false;

  try {
    await fetch(config.sheetsWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: order.ref || order.id,
        customer: order.customer?.fullName || '',
        phone: order.customer?.phone || '',
        wilaya: order.customer?.wilaya || '',
        address: order.customer?.address || '',
        items: order.items?.map((i) => `${i.name} ×${i.qty}`).join(', ') || '',
        total: order.total,
        status: order.status,
        date: order.createdAt,
      }),
    });
    return true;
  } catch {
    return false;
  }
}
