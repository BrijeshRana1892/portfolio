'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

// ── Particle system: Big Bang → name formation ─────────────────────
class Particle {
  x: number; y: number;
  ox: number; oy: number;  // origin (center)
  tx: number; ty: number;  // target (letter position)
  vx: number; vy: number;
  alpha: number;
  size: number;
  color: string;
  phase: 'explode' | 'attract' | 'hold';
  delay: number;

  constructor(cx: number, cy: number) {
    this.ox = cx; this.oy = cy;
    this.x = cx; this.y = cy;
    this.tx = cx; this.ty = cy;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 18 + 8;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = Math.random() * 0.9 + 0.1;
    this.size = Math.random() * 2.5 + 0.8;
    this.color = Math.random() > 0.5 ? '#6c63ff' : '#00d4ff';
    this.phase = 'explode';
    this.delay = Math.random() * 30;
  }

  setTarget(tx: number, ty: number) { this.tx = tx; this.ty = ty; }

  update(t: number) {
    if (this.phase === 'explode') {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.94;
      this.vy *= 0.94;
    } else if (this.phase === 'attract') {
      const progress = Math.min(1, (t - this.delay) / 80);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.x += (this.tx - this.x) * 0.12 * ease + 0.02;
      this.y += (this.ty - this.y) * 0.12 * ease + 0.02;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function getLetterPoints(
  text: string,
  cx: number,
  cy: number,
  fontSize: number,
  isMobile: boolean
): [number, number][] {
  const offscreen = document.createElement('canvas');
  offscreen.width = isMobile ? 400 : 900;
  offscreen.height = isMobile ? 120 : 200;
  const ctx2 = offscreen.getContext('2d')!;
  ctx2.fillStyle = '#fff';
  ctx2.font = `bold ${fontSize}px 'Space Grotesk', Arial`;
  ctx2.textAlign = 'center';
  ctx2.textBaseline = 'middle';
  ctx2.fillText(text, offscreen.width / 2, offscreen.height / 2);

  const data = ctx2.getImageData(0, 0, offscreen.width, offscreen.height);
  const pts: [number, number][] = [];
  const step = isMobile ? 5 : 4;
  for (let y = 0; y < offscreen.height; y += step) {
    for (let x = 0; x < offscreen.width; x += step) {
      const i = (y * offscreen.width + x) * 4;
      if (data.data[i + 3] > 120) {
        pts.push([
          cx - offscreen.width / 2 + x,
          cy - offscreen.height / 2 + y,
        ]);
      }
    }
  }
  return pts;
}

function PreloaderCanvas({ onCanvasDone }: { onCanvasDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const isMobile = canvas.width < 600;
    const pCount = isMobile ? 500 : 2000;
    const fontSize = isMobile ? 52 : 110;

    // Build particles
    const particles: Particle[] = Array.from({ length: pCount }, () => new Particle(cx, cy));

    // Get letter targets
    const pts = getLetterPoints('BRIJESH RANA', cx, cy, fontSize, isMobile);

    // Assign targets to particles (loop over pts)
    particles.forEach((p, i) => {
      const pt = pts[i % pts.length];
      if (pt) p.setTarget(pt[0], pt[1]);
    });

    let tick = 0;
    let phase: 'explode' | 'attract' | 'hold' | 'shatter' = 'explode';
    let raf: number;
    let done = false;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#06060f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Phase transitions
      if (tick === 40 && phase === 'explode') {
        phase = 'attract';
        particles.forEach((p) => {
          p.phase = 'attract';
        });
      }
      if (tick === 140 && phase === 'attract') {
        phase = 'hold';
      }
      if (tick === 200 && phase === 'hold') {
        phase = 'shatter';
        particles.forEach((p) => {
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle) * (Math.random() * 25 + 12);
          p.vy = Math.sin(angle) * (Math.random() * 25 + 12);
        });
        setTimeout(() => {
          if (!done) { done = true; onCanvasDone(); }
        }, 350);
      }

      particles.forEach((p) => {
        if (phase === 'shatter') {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.88;
          p.vy *= 0.88;
          p.alpha *= 0.93;
        } else {
          p.update(phase === 'attract' ? tick - 40 : tick);
        }
        if (p.alpha > 0.02) p.draw(ctx);
      });

      // Bloom glow on attract/hold
      if ((phase === 'attract' || phase === 'hold') && tick > 80) {
        const glowAlpha = Math.min(0.18, (tick - 80) / 120);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, isMobile ? 180 : 340);
        grad.addColorStop(0, `rgba(108,99,255,${glowAlpha})`);
        grad.addColorStop(0.5, `rgba(0,212,255,${glowAlpha * 0.4})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      tick++;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onCanvasDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<'canvas' | 'text' | 'exit' | 'done' | string>('canvas');
  const [count, setCount] = useState(0);
  const [typed, setTyped] = useState('');

  const ROLE_TEXT = 'SOFTWARE ENGINEER';

  // Canvas done → show text overlay + counter + typewriter
  const handleCanvasDone = () => setPhase('text');

  // Counter: roll 0→100 when text phase starts
  useEffect(() => {
    if (phase !== 'text') return;
    let current = 0;
    const id = setInterval(() => {
      current++;
      setCount(current);
      if (current >= 100) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [phase]);

  // Typewriter after counter starts
  useEffect(() => {
    if (phase !== 'text') return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(ROLE_TEXT.slice(0, i));
      if (i >= ROLE_TEXT.length) clearInterval(id);
    }, 55);
    // start after 600ms
    const delay = setTimeout(() => id, 600);
    return () => { clearInterval(id); clearTimeout(delay); };
  }, [phase]);

  // Begin exit when count hits 100
  useEffect(() => {
    if (count < 100) return;
    const t = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 900);
    }, 400);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#06060f', overflow: 'hidden' }}
        >
          {/* Particle canvas (always rendered; fades out after exit) */}
          <PreloaderCanvas onCanvasDone={handleCanvasDone} />

          {/* Text overlay on top of canvas */}
          <AnimatePresence>
            {phase === 'text' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}
              >
                {/* Typewriter role text */}
                <div style={{
                  position: 'absolute',
                  bottom: '80px', left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '14px',
                  color: '#00ff88',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {typed}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    style={{ display: 'inline-block', marginLeft: '2px' }}
                  >|</motion.span>
                </div>

                {/* Rolling counter bottom-right */}
                <div style={{
                  position: 'absolute',
                  bottom: '40px', right: '48px',
                  display: 'flex', alignItems: 'flex-end', gap: '4px',
                }}>
                  <span style={{
                    fontSize: 'clamp(48px, 8vw, 88px)',
                    fontFamily: 'var(--font-display, sans-serif)',
                    fontWeight: 700,
                    color: 'transparent',
                    WebkitTextStroke: '1px rgba(255,255,255,0.18)',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: '3ch',
                    textAlign: 'right',
                  }}>
                    {String(count).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: '22px',
                    fontFamily: 'var(--font-body, sans-serif)',
                    color: 'var(--accent, #6c63ff)',
                    marginBottom: '10px',
                  }}>%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wipe out: clip-path circle reveal on exit */}
          <AnimatePresence>
            {phase === 'exit' && (
              <motion.div
                initial={{ clipPath: 'circle(0% at 50% 50%)' }}
                animate={{ clipPath: 'circle(150% at 50% 50%)' }}
                transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
                style={{
                  position: 'absolute', inset: 0,
                  background: '#06060f',
                  zIndex: 20,
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
