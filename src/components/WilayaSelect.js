/**
 * Custom Wilaya dropdown with search.
 */

import wilayas, { searchWilayas } from '../data/wilayas.js';
import { esc } from '../utils/dom.js';
import { fmtDZD } from '../utils/format.js';
import { debounce } from '../utils/helpers.js';

/**
 * Render the wilaya select component HTML.
 * @param {string} [selectedCode] — pre-selected wilaya code
 * @returns {string}
 */
export function wilayaSelectHTML(selectedCode = '') {
  const selected = wilayas.find((w) => w.code === selectedCode);
  return `
    <div class="form-group">
      <label class="form-label">
        الولاية <span class="form-label__required">*</span>
      </label>
      <div class="wilaya-select" id="wilayaSelect">
        <div class="search-input">
          <input
            type="text"
            class="form-input js-wilaya-search"
            placeholder="ابحث عن ولايتك..."
            value="${selected ? esc(selected.name) : ''}"
            autocomplete="off"
          />
          <span class="search-input__icon">🔍</span>
        </div>
        <input type="hidden" name="wilaya" value="${esc(selectedCode)}" />
        <div class="wilaya-dropdown" id="wilayaDropdown" style="display:none">
          ${renderWilayaList(wilayas)}
        </div>
      </div>
    </div>
  `;
}

function renderWilayaList(items) {
  return items.map((w) => `
    <div class="wilaya-option" data-code="${w.code}" data-name="${esc(w.name)}">
      <span class="wilaya-option__code">${w.code}</span>
      <span class="wilaya-option__name">${esc(w.name)}</span>
      <span class="wilaya-option__fee">${fmtDZD(w.fee)}</span>
    </div>
  `).join('');
}

/**
 * Initialize wilaya select behavior.
 * @param {HTMLElement} container
 * @param {(code: string, fee: number) => void} onChange
 */
export function initWilayaSelect(container, onChange) {
  const searchInput = container.querySelector('.js-wilaya-search');
  const hiddenInput = container.querySelector('[name="wilaya"]');
  const dropdown = container.querySelector('#wilayaDropdown');
  if (!searchInput || !dropdown) return;

  const doSearch = debounce((query) => {
    const results = searchWilayas(query);
    dropdown.innerHTML = renderWilayaList(results);
    dropdown.style.display = results.length ? '' : 'none';
  }, 200);

  searchInput.addEventListener('focus', () => {
    dropdown.style.display = '';
    dropdown.innerHTML = renderWilayaList(wilayas);
  });

  searchInput.addEventListener('input', (e) => {
    doSearch(e.target.value);
  });

  dropdown.addEventListener('click', (e) => {
    const opt = e.target.closest('.wilaya-option');
    if (!opt) return;
    const code = opt.dataset.code;
    const name = opt.dataset.name;
    const w = wilayas.find((w) => w.code === code);
    searchInput.value = name;
    if (hiddenInput) hiddenInput.value = code;
    dropdown.style.display = 'none';
    if (onChange && w) onChange(code, w.fee);
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
