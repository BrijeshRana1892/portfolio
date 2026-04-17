'use client';

import { useEffect } from 'react';

/**
 * Applies a subtle skewY transform to elements with [data-scroll-skew]
 * based on scroll velocity. Smoothed, clamped, and respects reduced-motion.
 * Mount once near the root.
 */
export default function ScrollSkew() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let lastY = window.scrollY;
    let lastT = performance.now();
    let velocity = 0;
    let current = 0;
    let rafId = 0;

    const MAX_SKEW = 4;
    const SENSITIVITY = 0.018;

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(now - lastT, 1);
      velocity = dy / dt;
      lastY = window.scrollY;
      lastT = now;
    };

    const tick = () => {
      const targetSkew = Math.max(
        -MAX_SKEW,
        Math.min(MAX_SKEW, velocity * SENSITIVITY * 1000)
      );
      current += (targetSkew - current) * 0.12;
      velocity *= 0.88;

      const value = Math.abs(current) < 0.04 ? 0 : current;
      const nodes = document.querySelectorAll<HTMLElement>('[data-scroll-skew]');
      nodes.forEach((n) => {
        n.style.transform = value === 0 ? '' : `skewY(${value}deg)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      document.querySelectorAll<HTMLElement>('[data-scroll-skew]').forEach((n) => {
        n.style.transform = '';
      });
    };
  }, []);

  return null;
}
