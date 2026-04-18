'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { meta } from '@/lib/data';
import Magnetic from './Magnetic';
import ChatCompose from './ChatCompose';

const ContactScene = dynamic(() => import('./three/ContactScene'), { ssr: false });

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

// ── Floating particle field (canvas) ─────────────────────────────
function ContactParticles({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 80;
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 260 : 190,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${p.hue}, 80%, 75%, ${p.alpha})`
          : `hsla(${p.hue}, 60%, 45%, ${p.alpha * 0.5})`;
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  // No floating particles in light mode — looks wrong on light backgrounds
  if (!isDark) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}

// ── Social link ───────────────────────────────────────────────────
function SocialLink({
  href,
  label,
  icon,
  color,
  isDark,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Magnetic strength={0.3} radius={90}>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '12px 22px',
        background: hovered
          ? `${color}15`
          : isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
        border: `1px solid ${hovered
          ? `${color}50`
          : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(91,76,255,0.10)'}`,
        borderRadius: '10px',
        textDecoration: 'none',
        color: hovered ? color : isDark ? 'rgba(240,240,245,0.7)' : 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '14px', fontWeight: 600,
        letterSpacing: '0.04em',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 8px 24px ${color}25`
          : isDark ? 'none' : '0 2px 8px rgba(12,11,29,0.05)',
        transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      {icon}
      {label}
    </a>
    </Magnetic>
  );
}

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const isDark = useDarkMode();
  const [copied, setCopied] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(meta.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const headlineWords = ["Let's", 'Build', 'Something', 'Insane'];

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: isDark ? '#06060f' : 'transparent',
        padding: '140px 0 100px',
        minHeight: '80vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}
    >
      {/* Particle field */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ContactParticles isDark={isDark} />
      </div>

      {/* Color orbs — dark mode vs light mode versions */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {isDark ? (
          // Dark mode: deep purple/cyan/violet
          <>
            {[
              { color: 'rgba(108,99,255,0.18)', size: 700, x: '-10%', y: '10%', anim: 'drift-1 25s ease-in-out infinite' },
              { color: 'rgba(0,212,255,0.12)', size: 500, x: '70%', y: '50%', anim: 'drift-2 30s ease-in-out infinite' },
              { color: 'rgba(79,0,188,0.14)', size: 400, x: '30%', y: '80%', anim: 'drift-3 20s ease-in-out infinite' },
            ].map((orb, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: orb.x, top: orb.y,
                  width: orb.size, height: orb.size,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                  filter: 'blur(40px)',
                  animation: orb.anim,
                }}
              />
            ))}
          </>
        ) : (
          // Light mode: vivid violet + cyan blobs — replaces particles
          <>
            <div style={{
              position: 'absolute', left: '-5%', top: '15%',
              width: '520px', height: '520px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(180,160,255,0.35) 0%, transparent 68%)',
              filter: 'blur(60px)',
              animation: 'drift-1 25s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', right: '5%', top: '35%',
              width: '380px', height: '380px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(140,210,240,0.28) 0%, transparent 68%)',
              filter: 'blur(50px)',
              animation: 'drift-2 30s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', left: '35%', bottom: '10%',
              width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,180,200,0.22) 0%, transparent 68%)',
              filter: 'blur(45px)',
              animation: 'drift-3 20s ease-in-out infinite',
            }} />
          </>
        )}
      </div>

      {/* 3D constellation scene */}
      <div
        className="contact-3d-layer"
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          pointerEvents: 'auto',
          opacity: isDark ? 0.85 : 0.50,
          maskImage: 'radial-gradient(ellipse 45% 38% at 50% 50%, transparent 0%, rgba(0,0,0,0.25) 35%, #000 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse 45% 38% at 50% 50%, transparent 0%, rgba(0,0,0,0.25) 35%, #000 65%)',
        }}
      >
        <ContactScene isDark={isDark} mouse={mouse} />
      </div>

      {/* Film grain */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          opacity: 0.025,
        }}
      />

      <div
        className="container-xl"
        style={{
          position: 'relative', zIndex: 5,
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
      >
        {/* Decorated label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(108,99,255,0.5))', maxWidth: '120px' }} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '12px',
            color: 'var(--accent)', letterSpacing: '0.35em',
            textTransform: 'uppercase', fontWeight: 600,
          }}>
            Get in Touch
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(108,99,255,0.5))', maxWidth: '120px' }} />
        </motion.div>

        {/* Massive headline */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '0 18px', marginBottom: '32px',
        }}>
          {headlineWords.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, scale: 2.5, filter: 'blur(20px)' }}
              animate={inView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
              style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 7vw, 88px)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: (word === 'Something' || word === 'Insane')
                  ? 'transparent'
                  : isDark ? 'var(--text)' : '#0d0d1a',
                background: (word === 'Something' || word === 'Insane')
                  ? 'linear-gradient(135deg, var(--secondary), var(--accent))'
                  : 'none',
                WebkitBackgroundClip: (word === 'Something' || word === 'Insane') ? 'text' : 'unset',
                backgroundClip: (word === 'Something' || word === 'Insane') ? 'text' : 'unset',
                WebkitTextFillColor: (word === 'Something' || word === 'Insane') ? 'transparent' : 'unset',
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.7 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(14px, 1.6vw, 18px)',
            color: isDark ? 'rgba(240,240,245,0.55)' : 'var(--text-muted)',
            maxWidth: '520px',
            lineHeight: 1.75,
            marginBottom: '56px',
          }}
        >
          Open to Summer 2026 internships in software engineering, AI/ML, and agentic systems. Let&apos;s build something that moves the needle.
        </motion.p>

        {/* Chat-style compose widget — primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '28px' }}
        >
          <ChatCompose isDark={isDark} />
        </motion.div>

        {/* Secondary: direct email — small, subtle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.85, duration: 0.5 }}
          style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginBottom: '32px',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: 'var(--text-muted)',
          }}>
            or reach me directly at
          </span>
          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-mono)', fontSize: '13px',
              color: isDark ? 'rgba(240,240,245,0.85)' : 'var(--text)',
              background: 'transparent',
              border: 'none',
              padding: '2px 4px',
              borderBottom: `1px dashed ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              cursor: 'pointer',
              transition: 'color 0.25s ease, border-color 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.borderBottomColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDark ? 'rgba(240,240,245,0.85)' : '';
              e.currentTarget.style.borderBottomColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
            }}
            aria-label="Copy email address"
          >
            {meta.email}
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h4a2 2 0 002-2M8 5a2 2 0 012-2h4a2 2 0 012 2m4 3h2a2 2 0 012 2v4m-6 4h6" />
            </svg>
          </button>

          {/* Copied toast */}
          <motion.div
            initial={false}
            animate={copied ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 11px',
              background: isDark ? 'rgba(14,14,26,0.95)' : '#fff',
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: '7px',
              backdropFilter: 'blur(10px)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth={2.5}>
              <path d="M5 13l4 4L19 7" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '11px',
              color: '#00ff88', fontWeight: 600,
            }}>
              Copied!
            </span>
          </motion.div>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}
        >
          <SocialLink
            href={meta.linkedin}
            label="LinkedIn"
            color="#0a66c2"
            isDark={isDark}
            icon={
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            }
          />
          <SocialLink
            href={meta.github}
            label="GitHub"
            color="#9b8fff"
            isDark={isDark}
            icon={
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            }
          />
          <SocialLink
            href={`mailto:${meta.email}`}
            label="Email"
            color="#00d4ff"
            isDark={isDark}
            icon={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px',
            background: 'rgba(0,255,136,0.07)',
            border: '1px solid rgba(0,255,136,0.22)',
            borderRadius: '100px',
            backdropFilter: 'blur(8px)',
            marginBottom: '48px',
          }}
        >
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 10px #00ff88',
            animation: 'pulse-green 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: '#00ff88', fontWeight: 600, letterSpacing: '0.06em',
          }}>
            {meta.status}
          </span>
        </motion.div>
      </div>

      {/* Footer credit */}
      <div style={{
        position: 'absolute', bottom: '28px', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        fontFamily: 'var(--font-body)', fontSize: '12px',
        color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        Designed & built by Brijesh Rana · {new Date().getFullYear()}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-3d-layer { display: none !important; }
        }
      `}</style>
    </section>
  );
}
