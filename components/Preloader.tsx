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
      // Motion-blur trails during explode/shatter — sharp clear during attract/hold
      if (phase === 'explode' || phase === 'shatter') {
        ctx.fillStyle = 'rgba(6,6,15,0.22)';
      } else {
        ctx.fillStyle = '#06060f';
      }
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

      // RGB glitch window: 3 short bursts inside hold phase
      const inGlitch =
        phase === 'hold' &&
        ((tick >= 160 && tick <= 163) ||
          (tick >= 178 && tick <= 182) ||
          (tick >= 192 && tick <= 196));

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
        if (p.alpha <= 0.02) return;

        if (inGlitch) {
          const jitter = (Math.random() - 0.5) * 4;
          // Cyan ghost
          ctx.beginPath();
          ctx.arc(p.x - 3 + jitter, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#00f0ff';
          ctx.globalAlpha = p.alpha * 0.55;
          ctx.fill();
          // Magenta ghost
          ctx.beginPath();
          ctx.arc(p.x + 3 - jitter, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#ff2dd1';
          ctx.globalAlpha = p.alpha * 0.55;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        p.draw(ctx);
      });

      // Horizontal slice displacement on glitch frames
      if (inGlitch && phase === 'hold') {
        const sliceH = 6 + Math.random() * 14;
        const sliceY = cy - 60 + Math.random() * 120;
        const offset = (Math.random() - 0.5) * 22;
        const img = ctx.getImageData(0, sliceY, canvas.width, sliceH);
        ctx.putImageData(img, offset, sliceY);
      }

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

const BOOT_LOG = [
  '> booting neural kernel...',
  '> compiling shaders [ok]',
  '> linking experiences[4]',
  '> hydrating projects[6]',
  '> warming AI modules...',
  '> calibrating cursor field',
  '> streaming assets [98%]',
  '> portfolio online.',
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<'canvas' | 'text' | 'exit' | 'done' | string>('canvas');
  const [count, setCount] = useState(0);
  const [typed, setTyped] = useState('');
  const [bootLines, setBootLines] = useState<string[]>([]);

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

  // Boot log streaming during text phase
  useEffect(() => {
    if (phase !== 'text') return;
    let idx = 0;
    const id = setInterval(() => {
      setBootLines((prev) => (idx < BOOT_LOG.length ? [...prev, BOOT_LOG[idx]] : prev));
      idx++;
      if (idx >= BOOT_LOG.length) clearInterval(id);
    }, 220);
    return () => clearInterval(id);
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
                {/* HUD corner brackets */}
                {(['tl', 'tr', 'bl', 'br'] as const).map((pos, i) => (
                  <motion.span
                    key={pos}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: 'absolute',
                      width: '44px',
                      height: '44px',
                      borderColor: 'rgba(108,99,255,0.55)',
                      borderStyle: 'solid',
                      borderWidth: 0,
                      ...(pos === 'tl' && { top: 32, left: 32, borderTopWidth: 1.5, borderLeftWidth: 1.5 }),
                      ...(pos === 'tr' && { top: 32, right: 32, borderTopWidth: 1.5, borderRightWidth: 1.5 }),
                      ...(pos === 'bl' && { bottom: 32, left: 32, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }),
                      ...(pos === 'br' && { bottom: 32, right: 32, borderBottomWidth: 1.5, borderRightWidth: 1.5 }),
                    }}
                  />
                ))}

                {/* Top progress bar synced with counter */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '2px',
                  background: 'rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${count}%`,
                    background: 'linear-gradient(90deg, #6c63ff, #00d4ff)',
                    boxShadow: '0 0 12px rgba(0,212,255,0.6)',
                    transition: 'width 0.12s linear',
                  }} />
                </div>

                {/* Top-left status label */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 0.78, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  style={{
                    position: 'absolute',
                    top: '42px', left: '90px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#00ff88',
                    boxShadow: '0 0 8px rgba(0,255,136,0.8)',
                    animation: 'preloaderPulse 1.4s ease-in-out infinite',
                  }} />
                  Initializing Portfolio
                </motion.div>

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

                {/* Streaming boot log — bottom-left */}
                <div
                  className="preloader-bootlog"
                  style={{
                    position: 'absolute',
                    bottom: '42px', left: '90px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    color: 'rgba(0,255,136,0.72)',
                    lineHeight: 1.7,
                    letterSpacing: '0.04em',
                    maxWidth: '280px',
                  }}
                >
                  {bootLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: i === bootLines.length - 1 ? 1 : 0.5, x: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {line}
                    </motion.div>
                  ))}
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

          {/* Wipe out: diagonal curtain split into two panels */}
          <AnimatePresence>
            {phase === 'exit' && (
              <>
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: '-102%' }}
                  transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
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
                  transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
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
                  transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
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
            @keyframes preloaderPulse {
              0%, 100% { transform: scale(1);   opacity: 1; }
              50%       { transform: scale(1.4); opacity: 0.55; }
            }
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
            @media (max-width: 600px) {
              .preloader-bootlog { display: none !important; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
