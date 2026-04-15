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
function TiltCard({ children, style, intensity = 12 }: { children: React.ReactNode; style?: React.CSSProperties; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.25s ease-out', ...style }}
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

// ── Bento grid data ──────────────────────────────────────────────
type TokenType = 'kw' | 'fn' | 'str' | 'muted' | 'plain';

const CODE_LINES: [string, TokenType][][] = [
  [['class ', 'kw'], ['Agent', 'plain'], [':', 'muted']],
  [['  def ', 'plain'], ['__init__', 'fn'], ['(self):', 'muted']],
  [['    self.model', 'plain'], [' = ', 'muted'], ['"gpt-4o"', 'str']],
  [['    self.memory', 'plain'], [' = []', 'muted']],
  [],
  [['  ', 'plain'], ['async', 'kw'], [' def ', 'plain'], ['think', 'fn'], ['(', 'muted']],
  [['    self, ctx: ', 'plain'], ['str', 'kw']],
  [['  ) -> ', 'muted'], ['str', 'kw'], [':', 'muted']],
  [['    ', 'plain'], ['return', 'kw'], [' ', 'plain'], ['await', 'kw']],
  [['      self.reason(ctx)', 'plain']],
];

const BENTO_TECHS = [
  { name: 'React',      color: '#61dafb' },
  { name: 'Python',     color: '#3776ab' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Next.js',    color: '#e2e8f0' },
  { name: 'PyTorch',    color: '#ee4c2c' },
  { name: 'LangChain',  color: '#22c55e' },
  { name: 'Node.js',    color: '#68a063' },
  { name: 'AWS',        color: '#ff9900' },
  { name: 'FastAPI',    color: '#009688' },
];

// ── Bento grid (left side of About) ─────────────────────────────
function BentoGrid({ isDark, inView }: { isDark: boolean; inView: boolean }) {
  const [cursor, setCursor] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  const tokenColor = (type: TokenType): string => {
    switch (type) {
      case 'kw':    return isDark ? '#c4b5fd' : '#7c3aed';
      case 'fn':    return isDark ? '#86efac' : '#059669';
      case 'str':   return isDark ? '#67e8f9' : '#0891b2';
      case 'muted': return isDark ? 'rgba(240,240,245,0.35)' : '#9ca3af';
      default:      return isDark ? 'rgba(240,240,245,0.82)' : '#374151';
    }
  };

  const cardBase: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(91,76,255,0.07)'}`,
    borderRadius: '14px',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
  };

  const doubled = [...BENTO_TECHS, ...BENTO_TECHS];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '12px',
      maxWidth: '460px',
      width: '100%',
    }}>
      {/* CARD 1 — Code snippet (spans 2 rows) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          ...cardBase,
          gridColumn: '1',
          gridRow: '1 / 3',
          overflow: 'hidden',
        }}
      >
        {/* Editor top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 14px',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57', flexShrink: 0 }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e', flexShrink: 0 }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840', flexShrink: 0 }} />
          <span style={{
            marginLeft: '8px',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: isDark ? 'rgba(240,240,245,0.38)' : '#9ca3af',
          }}>main.py</span>
        </div>

        {/* Code body */}
        <div style={{ padding: '14px 16px' }}>
          {CODE_LINES.map((line, li) => (
            <div key={li} style={{
              display: 'flex',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: '1.72',
              minHeight: '1.72em',
            }}>
              <span style={{
                marginRight: '14px',
                color: isDark ? 'rgba(240,240,245,0.18)' : '#d1d5db',
                userSelect: 'none',
                minWidth: '14px',
                textAlign: 'right',
                flexShrink: 0,
              }}>{li + 1}</span>
              <span>
                {line.map(([text, type], ti) => (
                  <span key={ti} style={{ color: tokenColor(type) }}>{text}</span>
                ))}
                {li === CODE_LINES.length - 1 && (
                  <span style={{
                    display: 'inline-block',
                    width: '2px', height: '13px',
                    background: isDark ? '#c4b5fd' : '#7c3aed',
                    marginLeft: '1px',
                    verticalAlign: 'text-bottom',
                    opacity: cursor ? 1 : 0,
                    transition: 'opacity 0.1s',
                  }} />
                )}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CARD 2 — Location */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          ...cardBase,
          gridColumn: '2',
          gridRow: '1',
          padding: '20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: '3px',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={isDark ? '#9b8fff' : '#7c3aed'} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ marginBottom: '8px' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <div style={{
          fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
          color: 'var(--text)', letterSpacing: '-0.02em',
        }}>Long Beach, CA</div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '13px',
          color: 'var(--text-muted)',
        }}>CSULB &apos;26</div>
      </motion.div>

      {/* CARD 3 — Availability */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          ...cardBase,
          gridColumn: '2',
          gridRow: '2',
          padding: '20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: '3px',
          background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.04)',
          border: `1px solid ${isDark ? 'rgba(16,185,129,0.14)' : 'rgba(16,185,129,0.16)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16,185,129,0.6)',
            animation: 'pulseDot 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px',
            color: '#10b981', letterSpacing: '-0.01em',
          }}>Available</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '12px',
          color: 'var(--text-muted)', lineHeight: 1.55,
        }}>Summer 2026<br />Internships</div>
      </motion.div>

      {/* CARD 4 — Tech marquee */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          ...cardBase,
          gridColumn: '1 / -1',
          padding: '14px 0',
          overflow: 'hidden',
          maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div style={{
          display: 'flex',
          animation: 'bentoMarquee 20s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
          width: 'max-content',
        }}>
          {doubled.map((tech, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '0 20px',
              borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(91,76,255,0.07)'}`,
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: tech.color, flexShrink: 0,
                boxShadow: `0 0 6px ${tech.color}80`,
              }} />
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                color: isDark ? 'rgba(240,240,245,0.65)' : '#6b7280',
                whiteSpace: 'nowrap',
              }}>{tech.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
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
          {/* Left: Bento grid */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
          >
            <TiltCard intensity={5}>
              <BentoGrid isDark={isDark} inView={inView} />
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
                I&apos;m a Computer Science Master&apos;s student at CSULB focused on agentic AI systems — software that doesn&apos;t just respond, but reasons, plans, and acts. I build across the full stack: from React UIs and FastAPI services to LLM pipelines and RAG architectures, with a bias toward performance and clean abstractions.
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(15px, 1.4vw, 17px)',
                color: 'var(--text-muted)',
                lineHeight: 1.85,
              }}>
                I&apos;ve shipped production code at Zluck Solutions and Crest Data Systems, and currently build AI-integrated web systems at ASI, CSULB. My sweet spot is the intersection of autonomous AI and bulletproof engineering — where intelligent software actually ships.
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
          .about-grid > div:first-child { max-width: 100%; margin: 0 auto; }
        }
        @media (max-width: 500px) {
          .bento-card-code { grid-column: 1 / -1 !important; grid-row: auto !important; }
          .bento-card-marquee { grid-column: 1 / -1 !important; }
        }

        @keyframes bentoMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%       { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
