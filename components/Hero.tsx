'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { roles, tagline } from '@/lib/data';

const HeroScene = dynamic(() => import('./three/HeroScene'), {
  ssr: false,
  loading: () => null,
});

const FocalShape = dynamic(() => import('./three/FocalShape'), {
  ssr: false,
  loading: () => null,
});

// ── Theme ────────────────────────────────────────────────────────
function useDarkMode() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => setIsDark(!document.documentElement.classList.contains('light'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

// ── Typewriter ───────────────────────────────────────────────────
const ROLE_COLORS = ['#00d4ff', '#a78bfa', '#4ade80', '#fb923c'];

function TypewriterCycle({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) {
      const t = setTimeout(() => { setPause(false); setDeleting(true); }, 2000);
      return () => clearTimeout(t);
    }
    const target = words[idx];
    if (!deleting) {
      if (display.length < target.length) {
        const t = setTimeout(() => setDisplay(target.slice(0, display.length + 1)), 80);
        return () => clearTimeout(t);
      } else {
        setPause(true);
      }
    } else {
      if (display.length > 0) {
        const t = setTimeout(() => setDisplay(display.slice(0, -1)), 40);
        return () => clearTimeout(t);
      } else {
        setDeleting(false);
        setIdx((i) => (i + 1) % words.length);
      }
    }
  }, [display, deleting, pause, idx, words]);

  return (
    <span style={{ color: ROLE_COLORS[idx % ROLE_COLORS.length], transition: 'color 0.4s ease' }}>
      {display}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.55, ease: 'linear' }}
        style={{ display: 'inline-block', marginLeft: '1px', fontWeight: 300 }}
      >|</motion.span>
    </span>
  );
}

