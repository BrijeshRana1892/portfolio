'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cursor-reactive spotlight for light mode.
 * Renders a soft pastel radial gradient that follows the cursor.
 * Disabled on touch devices and dark mode.
 */
export default function LightSpotlight() {
  const dotRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [isLight, setIsLight] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(canHover && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled || !isLight) return;

    target.current = {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    };
    current.current = { ...target.current };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${current.current.x - 320}px, ${current.current.y - 320}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
    };
  }, [enabled, isLight]);

  if (!enabled || !isLight) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '640px',
        height: '640px',
        pointerEvents: 'none',
        zIndex: 1,
        background:
          'radial-gradient(closest-side, rgba(91, 76, 255, 0.16) 0%, rgba(8, 145, 178, 0.10) 35%, rgba(255, 190, 220, 0.06) 60%, transparent 72%)',
        filter: 'blur(12px)',
        mixBlendMode: 'multiply',
        willChange: 'transform',
      }}
    />
  );
}
