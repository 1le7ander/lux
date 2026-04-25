/**
 * DOM utility helpers — safe wrappers for common operations.
 */

/** Query single element */
export const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Query multiple elements */
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Create element with attributes and children */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = val;
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(val)) {
        el.dataset[dk] = dv;
      }
    } else if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'innerHTML') {
      el.innerHTML = val;
    } else {
      el.setAttribute(key, val);
    }
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

/** Escape HTML to prevent XSS (safe for attribute contexts) */
export function esc(str) {
  const s = String(str ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Attach delegated event listener — returns cleanup function */
export function delegate(parent, eventType, selector, handler) {
  const root = typeof parent === 'string' ? $(parent) : parent;
  if (!root) return () => {};
  const listener = (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) {
      handler(e, target);
    }
  };
  root.addEventListener(eventType, listener);
  return () => root.removeEventListener(eventType, listener);
}

/** Set innerHTML safely (escaping user content) */
export function setHTML(el, html) {
  if (typeof el === 'string') {
    const node = $(el);
    if (node) node.innerHTML = html;
  } else if (el) {
    el.innerHTML = html;
  }
}

/** Toggle class helper */
export function toggleClass(el, className, force) {
  const node = typeof el === 'string' ? $(el) : el;
  if (node) node.classList.toggle(className, force);
}

/** Add class */
export function addClass(el, ...classes) {
  const node = typeof el === 'string' ? $(el) : el;
  if (node) node.classList.add(...classes);
}

/** Remove class */
export function removeClass(el, ...classes) {
  const node = typeof el === 'string' ? $(el) : el;
  if (node) node.classList.remove(...classes);
}
