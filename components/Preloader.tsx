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
    this.delay = Math.random() * 12;
  }

  setTarget(tx: number, ty: number) { this.tx = tx; this.ty = ty; }

  update(t: number) {
    if (this.phase === 'explode') {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.94;
      this.vy *= 0.94;
    } else if (this.phase === 'attract') {
      const progress = Math.min(1, (t - this.delay) / 40);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.x += (this.tx - this.x) * 0.18 * ease + 0.02;
      this.y += (this.ty - this.y) * 0.18 * ease + 0.02;
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
  const ctx2 = offscreen.getContext('2d')!;
  const font = `bold ${fontSize}px 'Space Grotesk', Arial`;
  // Measure first so the sampling canvas fits the full text (no horizontal clip)
  ctx2.font = font;
  const pad = Math.ceil(fontSize * 0.5);
  offscreen.width = Math.ceil(ctx2.measureText(text).width) + pad * 2;
  offscreen.height = Math.ceil(fontSize * 1.6);
  // Resizing the canvas resets context state — re-set font/styles
  ctx2.fillStyle = '#fff';
  ctx2.font = font;
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
    const pCount = isMobile ? 460 : 1500;
    const fontSize = isMobile
      ? Math.min(52, canvas.width * 0.13)
      : Math.min(110, canvas.width * 0.085);

    // Build particles
    const particles: Particle[] = Array.from({ length: pCount }, () => new Particle(cx, cy));

    // Get letter targets
    const pts = getLetterPoints('BRIJESH RANA', cx, cy, fontSize, isMobile);

    // Spread targets evenly across ALL letter points so the full name fills,
    // even when particle count < point count
    particles.forEach((p, i) => {
      const pt = pts.length
        ? pts[Math.floor((i / particles.length) * pts.length)]
        : undefined;
      if (pt) p.setTarget(pt[0], pt[1]);
    });

    let phase: 'explode' | 'attract' | 'hold' = 'explode';
    let raf: number;
    let done = false;
    const startTime = performance.now();

    const animate = () => {
      // Wall-clock virtual frame count → consistent duration across devices/fps
      const tick = (performance.now() - startTime) / 16.667;
      // Motion-blur trails during explode — sharp clear once forming
      ctx.fillStyle = phase === 'explode' ? 'rgba(6,6,15,0.22)' : '#06060f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Phase transitions: explode → attract → hold → launch
      if (tick >= 22 && phase === 'explode') {
        phase = 'attract';
        particles.forEach((p) => {
          p.phase = 'attract';
        });
      }
      if (tick >= 58 && phase === 'attract') {
        phase = 'hold';
      }
      // Name held briefly, then launch the site immediately (no shatter/glitch)
      if (tick >= 80 && phase === 'hold' && !done) {
        done = true;
        onCanvasDone();
      }

      particles.forEach((p) => {
        p.update(phase === 'attract' ? tick - 22 : tick);
        if (p.alpha <= 0.02) return;
        p.draw(ctx);
      });

      // Bloom glow on attract/hold
      if ((phase === 'attract' || phase === 'hold') && tick > 40) {
        const glowAlpha = Math.min(0.18, (tick - 40) / 60);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, isMobile ? 180 : 340);
        grad.addColorStop(0, `rgba(108,99,255,${glowAlpha})`);
        grad.addColorStop(0.5, `rgba(0,212,255,${glowAlpha * 0.4})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

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
  const [phase, setPhase] = useState<'canvas' | 'exit' | 'done' | string>('canvas');

  // Name formed on canvas → wipe out and launch the site immediately
  const handleCanvasDone = () => {
    setPhase('exit');
    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 620);
  };

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

          {/* CRT scanlines + noise overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 15,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              opacity: 0.35,
              background: `repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.05) 0px,
                rgba(255,255,255,0.05) 1px,
                transparent 1px,
                transparent 3px
              )`,
            }}
          />
          <div
            aria-hidden
            className="preloader-scanline"
            style={{
              position: 'absolute',
              left: 0, right: 0,
              height: '120px',
              zIndex: 16,
              pointerEvents: 'none',
              background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.06) 50%, transparent)',
              mixBlendMode: 'screen',
            }}
          />
          <div
            aria-hidden
            className="preloader-noise"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 17,
              pointerEvents: 'none',
              opacity: 0.06,
              mixBlendMode: 'overlay',
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Wipe out: diagonal curtain split into two panels */}
          <AnimatePresence>
            {phase === 'exit' && (
              <>
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: '-102%' }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '50.5%',
                    background: '#06060f',
                    zIndex: 20,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 90px))',
                  }}
                />
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: '102%' }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '50.5%',
                    background: '#06060f',
                    zIndex: 20,
                    clipPath: 'polygon(0 90px, 100% 0, 100% 100%, 0 100%)',
                  }}
                />
                {/* Accent line flash along the split */}
                <motion.div
                  initial={{ opacity: 0.9, scaleX: 0 }}
                  animate={{ opacity: [0.9, 0.9, 0], scaleX: 1 }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: 'absolute',
                    top: '50%', left: 0, right: 0,
                    height: '1.5px',
                    transformOrigin: 'left center',
                    background: 'linear-gradient(90deg, transparent, #00d4ff, #6c63ff, transparent)',
                    boxShadow: '0 0 18px rgba(0,212,255,0.7)',
                    zIndex: 21,
                  }}
                />
              </>
            )}
          </AnimatePresence>

          <style>{`
            @keyframes preloaderScan {
              0%   { transform: translateY(-20vh); }
              100% { transform: translateY(120vh); }
            }
            .preloader-scanline {
              animation: preloaderScan 5.5s linear infinite;
            }
            @keyframes preloaderNoise {
              0%   { transform: translate(0, 0); }
              25%  { transform: translate(-3%, 2%); }
              50%  { transform: translate(2%, -2%); }
              75%  { transform: translate(-2%, -3%); }
              100% { transform: translate(0, 0); }
            }
            .preloader-noise {
              animation: preloaderNoise 0.45s steps(4) infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
