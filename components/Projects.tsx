'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { projects } from '@/lib/data';

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

// ── 3D Device Mockup (CSS-only laptop) ──────────────────────────
function DeviceMockup({
  project,
  isDark,
}: {
  project: (typeof projects)[0];
  isDark: boolean;
}) {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltX(y * -10);
    setTiltY(x * 14);
  };
  const handleLeave = () => { setTiltX(0); setTiltY(0); };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        perspective: '900px',
        width: '100%', maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <motion.div
        animate={{ rotateY: [0, 3, 0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Laptop lid */}
        <div style={{
          width: '100%', paddingBottom: '66%',
          background: isDark ? '#1a1a2e' : '#e8e8ee',
          borderRadius: '12px 12px 0 0',
          border: isDark ? '2px solid #2a2a4a' : '2px solid #ccc',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark
            ? `0 0 60px ${project.color}40, 0 20px 60px rgba(0,0,0,0.6)`
            : `0 0 40px ${project.color}30, 0 20px 40px rgba(0,0,0,0.15)`,
        }}>
          {/* Screen */}
          <div style={{
            position: 'absolute', inset: '8px',
            borderRadius: '6px',
            background: `linear-gradient(135deg, ${project.gradientFrom} 0%, ${project.gradientTo} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px',
            overflow: 'hidden',
          }}>
            {/* Screen content */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.38)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
              flexDirection: 'column', padding: '40px 16px 16px 16px',
            }}>
              {/* Browser chrome */}
              <div style={{
                position: 'absolute', top: '8px', left: '8px', right: '8px',
                height: '26px',
                background: 'rgba(0,0,0,0.45)',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px',
              }}>
                {['#ff5f57','#ffbd2e','#28c840'].map((c) => (
                  <div key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c }} />
                ))}
                {/* URL bar */}
                <div style={{
                  flex: 1, height: '14px', marginLeft: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '3px',
                }}/>
              </div>

              {/* Project title */}
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '13px', color: '#fff', letterSpacing: '-0.02em',
                marginBottom: '10px', lineHeight: 1.2,
                textShadow: `0 0 20px ${project.color}80`,
              }}>
                {project.title}
              </div>

              {/* Stat row */}
              <div style={{
                display: 'flex', gap: '6px', marginBottom: '10px',
              }}>
                {[project.achievement].map((badge) => (
                  <div key={badge} style={{
                    padding: '2px 8px',
                    background: `${project.color}22`,
                    border: `1px solid ${project.color}50`,
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)', fontSize: '8px',
                    color: project.color, letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>
                    {badge}
                  </div>
                ))}
              </div>

              {/* Tech stack pills — top 4 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {project.tech.slice(0, 4).map((t) => (
                  <div key={t} style={{
                    padding: '2px 7px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-mono)', fontSize: '8px',
                    color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em',
                  }}>
                    {t}
                  </div>
                ))}
              </div>

              {/* Simulated code lines using project color */}
              <div style={{ width: '100%', marginTop: '10px' }}>
                {[75, 55, 85, 45, 65, 40].map((w, i) => (
                  <div key={i} style={{
                    height: '3px', borderRadius: '2px', margin: '4px 0',
                    background: i % 3 === 0
                      ? `${project.color}50`
                      : `rgba(255,255,255,${0.08 + (i % 2) * 0.05})`,
                    width: `${w}%`,
                  }} />
                ))}
              </div>
            </div>
            {/* Glow pulse */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle at 50% 50%, ${project.color}30 0%, transparent 70%)`,
              animation: 'pulse-slow 3s ease-in-out infinite',
            }} />
          </div>
          {/* Camera dot */}
          <div style={{
            position: 'absolute', top: '4px', left: '50%',
            transform: 'translateX(-50%)',
            width: '6px', height: '6px', borderRadius: '50%',
            background: isDark ? '#2a2a4a' : '#ccc',
          }} />
        </div>

        {/* Laptop base */}
        <div style={{
          width: '110%', marginLeft: '-5%',
          height: '16px',
          background: isDark ? '#141428' : '#d8d8e0',
          borderRadius: '0 0 6px 6px',
          border: isDark ? '2px solid #1e1e3a' : '2px solid #bbb',
          borderTop: 'none',
        }} />
        <div style={{
          width: '105%', marginLeft: '-2.5%',
          height: '6px',
          background: isDark ? '#0e0e1e' : '#c8c8d0',
          borderRadius: '0 0 4px 4px',
        }} />

        {/* Ambient glow under device */}
        <div style={{
          position: 'absolute', bottom: '-20px', left: '50%',
          transform: 'translateX(-50%)',
          width: '70%', height: '30px',
          background: `radial-gradient(ellipse, ${project.color}50 0%, transparent 70%)`,
          filter: 'blur(12px)',
        }} />
      </motion.div>
    </div>
  );
}

