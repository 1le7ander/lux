/**
 * Confetti celebration effect for order success.
 */

const COLORS = ['#a855f7', '#d4af37', '#f0d060', '#c084fc', '#8b5cf6', '#fef3c7'];

/**
 * Launch confetti particles.
 * @param {number} [count=50]
 */
export function launchConfetti(count = 50) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.random() * 8 + 4;
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const duration = Math.random() * 2 + 2;

    particle.style.cssText = `
      position: absolute;
      top: -10px;
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confetti-fall ${duration}s ease-in ${delay}s forwards;
      opacity: 0.9;
    `;

    container.appendChild(particle);
  }

  setTimeout(() => container.remove(), 4000);
}
