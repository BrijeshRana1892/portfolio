'use client';

/**
 * SectionBg — clean, crisp background accent.
 * Uses a pure CSS radial-gradient (no filter: blur — that causes fog).
 * The gradient naturally feathers at edges without any blur filter.
 */
interface SectionBgProps {
  /** CSS radial-gradient color stop, e.g. 'rgba(99,63,255,0.10)' */
  color: string;
  /** Where to anchor the glow: '10% 10%', '90% 80%', etc. */
  position: string;
  /** How wide the glow spreads: '70% 50%' for ellipse, '50%' for circle */
  spread?: string;
}

export default function SectionBg({ color, position, spread = '60% 50%' }: SectionBgProps) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse ${spread} at ${position}, ${color} 0%, transparent 100%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
