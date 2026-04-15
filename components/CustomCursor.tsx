'use client';

import { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'hover' | 'click' | 'view';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>('default');
  const [mounted, setMounted] = useState(false);

  const pos = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
    if (isTouchDevice()) return;

    // Move dot instantly, ring with lerp
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) { rafRef.current = requestAnimationFrame(animate); return; }

      dot.style.left = `${pos.current.x}px`;
      dot.style.top = `${pos.current.y}px`;

      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;
      ring.style.left = `${ringPos.current.x}px`;
      ring.style.top = `${ringPos.current.y}px`;

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // State detection via delegation
    const onEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('a, button, [role="button"], .skill-pill, .magnetic-btn')) {
        // Check if image/3D area
        if (el.closest('canvas, [data-cursor="view"]')) {
          setState('view');
        } else {
          setState('click');
        }
      } else if (el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'SPAN') {
        setState('hover');
      } else {
        setState('default');
      }
    };

    const onLeave = () => setState('default');

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  const labels: Partial<Record<CursorState, string>> = {
    click: 'CLICK',
    view: 'VIEW',
  };

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className={`cursor-ring ${state !== 'default' ? state : ''}`}>
        {labels[state] && (
          <span className="cursor-label">{labels[state]}</span>
        )}
      </div>
    </>
  );
}
