'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { projects } from '@/lib/data';

type Project = (typeof projects)[number];

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

function Section({
  label,
  title,
  children,
  delay = 0,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: '96px' }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '14px',
        }}
      >
        {label}
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 3.4vw, 44px)',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          color: 'var(--text)',
          marginBottom: '28px',
        }}
      >
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export default function CaseStudyView({ project }: { project: Project }) {
  const isDark = useDarkMode();
  const cs = project.caseStudy;

  return (
    <main
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        minHeight: '100vh',
        paddingTop: '120px',
        paddingBottom: '120px',
      }}
    >
      {/* Accent orb */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '80px',
          right: '-10%',
          width: '620px',
          height: '620px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${project.color}12 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="container-xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '48px' }}
        >
          <Link
            href="/#projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All projects
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '80px', maxWidth: '900px' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: project.color,
              marginBottom: '20px',
            }}
          >
            Case Study · {project.year}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 6.5vw, 88px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              marginBottom: '24px',
            }}
          >
            {project.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(18px, 1.6vw, 22px)',
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              maxWidth: '720px',
              marginBottom: '36px',
            }}
          >
            {project.oneLiner}
          </p>

          {/* Meta strip */}
          {cs && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '32px',
                padding: '20px 0',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                marginBottom: '32px',
              }}
            >
              <MetaItem label="Role" value={cs.role} />
              <MetaItem label="Timeline" value={cs.timeline} />
              <MetaItem label="Status" value="Shipped" color={project.color} />
            </div>
          )}

          {/* Tech chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '36px' }}>
            {project.tech.map((t) => (
              <span
                key={t}
                style={{
                  padding: '5px 12px',
                  background: `${project.color}12`,
                  border: `1px solid ${project.color}25`,
                  borderRadius: '100px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: project.color,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
                border: '1px solid var(--border)',
                borderRadius: '7px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                textDecoration: 'none',
                letterSpacing: '0.04em',
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 22px',
                  background: `${project.color}18`,
                  border: `1px solid ${project.color}40`,
                  borderRadius: '7px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: project.color,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Demo
              </a>
            )}
          </div>
        </motion.header>

        {/* If no case study authored yet, show a gentle placeholder */}
        {!cs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              padding: '48px',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              maxWidth: '680px',
            }}
          >
            Detailed write-up coming soon. In the meantime, the repo and live demo above show the full story.
          </motion.div>
        )}

        {cs && (
          <>
            <Section label="01 — The Problem" title="Why this needed to exist">
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: 'var(--text-muted)',
                  maxWidth: '760px',
                }}
              >
                {cs.problem}
              </p>
            </Section>

            <Section label="02 — The Approach" title="How I built it">
              <ol
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  maxWidth: '820px',
                  counterReset: 'approach',
                }}
              >
                {cs.approach.map((step, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      padding: '20px 24px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${project.color}`,
                      borderRadius: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '13px',
                        color: project.color,
                        fontWeight: 600,
                        flexShrink: 0,
                        minWidth: '28px',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '16px',
                        lineHeight: 1.65,
                        color: 'var(--text)',
                      }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section label="03 — Architecture" title="The stack, layer by layer">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  maxWidth: '960px',
                }}
              >
                {cs.architecture.map((layer) => (
                  <div
                    key={layer.label}
                    style={{
                      padding: '22px 24px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '11px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: project.color,
                        marginBottom: '10px',
                      }}
                    >
                      {layer.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        lineHeight: 1.55,
                        color: 'var(--text)',
                      }}
                    >
                      {layer.value}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section label="04 — Challenges" title="What broke along the way">
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  maxWidth: '820px',
                }}
              >
                {cs.challenges.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '16px 20px',
                      background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      lineHeight: 1.65,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="05 — Outcomes" title="What shipped">
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxWidth: '820px',
                }}
              >
                {cs.outcomes.map((o, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      lineHeight: 1.6,
                      color: 'var(--text)',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: project.color,
                        boxShadow: `0 0 10px ${project.color}80`,
                        flexShrink: 0,
                        marginTop: '10px',
                      }}
                    />
                    {o}
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="06 — Learnings" title="What I'd do differently">
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '17px',
                  lineHeight: 1.75,
                  color: 'var(--text-muted)',
                  maxWidth: '760px',
                  fontStyle: 'italic',
                  borderLeft: `2px solid ${project.color}`,
                  paddingLeft: '24px',
                }}
              >
                {cs.learnings}
              </p>
            </Section>
          </>
        )}

        {/* Footer nav */}
        <div
          style={{
            marginTop: '80px',
            paddingTop: '40px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <Link
            href="/#projects"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            ← All projects
          </Link>
          <Link
            href="/#contact"
            style={{
              padding: '10px 22px',
              background: project.color,
              color: '#06060f',
              borderRadius: '7px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            Let's talk →
          </Link>
        </div>
      </div>
    </main>
  );
}

function MetaItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: color || 'var(--text)',
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}
