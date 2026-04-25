/**
 * General-purpose helpers — debounce, throttle, deepClone, IDs.
 */

/** Debounce a function */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Throttle a function */
export function throttle(fn, ms = 200) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

/** Generate a short unique ID (for orders, items) */
export function generateId(prefix = '') {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return prefix ? `${prefix}-${ts}${rand}` : `${ts}${rand}`;
}

/** Deep clone via structuredClone (modern browsers) */
export function deepClone(obj) {
  return structuredClone(obj);
}

/** Clamp a number between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Sleep helper for animations */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Chunk array into groups */
export function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
