'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { stats, aboutSkills } from '@/lib/data';

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

// ── Animated counter ────────────────────────────────────────────
function Counter({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const numStr = value.replace(/[^0-9.]/g, '');
    const suffix = value.replace(/[0-9.]/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) { setDisplay(value); return; }

    let start = 0;
    const duration = 1800;
    const step = 16;
    const steps = duration / step;
    const increment = num / steps;
    let current = 0;

    const id = setInterval(() => {
      current += increment;
      if (current >= num) {
        clearInterval(id);
        setDisplay(value);
      } else {
        const disp = Number.isInteger(num) ? Math.floor(current).toString() : current.toFixed(1);
        setDisplay(disp + suffix);
      }
    }, step);

    return () => clearInterval(id);
  }, [inView, value]);

  return <>{display}</>;
}

// ── 3D Tilt card ────────────────────────────────────────────────
function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)', ...style }}
    >
      {children}
    </div>
  );
}

// ── Skill badge ────────────────────────────────────────────────
const SKILL_COLORS: Record<string, string> = {
  React: '#61dafb', Python: '#3776ab', TypeScript: '#3178c6',
  'Next.js': '#ffffff', PyTorch: '#ee4c2c', 'Node.js': '#68a063',
  AWS: '#ff9900', Docker: '#2496ed',
};

