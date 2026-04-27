/**
 * Animation initialization — GSAP + Lenis smooth scroll.
 * Dynamically imported for code splitting.
 */

let gsapInstance = null;
let ScrollTriggerPlugin = null;
let lenisInstance = null;

/** Load and initialize animation libraries */
export async function initAnimations() {
  try {
    const [gsapModule, stModule] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);

    gsapInstance = gsapModule.gsap || gsapModule.default;
    ScrollTriggerPlugin = stModule.ScrollTrigger || stModule.default;

    if (gsapInstance && ScrollTriggerPlugin) {
      gsapInstance.registerPlugin(ScrollTriggerPlugin);
    }

    await initLenis();
  } catch {
    // GSAP/Lenis not available — graceful fallback
  }
}

async function initLenis() {
  try {
    const LenisModule = await import('lenis');
    const Lenis = LenisModule.default || LenisModule.Lenis;

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Sync Lenis with GSAP ticker
    if (gsapInstance) {
      gsapInstance.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsapInstance.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Sync ScrollTrigger with Lenis
    if (ScrollTriggerPlugin) {
      lenisInstance.on('scroll', ScrollTriggerPlugin.update);
    }
  } catch {
    // Lenis not available — native scroll
  }
}

/** Apply scroll reveal to elements with .reveal class */
export function applyScrollReveals(container = document) {
  if (!gsapInstance || !ScrollTriggerPlugin) return;

  const reveals = container.querySelectorAll('.reveal');
  reveals.forEach((el) => {
    gsapInstance.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Stagger grid items
  const grids = container.querySelectorAll('.product-grid, .features-grid, .cat-grid');
  grids.forEach((grid) => {
    const items = grid.children;
    gsapInstance.from(items, {
      y: 50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: grid,
        start: 'top 80%',
      },
    });
  });
}

/** Animate hero entrance */
export function animateHero() {
  if (!gsapInstance) return;

  const tl = gsapInstance.timeline();
  tl.from('.hero__label', { y: 30, opacity: 0, duration: 0.6 })
    .from('.hero__title', { y: 50, opacity: 0, duration: 0.8 }, '-=0.3')
    .from('.hero__subtitle', { y: 30, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero__cta', { y: 30, opacity: 0, duration: 0.6 }, '-=0.3')
    .from('.hero__trust', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2')
    .from('.scroll-indicator', { opacity: 0, duration: 0.5 }, '-=0.1');
}

/** Cleanup — kill Lenis and ScrollTrigger instances */
export function destroyAnimations() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  if (ScrollTriggerPlugin) {
    ScrollTriggerPlugin.getAll().forEach((t) => t.kill());
  }
}
