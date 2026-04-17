'use client';

import { useEffect, useRef } from 'react';

interface ProjectShaderProps {
  colorFrom: string;
  colorTo: string;
  accent: string;
  intensity?: number;
  reducedMotion?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// ── Shaders ──────────────────────────────────────────────────────
const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// fBm noise → swirling gradient blend. Responds to mouse.
const FRAG = `
precision mediump float;
varying vec2 v_uv;

uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;
uniform vec3  u_colorA;
uniform vec3  u_colorB;
uniform vec3  u_accent;
uniform float u_intensity;

// hash + value noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

  // Mouse influence — warps the domain so the cursor "pulls" the flow
  vec2 m = u_mouse;
  vec2 toMouse = (uv - m) * aspect;
  float d = length(toMouse);
  float pull = exp(-d * 3.2) * u_intensity;

  vec2 p = uv * 2.5;
  p += vec2(u_time * 0.04, u_time * 0.05);
  p += toMouse * pull * 0.8;

  float n1 = fbm(p);
  float n2 = fbm(p + vec2(n1 * 1.3, u_time * 0.08));
  float mixer = smoothstep(0.2, 0.8, n2);

  vec3 base = mix(u_colorA, u_colorB, mixer);

  // Accent streaks — additive glints
  float streak = smoothstep(0.72, 1.0, n2);
  base += u_accent * streak * 0.55;

  // Mouse glow
  base += u_accent * pull * 0.5;

  // Vignette (subtle edge darkening)
  float vig = smoothstep(1.1, 0.35, length(uv - 0.5) * 1.4);
  base *= mix(0.65, 1.0, vig);

  gl_FragColor = vec4(base, 1.0);
}
`;

// ── Component ────────────────────────────────────────────────────
export default function ProjectShader({
  colorFrom,
  colorTo,
  accent,
  intensity = 1.0,
  reducedMotion = false,
}: ProjectShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    // Compile
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Fullscreen quad
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uA = gl.getUniformLocation(prog, 'u_colorA');
    const uB = gl.getUniformLocation(prog, 'u_colorB');
    const uAccent = gl.getUniformLocation(prog, 'u_accent');
    const uIntensity = gl.getUniformLocation(prog, 'u_intensity');

    const rgbA = hexToRgb(colorFrom);
    const rgbB = hexToRgb(colorTo);
    const rgbAccent = hexToRgb(accent);
    gl.uniform3f(uA, rgbA[0], rgbA[1], rgbA[2]);
    gl.uniform3f(uB, rgbB[0], rgbB[1], rgbB[2]);
    gl.uniform3f(uAccent, rgbAccent[0], rgbAccent[1], rgbAccent[2]);
    gl.uniform1f(uIntensity, intensity);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || canvas.offsetWidth;
      const h = canvas.clientHeight || canvas.offsetHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseTargetRef.current.x = (e.clientX - r.left) / r.width;
      mouseTargetRef.current.y = 1.0 - (e.clientY - r.top) / r.height;
    };
    const onLeave = () => {
      mouseTargetRef.current.x = 0.5;
      mouseTargetRef.current.y = 0.5;
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    startRef.current = performance.now();

    const render = () => {
      // Lerp mouse for smooth feel
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.08;

      const t = reducedMotion ? 0 : (performance.now() - startRef.current) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [colorFrom, colorTo, accent, intensity, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
