/**
 * Form validation engine.
 * Returns { valid, errors } where errors is a Map<fieldName, message>.
 */

const PHONE_RE = /^(0)(5|6|7)\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate a set of rules against form data */
export function validate(data, rules) {
  const errors = new Map();

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of fieldRules) {
      const msg = rule(value, data);
      if (msg) {
        errors.set(field, msg);
        break; // one error per field
      }
    }
  }

  return { valid: errors.size === 0, errors };
}

/* ── Rule factories ────────────────────────────────── */

export const required = (msg = 'هذا الحقل مطلوب') =>
  (val) => (!val || (typeof val === 'string' && !val.trim())) ? msg : null;

export const minLength = (min, msg) =>
  (val) => val && val.length < min ? (msg ?? `الحد الأدنى ${min} أحرف`) : null;

export const maxLength = (max, msg) =>
  (val) => val && val.length > max ? (msg ?? `الحد الأقصى ${max} أحرف`) : null;

export const phone = (msg = 'رقم هاتف غير صالح (مثال: 0555000000)') =>
  (val) => val && !PHONE_RE.test(val.replace(/\s/g, '')) ? msg : null;

export const email = (msg = 'بريد إلكتروني غير صالح') =>
  (val) => val && !EMAIL_RE.test(val) ? msg : null;

export const numeric = (msg = 'يجب أن يكون رقمًا') =>
  (val) => val && isNaN(Number(val)) ? msg : null;

export const min = (minVal, msg) =>
  (val) => val !== '' && Number(val) < minVal ? (msg ?? `الحد الأدنى ${minVal}`) : null;

export const match = (otherField, msg = 'القيمتان غير متطابقتين') =>
  (val, data) => val !== data[otherField] ? msg : null;

/** Show validation errors on form inputs */
export function showErrors(form, errors) {
  // Clear previous
  for (const el of form.querySelectorAll('.is-error')) {
    el.classList.remove('is-error');
  }
  for (const el of form.querySelectorAll('.form-error')) {
    el.remove();
  }

  for (const [field, msg] of errors) {
    const input = form.querySelector(`[name="${field}"]`);
    if (!input) continue;
    input.classList.add('is-error');
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.textContent = msg;
    input.parentElement.appendChild(errorEl);
  }
}

/** Collect form data as plain object */
export function collectFormData(form) {
  const fd = new FormData(form);
  const data = {};
  for (const [key, val] of fd.entries()) {
    data[key] = val;
  }
  return data;
}