// ── Single project panel ─────────────────────────────────────────
function ProjectPanel({
  project,
  isActive,
  isDark,
}: {
  project: (typeof projects)[0];
  isActive: boolean;
  isDark: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            width: '100%',
          }}
          className="project-panel"
        >
          {/* Left: content */}
          <div>
            {/* Background number */}
            <div style={{
              position: 'absolute',
              top: '-20px', left: '-10px',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(100px, 16vw, 180px)',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
              lineHeight: 1,
              letterSpacing: '-0.06em',
              userSelect: 'none', pointerEvents: 'none',
              zIndex: 0,
            }}>
              {String(project.id).padStart(2, '0')}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Year */}
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: `${project.color}18`,
                border: `1px solid ${project.color}35`,
                borderRadius: '100px',
                fontFamily: 'var(--font-body)', fontSize: '12px',
                color: project.color, fontWeight: 600,
                letterSpacing: '0.08em',
                marginBottom: '20px',
              }}>
                {project.year}
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: 'var(--text)',
                marginBottom: '12px',
              }}>
                {project.title}
              </h3>

              {/* One-liner */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                color: project.color,
                fontStyle: 'italic',
                marginBottom: '20px',
                letterSpacing: '0.01em',
              }}>
                {project.oneLiner}
              </p>

              {/* Description */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: isDark ? 'rgba(240,240,245,0.72)' : '#374151',
                lineHeight: 1.8,
                marginBottom: '24px',
              }}>
                {project.description}
              </p>

              {/* Achievement badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                background: `${project.color}14`,
                border: `1px solid ${project.color}35`,
                borderRadius: '8px',
                marginBottom: '24px',
                boxShadow: `0 0 20px ${project.color}20`,
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={project.color} strokeWidth={2}>
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: project.color, fontWeight: 600,
                }}>
                  {project.achievement}
                </span>
              </div>

              {/* Tech pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                {project.tech.map((t) => (
                  <span key={t} className="tech-tag">{t}</span>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 22px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px',
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                    color: 'var(--text)', textDecoration: 'none', letterSpacing: '0.04em',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = project.color;
                    e.currentTarget.style.color = project.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Source Code
                </a>
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '10px 22px',
                      background: `${project.color}18`,
                      border: `1px solid ${project.color}40`,
                      borderRadius: '7px',
                      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                      color: project.color, textDecoration: 'none', letterSpacing: '0.04em',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${project.color}28`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${project.color}18`; }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: 3D device */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
            style={{ position: 'relative' }}
          >
            <DeviceMockup project={project} isDark={isDark} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isDark = useDarkMode();
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (isTransitioning || idx === active) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActive(idx);
      setIsTransitioning(false);
    }, 80);
  }, [active, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(Math.min(active + 1, projects.length - 1));
      if (e.key === 'ArrowLeft') goTo(Math.max(active - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, goTo]);

  const proj = projects[active];

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="section-pad"
      style={{
        position: 'relative',
        background: 'var(--surface)',
        overflow: 'hidden',
        minHeight: '100vh',
      }}
    >
      <div className="section-fade-top" />

      {/* Animated BG tint based on active project */}
      <motion.div
        key={proj.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 80% 50%, ${proj.color}08 0%, transparent 70%)`,
          pointerEvents: 'none', zIndex: 0,
          transition: 'background 0.8s ease',
        }}
      />

      <div className="container-xl" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px',
          marginBottom: '64px',
        }}>
          <div>
            <motion.div
              className="section-label"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span>03 — Projects</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 5vw, 64px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
              }}
            >
              Things I&apos;ve Built
            </motion.h2>
          </div>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px',
              paddingTop: '40px',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '13px',
              color: 'var(--text-muted)', letterSpacing: '0.1em',
            }}>
              <span style={{ color: proj.color, fontWeight: 700 }}>
                {String(active + 1).padStart(2, '0')}
              </span>
              {' / '}
              {String(projects.length).padStart(2, '0')}
            </div>
            {/* Nav dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === active ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: i === active ? p.color : 'var(--border)',
                    transition: 'all 0.35s ease',
                    boxShadow: i === active ? `0 0 12px ${p.color}60` : 'none',
                  }}
                  aria-label={`Go to project ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Project panel */}
        <div style={{ position: 'relative', minHeight: 'clamp(520px, 62vh, 680px)', overflow: 'hidden' }}>
          {projects.map((p, i) => (
            <div
              key={p.id}
              style={{ position: 'absolute', inset: 0, display: i === active ? 'block' : 'none' }}
            >
              <ProjectPanel project={p} isActive={i === active} isDark={isDark} />
            </div>
          ))}
        </div>

        {/* Prev/Next arrows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex', gap: '12px', justifyContent: 'flex-end',
            marginTop: '48px',
          }}
        >
          {['prev', 'next'].map((dir) => {
            const isPrev = dir === 'prev';
            const disabled = isPrev ? active === 0 : active === projects.length - 1;
            return (
              <button
                key={dir}
                onClick={() => goTo(isPrev ? active - 1 : active + 1)}
                disabled={disabled}
                style={{
                  width: '48px', height: '48px',
                  borderRadius: '50%',
                  border: `1px solid ${disabled ? 'var(--border)' : proj.color + '50'}`,
                  background: disabled ? 'transparent' : `${proj.color}10`,
                  color: disabled ? 'var(--text-muted)' : proj.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  opacity: disabled ? 0.35 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.background = `${proj.color}20`;
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = disabled ? 'transparent' : `${proj.color}10`;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d={isPrev ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                </svg>
              </button>
            );
          })}
        </motion.div>
      </div>

      <div className="section-fade-bottom" />

      <style>{`
        .project-panel { grid-template-columns: 1fr 1fr; }
        @media (max-width: 860px) {
          .project-panel { grid-template-columns: 1fr !important; }
          .project-panel > div:last-child { display: none; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
