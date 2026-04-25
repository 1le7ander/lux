/**
 * Countdown timer component.
 */

/**
 * Render countdown HTML.
 * @param {string} targetDate — ISO date string
 * @param {string} [id] — element ID for updates
 * @returns {string}
 */
export function countdownHTML(targetDate, id = 'countdown') {
  return `
    <div class="countdown" id="${id}" data-target="${targetDate}">
      <div class="countdown__box">
        <div class="countdown__value js-days">00</div>
        <div class="countdown__label">يوم</div>
      </div>
      <div class="countdown__box">
        <div class="countdown__value js-hours">00</div>
        <div class="countdown__label">ساعة</div>
      </div>
      <div class="countdown__box">
        <div class="countdown__value js-minutes">00</div>
        <div class="countdown__label">دقيقة</div>
      </div>
      <div class="countdown__box">
        <div class="countdown__value js-seconds">00</div>
        <div class="countdown__label">ثانية</div>
      </div>
    </div>
  `;
}

/**
 * Start the countdown timer.
 * @param {string} id — countdown container ID
 * @returns {() => void} cleanup function
 */
export function startCountdown(id = 'countdown') {
  const el = document.getElementById(id);
  if (!el) return () => {};

  const target = new Date(el.dataset.target).getTime();

  function update() {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const days = el.querySelector('.js-days');
    const hours = el.querySelector('.js-hours');
    const minutes = el.querySelector('.js-minutes');
    const seconds = el.querySelector('.js-seconds');

    if (days) days.textContent = String(d).padStart(2, '0');
    if (hours) hours.textContent = String(h).padStart(2, '0');
    if (minutes) minutes.textContent = String(m).padStart(2, '0');
    if (seconds) seconds.textContent = String(s).padStart(2, '0');
  }

  update();
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
}
