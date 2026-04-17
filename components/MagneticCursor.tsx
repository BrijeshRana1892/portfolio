'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const HOVER_SELECTOR =
  'a, button, [role="button"], input, textarea, [data-cursor="hover"]';
const TEXT_SELECTOR = '[data-cursor="text"]';

interface Burst {
  id: number;
  x: number;
  y: number;
  accent: string;
}

export default function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [mode, setMode] = useState<'default' | 'hover' | 'text'>('default');
  const [clicking, setClicking] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstIdRef = useRef(0);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const dotSpring = {
    damping: 28,
    stiffness: 650,
    mass: 0.25,
  };
  const ringSpring = {
    damping: 22,
    stiffness: 160,
    mass: 0.6,
  };

  const dotX = useSpring(x, dotSpring);
  const dotY = useSpring(y, dotSpring);
  const ringX = useSpring(x, ringSpring);
  const ringY = useSpring(y, ringSpring);

  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    setEnabled(true);

    const checkTheme = () =>
      setIsDark(!document.documentElement.classList.contains('light'));
    checkTheme();
    const themeObs = new MutationObserver(checkTheme);
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);
      });
    };

    const resolveMode = (target: EventTarget | null): 'default' | 'hover' | 'text' => {
      if (!(target instanceof Element)) return 'default';
      if (target.closest(TEXT_SELECTOR)) return 'text';
      if (target.closest(HOVER_SELECTOR)) return 'hover';
      return 'default';
    };

    const onOver = (e: MouseEvent) => setMode(resolveMode(e.target));
    const onDown = (e: MouseEvent) => {
      setClicking(true);
      const id = burstIdRef.current++;
      const isHoverTarget =
        e.target instanceof Element && !!e.target.closest(HOVER_SELECTOR);
      const burstAccent = isHoverTarget
        ? (document.documentElement.classList.contains('light') ? '#5b4cff' : '#00d4ff')
        : (document.documentElement.classList.contains('light') ? '#0d0d1a' : '#ffffff');
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY, accent: burstAccent }]);
      window.setTimeout(() => {
        setBursts((b) => b.filter((p) => p.id !== id));
      }, 650);
    };
    const onUp = () => setClicking(false);
    const onLeave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    document.documentElement.classList.add('has-magnetic-cursor');

    return () => {
      cancelAnimationFrame(rafRef.current);
      themeObs.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('has-magnetic-cursor');
    };
  }, [x, y]);

  if (!enabled) return null;

  const primary = isDark ? '#ffffff' : '#0d0d1a';
  const accent = isDark ? '#00d4ff' : '#5b4cff';

  const ringSize =
    mode === 'hover' ? 56 : mode === 'text' ? 72 : 36;
  const dotSize = mode === 'text' ? 2 : mode === 'hover' ? 4 : 6;
  const ringBorder = mode === 'hover' ? 1.5 : 1;
  const ringOpacity = mode === 'default' ? 0.5 : 0.85;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          borderRadius: '50%',
          border: `${ringBorder}px solid ${mode === 'hover' ? accent : primary}`,
          opacity: ringOpacity,
          pointerEvents: 'none',
          zIndex: 9999,
          x: ringX,
          y: ringY,
          mixBlendMode: isDark ? 'difference' : 'normal',
          scale: clicking ? 0.75 : 1,
          transition: 'width 0.25s ease, height 0.25s ease, margin 0.25s ease, border-color 0.25s ease, scale 0.12s ease',
        }}
      />
      {/* Inner dot */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          borderRadius: '50%',
          background: mode === 'hover' ? accent : primary,
          pointerEvents: 'none',
          zIndex: 10000,
          x: dotX,
          y: dotY,
          mixBlendMode: isDark ? 'difference' : 'normal',
          boxShadow: mode === 'hover' ? `0 0 12px ${accent}` : 'none',
          transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease, background 0.2s ease',
        }}
      />

      {/* Click bursts */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <BurstEffect key={burst.id} burst={burst} />
        ))}
      </AnimatePresence>
    </>
  );
}

function BurstEffect({ burst }: { burst: Burst }) {
  const particleCount = 8;
  const ringId = burst.id;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: burst.y,
        left: burst.x,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {/* Expanding ring */}
      <motion.div
        key={`r-${ringId}`}
        initial={{ width: 8, height: 8, marginLeft: -4, marginTop: -4, opacity: 0.75 }}
        animate={{ width: 56, height: 56, marginLeft: -28, marginTop: -28, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          borderRadius: '50%',
          border: `1.5px solid ${burst.accent}`,
        }}
      />
      {/* Radial particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const dist = 22 + Math.random() * 10;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              marginLeft: -2,
              marginTop: -2,
              borderRadius: '50%',
              background: burst.accent,
              boxShadow: `0 0 8px ${burst.accent}`,
            }}
          />
        );
      })}
    </div>
  );
}
