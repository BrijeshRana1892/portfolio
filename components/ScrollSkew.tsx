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
    let idle = true;
    let lastApplied = 0;

    const MAX_SKEW = 4;
    const SENSITIVITY = 0.018;

    // Cache nodes once on mount — refresh on mutations via observer
    let nodes: HTMLElement[] = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-skew]')
    );
    const mo = new MutationObserver(() => {
      nodes = Array.from(
        document.querySelectorAll<HTMLElement>('[data-scroll-skew]')
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const startLoop = () => {
      if (!idle) return;
      idle = false;
      rafId = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(now - lastT, 1);
      velocity = dy / dt;
      lastY = window.scrollY;
      lastT = now;
      startLoop();
    };

    const tick = () => {
      const targetSkew = Math.max(
        -MAX_SKEW,
        Math.min(MAX_SKEW, velocity * SENSITIVITY * 1000)
      );
      current += (targetSkew - current) * 0.12;
      velocity *= 0.88;

      const value = Math.abs(current) < 0.04 ? 0 : current;

      // Only write if value changed meaningfully — saves layout thrash
      if (Math.abs(value - lastApplied) > 0.03 || (value === 0 && lastApplied !== 0)) {
        const transform = value === 0 ? '' : `skewY(${value}deg)`;
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].style.transform = transform;
        }
        lastApplied = value;
      }

      // Stop RAF when settled
      if (Math.abs(velocity) < 0.001 && value === 0) {
        idle = true;
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      nodes.forEach((n) => { n.style.transform = ''; });
    };
  }, []);

  return null;
}
