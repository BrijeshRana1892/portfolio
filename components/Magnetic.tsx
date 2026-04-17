'use client';

import { useRef, useEffect, ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}

export default function Magnetic({
  children,
  strength = 0.35,
  radius = 110,
  className,
}: MagneticProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduced) return;

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      if (
        Math.abs(current.current.x - target.current.x) > 0.05 ||
        Math.abs(current.current.y - target.current.y) > 0.05
      ) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = 0;
      }
    };

    const startRaf = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const falloff = 1 - dist / radius;
        target.current.x = dx * strength * falloff;
        target.current.y = dy * strength * falloff;
      } else {
        target.current.x = 0;
        target.current.y = 0;
      }
      startRaf();
    };

    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
      startRaf();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.style.transform = '';
    };
  }, [strength, radius]);

  return (
    <span
      ref={wrapRef}
      className={className}
      style={{
        display: 'inline-block',
        willChange: 'transform',
        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </span>
  );
}
