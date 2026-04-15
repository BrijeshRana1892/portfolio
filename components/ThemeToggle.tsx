'use client';

import { useEffect, useRef, useState } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  finalX: number;
  finalY: number;
  color: string;
  size: number;
};

const COLORS_TO_LIGHT = [
  'rgba(91,76,255,0.9)',
  'rgba(8,145,178,0.9)',
  'rgba(124,58,237,0.85)',
  'rgba(167,139,250,0.9)',
  'rgba(255,255,255,0.7)',
];
const COLORS_TO_DARK = [
  'rgba(108,99,255,0.9)',
  'rgba(0,212,255,0.9)',
  'rgba(255,255,255,0.75)',
  'rgba(99,102,241,0.85)',
  'rgba(196,181,253,0.8)',
];

export default function ThemeToggle() {
  const [isDark, setIsDark]         = useState(true);
  const [mounted, setMounted]       = useState(false);
  const [particles, setParticles]   = useState<Particle[]>([]);
  const [shockPos, setShockPos]     = useState<{ x: number; y: number; toLight: boolean } | null>(null);
  const [flash, setFlash]           = useState(false);
  const [btnClicked, setBtnClicked] = useState(false);
  const [iconSpin, setIconSpin]     = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);
  const transitioning = useRef(false);

  useEffect(() => {
    setMounted(true);
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const check = () => setIsDark(!document.documentElement.classList.contains('light'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const toggle = (e: React.MouseEvent) => {
    if (transitioning.current) return; // prevent double-click during animation
    transitioning.current = true;

    const btn = e.currentTarget as HTMLButtonElement;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const goingLight = isDark;

    // ── Reduced motion: instant swap ─────────────────────────────
    if (reducedMotion.current) {
      document.documentElement.classList.toggle('light');
      const newDark = !document.documentElement.classList.contains('light');
      setIsDark(newDark);
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      transitioning.current = false;
      return;
    }

    // ── Layer 4: button pulse + icon spin ─────────────────────────
    setBtnClicked(true);
    setIconSpin(true);
    setTimeout(() => setBtnClicked(false), 500);
    setTimeout(() => setIconSpin(false), 700);

    // ── Layer 3: particle burst (mix of sizes for depth) ──────────
    const colors = goingLight ? COLORS_TO_LIGHT : COLORS_TO_DARK;
    const count = 28;
    const burst: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle  = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed  = 45 + Math.random() * 130;
      const size   = Math.random() > 0.65 ? 6 : 3.5;
      return {
        id: Date.now() + i,
        x: cx, y: cy,
        finalX: Math.cos(angle) * speed,
        finalY: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
      };
    });
    setParticles(burst);
    setTimeout(() => setParticles([]), 950);

    // ── Layer 5: screen flash ─────────────────────────────────────
    setFlash(true);
    setTimeout(() => setFlash(false), 500);

    // ── Layer 2: shockwave rings ──────────────────────────────────
    setShockPos({ x: cx, y: cy, toLight: goingLight });
    setTimeout(() => setShockPos(null), 1100);

    // ── Layer 6: element reactions ────────────────────────────────
    document.body.classList.add('theme-transitioning');
    document.documentElement.classList.add('theme-changing');

    // ── Layer 1: clip-path ripple overlay ────────────────────────
    const overlay = overlayRef.current;
    if (overlay) {
      // Radial gradient: intense at click center, fades to flat bg color
      // Creates a photon-burst feel at the edge of the expanding circle
      overlay.style.background = goingLight
        ? `radial-gradient(circle at ${cx}px ${cy}px, #ece8ff 0%, #f3f0ff 35%, #f8f8fc 70%)`
        : `radial-gradient(circle at ${cx}px ${cy}px, #1a0a3e 0%, #0d0820 35%, #06060f 70%)`;
      overlay.style.clipPath = `circle(0% at ${cx}px ${cy}px)`;
      overlay.style.transition = 'none';
      void overlay.offsetWidth; // force reflow

      requestAnimationFrame(() => {
        overlay.style.transition = 'clip-path 950ms cubic-bezier(0.72,0,0.28,1)';
        overlay.style.clipPath   = `circle(150% at ${cx}px ${cy}px)`;
      });

      // Apply theme when overlay covers ~60% of screen
      setTimeout(() => {
        document.documentElement.classList.toggle('light');
        const newDark = !document.documentElement.classList.contains('light');
        setIsDark(newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
      }, 520);

      // Remove overlay (instantly snaps back — hidden by new theme)
      setTimeout(() => {
        overlay.style.transition = 'none';
        overlay.style.clipPath   = 'circle(0% at 50% 50%)';
      }, 1000);
    }

    // Cleanup all transition classes + unlock
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
      document.documentElement.classList.remove('theme-changing');
      transitioning.current = false;
    }, 1250);
  };

  if (!mounted) return null;

  const goingLight = isDark;

  return (
    <>
      {/* ── Layer 1: Clip-path overlay ─────────────────────────── */}
      <div
        ref={overlayRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 9996,
          pointerEvents: 'none',
          clipPath: 'circle(0% at 50% 50%)',
          willChange: 'clip-path',
        }}
      />

      {/* ── Layer 5: Screen flash ───────────────────────────────── */}
      {flash && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: 9995,
            pointerEvents: 'none',
            background: goingLight
              ? 'rgba(240,235,255,0.7)'
              : 'rgba(108,99,255,0.08)',
            animation: 'screenFlash 480ms ease-out forwards',
          }}
        />
      )}

      {/* ── Layer 2: Two shockwave rings ────────────────────────── */}
      {shockPos && (
        <>
          <div
            aria-hidden
            className="shockwave-ring"
            style={{
              left: shockPos.x,
              top:  shockPos.y,
              borderColor: shockPos.toLight
                ? 'rgba(91,76,255,0.6)'
                : 'rgba(108,99,255,0.6)',
            }}
          />
          <div
            aria-hidden
            className="shockwave-ring-2"
            style={{
              left: shockPos.x,
              top:  shockPos.y,
              borderColor: shockPos.toLight
                ? 'rgba(8,145,178,0.35)'
                : 'rgba(0,212,255,0.35)',
            }}
          />
        </>
      )}

      {/* ── Layer 3: Particle burst ─────────────────────────────── */}
      {particles.map((p) => (
        <div
          key={p.id}
          aria-hidden
          style={{
            position: 'fixed',
            left: p.x,
            top: p.y,
            zIndex: 9999,
            pointerEvents: 'none',
            width:  `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            transform: 'translate(-50%,-50%)',
            animation: 'particleFly 850ms cubic-bezier(0.16,1,0.3,1) forwards',
            '--fx': `${p.finalX}px`,
            '--fy': `${p.finalY}px`,
            willChange: 'transform, opacity',
          } as React.CSSProperties}
        />
      ))}

      {/* ── Toggle button ──────────────────────────────────────── */}
      <button
        className={`theme-toggle${btnClicked ? ' btn-clicked' : ''}`}
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 650ms cubic-bezier(0.76,0,0.24,1)',
            transform: iconSpin ? 'rotate(360deg)' : 'rotate(0deg)',
            willChange: 'transform',
          }}
        >
          {isDark ? (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
              stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1"    x2="12" y2="3" />
              <line x1="12" y1="21"   x2="12" y2="23" />
              <line x1="4.22"  y1="4.22"   x2="5.64"  y2="5.64" />
              <line x1="18.36" y1="18.36"  x2="19.78" y2="19.78" />
              <line x1="1"     y1="12"     x2="3"     y2="12" />
              <line x1="21"    y1="12"     x2="23"    y2="12" />
              <line x1="4.22"  y1="19.78"  x2="5.64"  y2="18.36" />
              <line x1="18.36" y1="5.64"   x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
              stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}
