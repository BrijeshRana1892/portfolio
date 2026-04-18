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
  Languages: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 6 2 12 8 18" />
      <polyline points="16 6 22 12 16 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  ),
  Frontend: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </svg>
  ),
  Backend: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
      <line x1="7" y1="17" x2="7.01" y2="17" />
    </svg>
  ),
  'AI/ML': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  ),
  Database: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.657 3.582 3 8 3s8-1.343 8-3V5" />
      <path d="M4 11v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" />
    </svg>
  ),
  'Cloud & DevOps': (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.18 10.5 4.5 4.5 0 0 0 7 19h10.5z" />
      <path d="M9 15l2 2 4-4" />
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
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.5 + index * 0.09, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
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

        <div>
          <h2
            style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            marginBottom: '16px',
          }}>
            My Tech Arsenal
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.55 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px', color: 'var(--text-muted)', maxWidth: '480px',
            }}
          >
            The tools I use to build things that matter
          </motion.p>
        </div>
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
