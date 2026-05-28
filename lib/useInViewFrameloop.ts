'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Gate R3F Canvas frameloop on viewport intersection.
 * Returns [ref, frameloop] — attach ref to outer div, pass frameloop to Canvas.
 * Off-screen canvases stop rendering entirely.
 */
export function useInViewFrameloop(margin = '200px') {
  const ref = useRef<HTMLDivElement>(null);
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'),
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return { ref, frameloop };
}
