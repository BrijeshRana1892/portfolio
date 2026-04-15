'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { skillsRow1, skillsRow2, skillsRow3, skillCategories } from '@/lib/data';

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

// ── Marquee row ──────────────────────────────────────────────────
function SkillPill({ name, color }: { name: string; color: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="skill-pill"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered ? `${color}50` : 'var(--border)',
        boxShadow: hovered ? `0 0 20px ${color}30` : 'none',
        transform: hovered ? 'scale(1.12)' : 'scale(1)',
      }}
    >
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}80`,
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px', fontWeight: 500,
        color: 'var(--text)', letterSpacing: '0.02em',
      }}>
        {name}
      </span>
    </div>
  );
}

function MarqueeRow({
  skills,
  reverse = false,
  speed = 32,
}: {
  skills: { name: string; color: string }[];
  reverse?: boolean;
  speed?: number;
}) {
  const [paused, setPaused] = useState(false);
  const doubled = [...skills, ...skills, ...skills];
  return (
    <div
      className="marquee-container"
      style={{ padding: '10px 0' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="marquee-track"
        style={{
          display: 'flex',
          width: 'max-content',
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${speed}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((s, i) => (
          <SkillPill key={`${s.name}-${i}`} name={s.name} color={s.color} />
        ))}
      </div>
    </div>
  );
}

// ── Category card ─────────────────────────────────────────────────
const CAT_ICONS: Record<string, React.ReactNode> = {
  Frontend: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Backend: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  'AI/ML': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  ),
  Database: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3M4 7v5c0 1.657 3.582 3 8 3s8-1.343 8-3V7M4 12v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5" />
    </svg>
  ),
  DevOps: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  Tools: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

function CategoryCard({
  cat,
  index,
  inView,
  isDark,
}: {
  cat: (typeof skillCategories)[0];
  index: number;
  inView: boolean;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 90, y: 30 }}
      animate={inView ? { opacity: 1, rotateX: 0, y: 0 } : {}}
      transition={{ delay: 0.5 + index * 0.09, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px',
        background: isDark ? 'var(--bg)' : '#ffffff',
        border: `1px solid ${hovered ? `${cat.color}40` : 'var(--border)'}`,
        borderLeft: `3px solid ${hovered ? cat.color : `${cat.color}60`}`,
        borderRadius: '12px',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
        boxShadow: hovered
          ? isDark
            ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${cat.color}20`
            : `0 12px 32px rgba(0,0,0,0.1), 0 0 0 1px ${cat.color}20`
          : 'none',
        perspective: '800px',
      }}
    >
      {/* Icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '38px', height: '38px',
          borderRadius: '10px',
          background: `${cat.color}18`,
          border: `1px solid ${cat.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cat.color,
          transition: 'all 0.3s ease',
          boxShadow: hovered ? `0 0 16px ${cat.color}40` : 'none',
        }}>
          {CAT_ICONS[cat.title]}
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px', fontWeight: 600,
          color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          {cat.title}
        </span>
      </div>

      {/* Skill pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
        {cat.skills.map((skill) => (
          <span
            key={skill}
            style={{
              padding: '4px 12px',
              background: `${cat.color}12`,
              border: `1px solid ${cat.color}22`,
              borderRadius: '100px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px', color: cat.color, fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' });
  const isDark = useDarkMode();

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="section-pad"
      style={{ position: 'relative', background: 'var(--bg)', overflow: 'hidden' }}
    >
      {/* Accent orb */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '20%', left: '-8%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      <div className="container-xl" style={{ position: 'relative', zIndex: 1, marginBottom: '60px' }}>

        {/* Section label */}
        <motion.div
          className="section-label"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span>02 — Skills</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            marginBottom: '16px',
          }}>
            My Tech Arsenal
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '17px', color: 'var(--text-muted)', maxWidth: '480px',
          }}>
            The tools I use to build things that matter
          </p>
        </motion.div>
      </div>

      {/* Marquee rows — 3 rows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{ marginBottom: '80px' }}
      >
        <MarqueeRow skills={skillsRow1} speed={34} />
        <MarqueeRow skills={skillsRow2} reverse speed={30} />
        <MarqueeRow skills={skillsRow3} speed={36} />
      </motion.div>

      {/* Category cards 3×2 grid */}
      <div className="container-xl" style={{ position: 'relative', zIndex: 1 }}>
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
          className="skills-grid"
        >
          {skillCategories.map((cat, i) => (
            <CategoryCard
              key={cat.title}
              cat={cat}
              index={i}
              inView={gridInView}
              isDark={isDark}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .skills-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .skills-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
