/**
 * Formatting utilities — currency, dates, relative time.
 */

const arNumberFmt = new Intl.NumberFormat('ar-DZ', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format price in DZD */
export function fmtDZD(amount) {
  return `${arNumberFmt.format(amount)} د.ج`;
}

/** Format ISO date to Arabic locale */
export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format relative time (e.g., "منذ 3 دقائق") */
export function fmtRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'الآن';
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `منذ ${m} ${m === 1 ? 'دقيقة' : 'دقائق'}`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `منذ ${h} ${h === 1 ? 'ساعة' : 'ساعات'}`;
  }
  const d = Math.floor(diffSec / 86400);
  return `منذ ${d} ${d === 1 ? 'يوم' : 'أيام'}`;
}

/** Format order reference */
export function fmtOrderRef(ref) {
  return `#${String(ref).toUpperCase()}`;
}