// ── Magnetic button ──────────────────────────────────────────────
function MagneticBtn({
  children,
  onClick,
  href,
  variant = 'primary',
  isDark,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'ghost';
  isDark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.22;
    const y = (e.clientY - r.top - r.height / 2) * 0.22;
    el.style.transform = `translate(${x}px,${y}px)`;
  };

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
    position: 'relative',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const primary: React.CSSProperties = {
    ...base,
    background: isDark
      ? 'linear-gradient(135deg, #6c63ff 0%, #00d4ff 100%)'
      : 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: isDark
      ? '0 0 28px rgba(108,99,255,0.35), 0 4px 16px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(79,70,229,0.35)',
  };

  const ghost: React.CSSProperties = {
    ...base,
    background: 'transparent',
    color: isDark ? 'rgba(240,240,245,0.75)' : '#374151',
    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
  };

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (variant === 'primary') {
      el.style.boxShadow = isDark
        ? '0 0 40px rgba(108,99,255,0.55), 0 8px 24px rgba(0,0,0,0.3)'
        : '0 6px 28px rgba(79,70,229,0.5)';
      el.style.filter = 'brightness(1.12)';
    } else {
      el.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
      el.style.borderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
    }
    const arrow = el.querySelector('.btn-arrow') as HTMLElement;
    if (arrow) arrow.style.transform = 'translateX(4px)';
  };

  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
    const el = e.currentTarget;
    if (variant === 'primary') {
      el.style.boxShadow = isDark
        ? '0 0 28px rgba(108,99,255,0.35), 0 4px 16px rgba(0,0,0,0.3)'
        : '0 4px 20px rgba(79,70,229,0.35)';
      el.style.filter = '';
    } else {
      el.style.background = 'transparent';
      el.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
    }
    const arrow = el.querySelector('.btn-arrow') as HTMLElement;
    if (arrow) arrow.style.transform = 'translateX(0)';
  };

  const inner = (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        ...(variant === 'primary' ? primary : ghost),
        transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none', display: 'inline-block' }}>
        {inner}
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, display: 'inline-block' }}
    >
      {inner}
    </button>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const isDark = useDarkMode();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const LINE_1 = 'BRIJESH'.split('');
  const LINE_2 = 'RANA'.split('');

  const line1Delay = (i: number) => 0.45 + i * 0.04;
  const line2Delay = (i: number) => 0.45 + LINE_1.length * 0.04 + 0.06 + i * 0.04;

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Layer 1: R3F full-viewport scene (starfield + peripheral shapes) ── */}
      {mounted && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <HeroScene isDark={isDark} mouse={mouse} />
        </div>
      )}

      {/* ── Layer 2: Gradient fog blobs ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: '-10%', left: '-8%',
          width: '50vw', height: '50vw',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 65%)',
          filter: 'blur(70px)',
          animation: 'drift-1 32s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '-5%', right: '5%',
          width: '38vw', height: '38vw',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(0,212,255,0.13) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'drift-2 26s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '40%', left: '38%',
          width: '28vw', height: '28vw',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(79,0,188,0.10) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(109,40,217,0.05) 0%, transparent 65%)',
          filter: 'blur(50px)',
          animation: 'drift-3 38s ease-in-out infinite',
        }} />
      </div>

      {/* ── Layer 3: Film grain ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          opacity: isDark ? 0.030 : 0.015,
        }}
      />

      {/* ── Layer 3: Vignette ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(6,6,15,0.52) 100%)',
        }}
      />

      {/* ── Main content layout ── */}
      <div
        style={{
          position: 'relative', zIndex: 5,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '100px 0 60px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 80px)',
            display: 'grid',
            gridTemplateColumns: '1fr 0.48fr',
            gap: '48px',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* ══ LEFT COLUMN ══════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                background: isDark ? 'rgba(0,212,255,0.05)' : 'rgba(8,145,178,0.07)',
                border: '1px solid rgba(0,212,255,0.28)',
                borderRadius: '100px',
                marginBottom: '44px',
                width: 'fit-content',
              }}
            >
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 8px #00ff88',
                animation: 'pulse-green 2s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: isDark ? 'rgba(0,212,255,0.9)' : '#0891b2',
              }}>
                Open to Summer 2026 Internships
              </span>
            </motion.div>

            {/* Name — two stacked lines */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', overflow: 'hidden', lineHeight: 0.95, paddingBottom: '4px' }}>
                {LINE_1.map((letter, i) => (
                  <motion.span
                    key={`l1-${i}`}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: line1Delay(i), duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 'clamp(4.2rem, 9.5vw, 9rem)',
                      letterSpacing: '0.02em',
                      lineHeight: 0.95,
                      color: isDark ? '#f0f0f5' : '#0d0d1a',
                      textShadow: isDark ? '0 0 80px rgba(108,99,255,0.15)' : 'none',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              <div style={{ display: 'flex', overflow: 'hidden', lineHeight: 0.95 }}>
                {LINE_2.map((letter, i) => (
                  <motion.span
                    key={`l2-${i}`}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: line2Delay(i), duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 'clamp(4.2rem, 9.5vw, 9rem)',
                      letterSpacing: '0.02em',
                      lineHeight: 0.95,
                      color: isDark ? '#f0f0f5' : '#0d0d1a',
                      textShadow: isDark ? '0 0 80px rgba(108,99,255,0.15)' : 'none',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Gradient accent line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '120px', opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              style={{
                height: '2px',
                background: isDark
                  ? 'linear-gradient(90deg, #6c63ff, #00d4ff, transparent)'
                  : 'linear-gradient(90deg, #4f46e5, #0891b2, transparent)',
                borderRadius: '2px',
                marginBottom: '28px',
                boxShadow: isDark ? '0 0 12px rgba(108,99,255,0.6)' : 'none',
                flexShrink: 0,
              }}
            />

            {/* Role typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.25, duration: 0.5 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(14px, 1.6vw, 17px)',
                marginBottom: '28px',
                minHeight: '26px',
              }}
            >
              <TypewriterCycle words={roles} />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.45, duration: 0.7 }}
              style={{
                fontFamily: 'Georgia, "Source Serif 4", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(14px, 1.4vw, 19px)',
                color: isDark ? 'rgba(240,240,245,0.50)' : '#4b5563',
                maxWidth: '460px',
                lineHeight: 1.65,
                marginBottom: '44px',
              }}
            >
              {tagline}
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.65, duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
              style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}
            >
              <MagneticBtn
                variant="primary"
                isDark={isDark}
                onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>View My Work</span>
                <svg
                  className="btn-arrow"
                  width="16" height="16"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5}
                  style={{ transition: 'transform 0.25s ease', flexShrink: 0 }}
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </MagneticBtn>

              <MagneticBtn
                variant="ghost"
                isDark={isDark}
                href="mailto:Brijesh.Rana-SA@csulb.edu"
              >
                <span>Get in Touch</span>
              </MagneticBtn>
            </motion.div>
          </div>

          {/* ══ RIGHT COLUMN — Small focal icosahedron ════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1.0, ease: [0.33, 1, 0.68, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="hero-focal"
          >
            {/* Soft ambient glow behind the shape */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                width: '260px', height: '260px',
                borderRadius: '50%',
                background: isDark
                  ? 'radial-gradient(circle, rgba(108,99,255,0.14) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
                filter: 'blur(24px)',
                pointerEvents: 'none',
              }}
            />

            {/* R3F focal shape — constrained, not dominating */}
            {mounted && (
              <div style={{ width: '240px', height: '240px', position: 'relative' }}>
                <FocalShape isDark={isDark} mouse={mouse} />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.4,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '40px',
            background: isDark
              ? 'linear-gradient(to bottom, rgba(0,212,255,0.7), transparent)'
              : 'linear-gradient(to bottom, rgba(79,70,229,0.6), transparent)',
          }}
        />
      </motion.div>

      {/* Bottom fade */}
      <div className="section-fade-bottom" style={{ zIndex: 5 }} />

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid > div:first-child {
            align-items: center !important;
          }
          .hero-grid > div:first-child p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-focal {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .hero-grid > div > div:last-of-type {
            justify-content: center !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
}
