'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotionPref } from '@/lib/useReducedMotion';

type Variant = 'letters' | 'words';

interface SplitRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div' | 'p';
  variant?: Variant;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  margin?: string;
  className?: string;
  style?: React.CSSProperties;
  wordClassName?: string;
  wordStyle?: React.CSSProperties;
}

export default function SplitReveal({
  text,
  as = 'span',
  variant = 'letters',
  delay = 0,
  stagger = 0.025,
  duration = 0.75,
  once = true,
  margin = '-80px',
  className,
  style,
  wordClassName,
  wordStyle,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: margin as `${number}px` });
  const reduced = useReducedMotionPref();

  const words = text.split(' ');
  const Tag = motion[as] as React.ComponentType<React.ComponentProps<typeof motion.span>>;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      style={{
        display: 'inline-block',
        ...style,
      }}
      aria-label={text}
    >
      {words.map((word, wIdx) => {
        const units = variant === 'letters' ? Array.from(word) : [word];
        return (
          <span
            key={wIdx}
            className={wordClassName}
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              verticalAlign: 'bottom',
              paddingBottom: '0.12em',
              marginBottom: '-0.12em',
              ...wordStyle,
            }}
            aria-hidden
          >
            {units.map((unit, uIdx) => {
              const globalIdx =
                variant === 'letters'
                  ? words.slice(0, wIdx).reduce((acc, w) => acc + w.length, 0) + uIdx
                  : wIdx;
              return (
                <motion.span
                  key={uIdx}
                  style={{
                    display: 'inline-block',
                    willChange: reduced ? undefined : 'transform, opacity',
                  }}
                  initial={reduced ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
                  animate={inView || reduced ? { y: '0%', opacity: 1 } : {}}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          delay: delay + globalIdx * stagger,
                          duration,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  {unit}
                </motion.span>
              );
            })}
            {wIdx < words.length - 1 && (
              <span style={{ display: 'inline-block', width: '0.28em' }}>&nbsp;</span>
            )}
          </span>
        );
      })}
    </Tag>
  );
}
