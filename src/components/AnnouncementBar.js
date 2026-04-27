/**
 * Announcement bar — marquee ticker.
 */

import { $, esc } from '../utils/dom.js';
import { getState } from '../state.js';

export function renderAnnouncementBar() {
  const el = $('#announcementBar');
  if (!el) return;

  const { settings } = getState();
  const text = settings.announcement || '🎉 شحن مجاني للطلبات فوق 15,000 د.ج';

  const items = [
    `✨ ${esc(text)}`,
    '🚚 توصيل لكل الولايات 58',
    '💎 جودة عالمية مضمونة',
    '🔒 الدفع عند الاستلام',
  ];

  // Double items for seamless loop
  const trackContent = [...items, ...items]
    .map((t) => `<span class="announcement-bar__item">${t}</span>`)
    .join('');

  el.className = 'announcement-bar';
  el.innerHTML = `<div class="announcement-bar__track">${trackContent}</div>`;
}
