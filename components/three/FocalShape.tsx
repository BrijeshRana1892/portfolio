/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

// ── Morphing distorted core ───────────────────────────────────────
function DistortedCore({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<any>(null);
  const pulseRef = useRef(0);

  // Light mode: vibrant violet, low metalness so it doesn't read as dark chrome
  const color  = isDark ? '#6c63ff' : '#8b5cf6';
  const glow   = isDark ? '#00d4ff' : '#a78bfa';

  const handleClick = (e: any) => {
    e.stopPropagation();
    pulseRef.current = 1.0;
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y += 0.004 + pulseRef.current * 0.06;
    meshRef.current.rotation.x += 0.002 + pulseRef.current * 0.04;

    // Pulse decay
    const p = pulseRef.current;
    pulseRef.current *= 0.90;

    // Scale bounce
    const s = 1 + p * 0.22;
    meshRef.current.scale.setScalar(s);

    if (matRef.current) {
      matRef.current.distort = 0.36 + Math.sin(t * 0.7) * 0.1 + p * 0.55;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[0.78, 96, 96]} />
      <MeshDistortMaterial
        ref={matRef}
        color={color}
        emissive={glow}
        emissiveIntensity={isDark ? 0.75 : 0.45}
        distort={0.35}
        speed={2.2}
        roughness={isDark ? 0.22 : 0.45}
        metalness={isDark ? 0.9 : 0.25}
      />
    </mesh>
  );
}

// ── Halo glow shells (additive in dark, skipped in light) ─────────
function HaloShell({
  radius, color, opacity,
}: {
  radius: number;
  color: string;
  opacity: number;
}) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ── Wireframe outer shell ─────────────────────────────────────────
function OuterShell({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x += 0.0018;
    ref.current.rotation.y -= 0.0024;
  });
  const color = isDark ? '#a78bfa' : '#7c3aed';
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.12, 1]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={isDark ? 0.35 : 0.55}
        toneMapped={false}
      />
    </mesh>
  );
}

// ── Orbital ring ──────────────────────────────────────────────────
function Ring({
  radius, tilt, speed, color, isDark,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
  isDark: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, isDark ? 0.012 : 0.016, 10, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isDark ? 0.85 : 0.9}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

// ── Satellite orb with trail ──────────────────────────────────────
function Satellite({
  radius, speed, tiltX, tiltZ, color, size, isDark,
}: {
  radius: number;
  speed: number;
  tiltX: number;
  tiltZ: number;
  color: string;
  size: number;
  isDark: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const popRef = useRef(0);

  const handleClick = (e: any) => {
    e.stopPropagation();
    popRef.current = 1.0;
  };

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * Math.cos(tiltX) * radius;
    ref.current.position.z = Math.sin(t) * Math.sin(tiltX + tiltZ) * radius;

    // Pop scale bounce on click
    const s = 1 + popRef.current * 1.8;
    ref.current.scale.setScalar(s);
    popRef.current *= 0.88;
  });

  return (
    <Trail
      width={isDark ? 0.6 : 0.35}
      length={isDark ? 5 : 3}
      color={new THREE.Color(color)}
      attenuation={(t) => t * t}
    >
      <mesh
        ref={ref}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[size, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

// ── Energy sparks — dark mode only (additive looks wrong on white) ─
function EnergySparks({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 180;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const sp = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 0.8 + Math.random() * 0.8;
      pos[i * 3]     = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;
      sp[i] = 0.4 + Math.random() * 1.0;
    }
    return [pos, sp];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const baseR = 0.9 + Math.sin(t * speeds[i] + i) * 0.35;
      const ox = positions[i * 3];
      const oy = positions[i * 3 + 1];
      const oz = positions[i * 3 + 2];
      const len = Math.hypot(ox, oy, oz) || 1;
      arr[i * 3]     = (ox / len) * baseR;
      arr[i * 3 + 1] = (oy / len) * baseR;
      arr[i * 3 + 2] = (oz / len) * baseR;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!isDark) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={'#00d4ff'}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

// ── Group wrapping everything with mouse parallax + float ─────────
function MainGroup({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lerp = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    lerp.current.x += (mouse.current.x * 0.25 - lerp.current.x) * 0.045;
    lerp.current.y += (-mouse.current.y * 0.25 - lerp.current.y) * 0.045;
    groupRef.current.position.x = lerp.current.x;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.1 + lerp.current.y;
    groupRef.current.rotation.y = lerp.current.x * 0.35;
    groupRef.current.rotation.x = -lerp.current.y * 0.25;
  });

  // Theme-aware palettes
  const ringCyan   = isDark ? '#00d4ff' : '#0891b2';
  const ringAccent = isDark ? '#6c63ff' : '#7c3aed';
  const ringWhite  = isDark ? '#ffffff' : '#4f46e5';
  const ringExtra  = isDark ? '#00d4ff' : '#0e7490';

  return (
    <group ref={groupRef}>
      {/* Halo layers — only useful in dark (additive + white bg = no glow) */}
      {isDark && (
        <>
          <HaloShell radius={0.88} color={'#00d4ff'} opacity={0.30} />
          <HaloShell radius={1.05} color={'#6c63ff'} opacity={0.14} />
          <HaloShell radius={1.35} color={'#6c63ff'} opacity={0.07} />
        </>
      )}

      <DistortedCore isDark={isDark} />
      <EnergySparks isDark={isDark} />
      <OuterShell isDark={isDark} />

      <Ring radius={1.30} tilt={[0.4,  0.2, 0]}   speed={ 0.22} color={ringCyan}   isDark={isDark} />
      <Ring radius={1.52} tilt={[1.1,  0.6, 0]}   speed={-0.17} color={ringAccent} isDark={isDark} />
      <Ring radius={1.75} tilt={[-0.3, 1.1, 0.5]} speed={ 0.12} color={ringWhite}  isDark={isDark} />
      <Ring radius={1.95} tilt={[0.8, -0.4, 0.2]} speed={-0.08} color={ringExtra}  isDark={isDark} />

      <Satellite radius={1.30} speed={ 0.60} tiltX={0.4}  tiltZ={0.2}  color={ringCyan}   size={0.055} isDark={isDark} />
      <Satellite radius={1.52} speed={-0.42} tiltX={1.1}  tiltZ={0.6}  color={ringAccent} size={0.048} isDark={isDark} />
      <Satellite radius={1.75} speed={ 0.32} tiltX={-0.3} tiltZ={1.1}  color={ringWhite}  size={0.042} isDark={isDark} />
      <Satellite radius={1.95} speed={-0.22} tiltX={0.8}  tiltZ={-0.4} color={ringExtra}  size={0.036} isDark={isDark} />
    </group>
  );
}

// ── Scene ─────────────────────────────────────────────────────────
function Scene({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  // Stronger lighting in light mode so the low-metalness core reads as violet, not grey
  const accent = isDark ? '#6c63ff' : '#7c3aed';
  const cyan   = isDark ? '#00d4ff' : '#0891b2';
  return (
    <>
      <ambientLight intensity={isDark ? 0.35 : 0.9} />
      <pointLight position={[ 3,  3,  3]} intensity={isDark ? 3.0 : 2.5} color={accent} />
      <pointLight position={[-2, -1,  2]} intensity={isDark ? 1.6 : 1.4} color={cyan} />
      <pointLight position={[ 0, -3,  1]} intensity={isDark ? 0.9 : 1.0} color={'#ffffff'} />

      <MainGroup isDark={isDark} mouse={mouse} />
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────
export default function FocalShape({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.8], fov: 42 }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Scene isDark={isDark} mouse={mouse} />
    </Canvas>
  );
}