function SkillBadge({ name }: { name: string }) {
  const color = SKILL_COLORS[name] || '#6c63ff';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 18px',
        background: hovered ? `${color}18` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? color : 'var(--border)'}`,
        borderRadius: '100px',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        fontWeight: 500,
        color: hovered ? color : 'var(--text-muted)',
        cursor: 'default',
        transition: 'all 0.3s ease',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        boxShadow: hovered ? `0 0 16px ${color}40` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </div>
  );
}

// ── Avatar / photo frame placeholder ───────────────────────────
function AvatarFrame({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
      {/* Rotating conic border */}
      <div style={{
        position: 'absolute', inset: '-3px',
        borderRadius: '24px',
        background: `conic-gradient(from 0deg, ${isDark ? '#6c63ff, #00d4ff, #9b8fff, #6c63ff' : '#4f46e5, #0891b2, #7c3aed, #4f46e5'})`,
        animation: 'spin 6s linear infinite',
        zIndex: 0,
      }} />

      {/* Main frame */}
      <div style={{
        position: 'relative', zIndex: 1,
        borderRadius: '22px',
        overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0e0e2a 0%, #1a1a3a 50%, #0a0a1f 100%)'
          : 'linear-gradient(135deg, #e8e4ff 0%, #f0eeff 50%, #ddd8ff 100%)',
        aspectRatio: '4/5',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Gradient mesh orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '22px' }}>
          <div style={{
            position: 'absolute', width: '260px', height: '260px',
            top: '-60px', left: '-60px',
            background: 'radial-gradient(circle, rgba(108,99,255,0.35) 0%, transparent 70%)',
            animation: 'drift-1 18s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '220px', height: '220px',
            bottom: '-40px', right: '-40px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, transparent 70%)',
            animation: 'drift-2 22s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '180px', height: '180px',
            top: '40%', left: '30%',
            background: 'radial-gradient(circle, rgba(155,143,255,0.2) 0%, transparent 70%)',
            animation: 'drift-3 26s ease-in-out infinite',
          }} />
        </div>

        {/* BR monogram */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '120px', height: '120px',
          borderRadius: '50%',
          background: isDark
            ? 'linear-gradient(135deg, #6c63ff, #00d4ff)'
            : 'linear-gradient(135deg, #4f46e5, #0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isDark
            ? '0 0 60px rgba(108,99,255,0.6), 0 0 120px rgba(0,212,255,0.3)'
            : '0 0 40px rgba(79,70,229,0.4)',
          marginBottom: '24px',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '44px', color: '#fff', letterSpacing: '-0.06em',
          }}>BR</span>
        </div>

        {/* Available badge */}
        <div style={{
          position: 'absolute', top: '20px', right: '20px',
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px',
          background: 'rgba(0,255,136,0.12)',
          border: '1px solid rgba(0,255,136,0.3)',
          borderRadius: '100px',
          backdropFilter: 'blur(8px)',
          zIndex: 3,
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00ff88',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '11px',
            color: '#00ff88', fontWeight: 600, letterSpacing: '0.06em',
          }}>
            Available
          </span>
        </div>

        {/* Bottom frosted bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '16px 20px',
          background: 'rgba(6,6,15,0.7)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          zIndex: 3,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.02em',
          }}>
            Brijesh Rana
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '12px',
            color: 'var(--text-muted)', marginTop: '2px',
          }}>
            Software Engineer
          </div>
        </div>

        {/* Floating skill chips */}
        {[
          { label: 'React', x: '-60px', y: '25%', delay: '0s' },
          { label: 'Python', x: 'calc(100% + 14px)', y: '35%', delay: '0.8s' },
          { label: 'AI/ML', x: '-70px', y: '60%', delay: '1.6s' },
        ].map((chip) => (
          <div
            key={chip.label}
            style={{
              position: 'absolute', left: chip.x, top: chip.y,
              padding: '6px 14px',
              background: isDark ? 'rgba(14,14,26,0.9)' : 'rgba(255,255,255,0.9)',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              fontFamily: 'var(--font-body)', fontSize: '12px',
              color: 'var(--text)', fontWeight: 600,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              zIndex: 4,
              animation: `float-orbit 6s ease-in-out infinite`,
              animationDelay: chip.delay,
              whiteSpace: 'nowrap',
            }}
          >
            {chip.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });
  const isDark = useDarkMode();

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-pad"
      style={{ position: 'relative', background: 'var(--surface)', overflow: 'hidden' }}
    >
      <div className="section-fade-top" />

      {/* Background orb */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '10%', right: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      <div className="container-xl" style={{ position: 'relative', zIndex: 1 }}>

        {/* Section label */}
        <motion.div
          className="section-label"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span>01 — About</span>
        </motion.div>

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)',
          gap: '80px',
          alignItems: 'center',
        }}
          className="about-grid"
        >
          {/* Left: Avatar */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
          >
            <TiltCard>
              <AvatarFrame isDark={isDark} />
            </TiltCard>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 4.5vw, 54px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '32px',
            }}>
              Building the Future,{' '}
              <span className="gradient-text">One Line at a Time</span>
            </h2>

            <div style={{ marginBottom: '32px' }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(15px, 1.4vw, 17px)',
                color: isDark ? 'rgba(240,240,245,0.8)' : '#374151',
                lineHeight: 1.85,
                marginBottom: '18px',
              }}>
                I&apos;m a Computer Science Master&apos;s student at California State University, Long Beach, with a deep focus on full-stack development and AI/ML. I build systems that are fast, intelligent, and elegantly engineered — from real-time collaboration platforms to AI-powered voice agents.
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(15px, 1.4vw, 17px)',
                color: 'var(--text-muted)',
                lineHeight: 1.85,
              }}>
                Previously, I&apos;ve shipped production code at Zluck Solutions and Crest Data Systems, working across React, Python, and cloud infrastructure. I&apos;m always chasing the intersection of cutting-edge AI and bulletproof engineering.
              </p>
            </div>

            {/* Skill badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '48px' }}>
              {aboutSkills.map((skill) => (
                <SkillBadge key={skill} name={skill} />
              ))}
            </div>

            {/* Resume CTA */}
            <motion.a
              href="mailto:Brijesh.Rana-SA@csulb.edu"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '12px 28px',
                background: isDark ? 'rgba(108,99,255,0.15)' : 'rgba(79,70,229,0.1)',
                border: '1px solid rgba(108,99,255,0.35)',
                borderRadius: '8px',
                fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                color: isDark ? '#9b8fff' : '#4f46e5',
                textDecoration: 'none',
                letterSpacing: '0.04em',
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Get in Touch
            </motion.a>
          </motion.div>
        </div>

        {/* Stats row */}
        <div ref={statsRef} style={{ marginTop: '80px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: '40px 32px',
                  borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(32px, 5vw, 54px)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginBottom: '8px',
                  background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  <Counter value={stat.value} inView={statsInView} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: 'var(--text-muted)', fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="section-fade-bottom" />

      <style>{`
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @media (max-width: 640px) {
          .about-grid > div:first-child { max-width: 320px; margin: 0 auto; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
