'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { experiences, education } from '@/lib/data';

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

// ── SVG Timeline line that draws itself on scroll ──────────────
function TimelineLine() {
  const ref = useRef<SVGLineElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setLineHeight(containerRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: '50%',
        top: 0, bottom: 0,
        transform: 'translateX(-50%)',
        width: '2px',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="2"
        height={lineHeight || '100%'}
        style={{ position: 'absolute', top: 0, left: 0 }}
        overflow="visible"
      >
        {/* Background track */}
        <line
          x1="1" y1="0" x2="1" y2={lineHeight}
          stroke="var(--border)" strokeWidth="2"
        />
        {/* Animated progress line */}
        <motion.line
          ref={ref}
          x1="1" y1="0" x2="1" y2={lineHeight}
          stroke="url(#timelineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength, scaleY: pathLength }}
        />
        {/* Gradient def */}
        <defs>
          <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c63ff" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#9b8fff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Glowing dot that travels down */}
      <motion.div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
          width: '12px', height: '12px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
          boxShadow: '0 0 20px rgba(108,99,255,0.8), 0 0 40px rgba(0,212,255,0.4)',
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ── Experience card ─────────────────────────────────────────────
function ExperienceCard({
  exp,
  index,
  isDark,
}: {
  exp: (typeof experiences)[0];
  index: number;
  isDark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 48px 1fr',
        gap: '0',
        alignItems: 'start',
        marginBottom: '80px',
        position: 'relative',
        zIndex: 1,
      }}
      className="exp-row"
    >
      {/* Left content slot */}
      <div style={{ paddingRight: '40px' }}>
        {isLeft && (
          <motion.div
            initial={{ opacity: 0, x: -60, filter: 'blur(4px)' }}
            animate={inView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
          >
            <ExpCardContent exp={exp} isDark={isDark} align="right" />
          </motion.div>
        )}
      </div>

      {/* Center dot */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '28px',
      }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${exp.color}, var(--accent))`,
            border: `3px solid ${isDark ? 'var(--bg)' : '#fff'}`,
            boxShadow: `0 0 20px ${exp.color}60`,
            zIndex: 3,
          }}
        />
      </div>

      {/* Right content slot */}
      <div style={{ paddingLeft: '40px' }}>
        {!isLeft && (
          <motion.div
            initial={{ opacity: 0, x: 60, filter: 'blur(4px)' }}
            animate={inView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
          >
            <ExpCardContent exp={exp} isDark={isDark} align="left" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ExpCardContent({
  exp,
  isDark,
  align,
}: {
  exp: (typeof experiences)[0];
  isDark: boolean;
  align: 'left' | 'right';
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 32px',
        background: isDark ? 'var(--bg)' : '#ffffff',
        border: `1px solid ${hovered ? `${exp.color}40` : 'var(--border)'}`,
        borderRadius: '14px',
        transition: 'all 0.35s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? isDark
            ? `0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px ${exp.color}20`
            : `0 12px 30px rgba(0,0,0,0.1)`
          : isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
        textAlign: align,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: align === 'right' ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '6px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '3px 10px',
          background: `${exp.color}15`,
          border: `1px solid ${exp.color}30`,
          borderRadius: '100px',
          fontFamily: 'var(--font-body)', fontSize: '11px',
          color: exp.color, fontWeight: 600, letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}>
          {exp.period}
        </div>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '12px',
          color: 'var(--text-muted)', letterSpacing: '0.04em',
        }}>
          {exp.location}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '20px', fontWeight: 700,
        letterSpacing: '-0.03em',
        color: 'var(--text)', marginBottom: '4px',
      }}>
        {exp.role}
      </h3>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '14px',
        color: exp.color, fontWeight: 600, marginBottom: '16px',
      }}>
        {exp.company}
      </div>

      <ul style={{
        listStyle: 'none', margin: 0, padding: 0,
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        {exp.bullets.map((b, i) => (
          <li key={i} style={{
            display: 'flex',
            flexDirection: align === 'right' ? 'row-reverse' : 'row',
            gap: '10px',
            alignItems: 'flex-start',
          }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: exp.color, flexShrink: 0, marginTop: '7px',
            }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '14px',
              color: isDark ? 'rgba(240,240,245,0.72)' : '#374151',
              lineHeight: 1.7,
            }}>
              {b}
            </span>
          </li>
        ))}
      </ul>

      {/* Tech tags */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px',
        marginTop: '16px',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      }}>
        {exp.tech.map((t) => (
          <span key={t} className="tech-tag">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Education card ──────────────────────────────────────────────
function EducationCard({
  edu,
  index,
  isDark,
}: {
  edu: (typeof education)[0];
  index: number;
  isDark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '32px',
        background: isDark ? 'var(--bg)' : '#ffffff',
        border: `1px solid ${hovered ? `${edu.color}40` : 'var(--border)'}`,
        borderRadius: '16px',
        transition: 'all 0.35s ease',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered
          ? isDark
            ? `0 20px 40px rgba(0,0,0,0.35)`
            : '0 12px 30px rgba(0,0,0,0.1)'
          : 'none',
      }}
    >
      {/* Cap icon */}
      <div style={{
        width: '44px', height: '44px',
        borderRadius: '12px',
        background: `${edu.color}18`,
        border: `1px solid ${edu.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: edu.color, marginBottom: '20px',
        boxShadow: hovered ? `0 0 20px ${edu.color}40` : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px', fontWeight: 700,
        letterSpacing: '-0.03em',
        color: 'var(--text)', marginBottom: '6px',
      }}>
        {edu.degree}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '14px',
        color: edu.color, fontWeight: 600, marginBottom: '4px',
      }}>
        {edu.institution}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '13px',
        color: 'var(--text-muted)', marginBottom: '4px',
      }}>
        {edu.period} · {edu.location}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '13px',
        color: 'var(--text-muted)',
      }}>
        Focus: {edu.focus}
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const isDark = useDarkMode();

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="section-pad"
      style={{ position: 'relative', background: 'var(--bg)', overflow: 'hidden' }}
    >
      {/* Accent glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: '10%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      <div className="container-xl" style={{ position: 'relative', zIndex: 1 }}>

        {/* Section label + header */}
        <div ref={headerRef}>
          <motion.div
            className="section-label"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span>04 — Experience</span>
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
              marginBottom: '80px',
            }}
          >
            Where I&apos;ve Worked
          </motion.h2>
        </div>

        {/* Timeline */}
        <div
          ref={timelineRef}
          style={{ position: 'relative' }}
        >
          <TimelineLine />

          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.company} exp={exp} index={i} isDark={isDark} />
          ))}
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ marginTop: '80px' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            marginBottom: '40px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '12px',
              color: 'var(--text-muted)', letterSpacing: '0.25em',
              textTransform: 'uppercase', fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              Education
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
          }}
            className="edu-grid"
          >
            {education.map((edu, i) => (
              <EducationCard key={edu.institution} edu={edu} index={i} isDark={isDark} />
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .exp-row {
            grid-template-columns: 0 24px 1fr !important;
          }
          .exp-row > div:first-child { display: none; }
          .exp-row > div:last-child { padding-left: 20px !important; }
        }
        @media (max-width: 560px) {
          .edu-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
