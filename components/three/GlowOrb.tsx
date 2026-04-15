/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Orbiting dust particles ────────────────────────────────────
function OrbitDust({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 280;

  const [positions, opacities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ops = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Place on a slightly randomized sphere shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.55 + (Math.random() - 0.5) * 0.5;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      ops[i] = Math.random() * 0.6 + 0.15;
    }
    return [pos, ops];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.12;
    ref.current.rotation.x = Math.sin(t * 0.07) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={isDark ? '#00d4ff' : '#0891b2'}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// ── Main orb ──────────────────────────────────────────────────
function OrbMesh({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const lerpPos = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = groupRef.current;
    const core = coreRef.current;
    const shell = shellRef.current;
    if (!g || !core || !shell) return;

    // Gentle float
    g.position.y = Math.sin(t * 0.5) * 0.12;

    // Parallax from mouse
    lerpPos.current.x += (mouse.current.x * 0.35 - lerpPos.current.x) * 0.05;
    lerpPos.current.y += (-mouse.current.y * 0.35 - lerpPos.current.y) * 0.05;
    g.position.x = lerpPos.current.x;
    g.position.y += lerpPos.current.y;

    // Slow auto-rotation
    shell.rotation.y = t * 0.15;
    shell.rotation.x = t * 0.08;
    core.rotation.y = -t * 0.1;

    // Core pulse
    const pulse = 1 + Math.sin(t * 1.4) * 0.04;
    core.scale.setScalar(pulse);
  });

  const accentColor = isDark ? '#6c63ff' : '#4f46e5';
  const secondaryColor = isDark ? '#00d4ff' : '#0891b2';

  return (
    <group ref={groupRef}>
      {/* Outer wireframe shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[1.55, 28, 28]} />
        <meshBasicMaterial
          color={secondaryColor}
          wireframe
          transparent
          opacity={isDark ? 0.18 : 0.14}
        />
      </mesh>

      {/* Mid wireframe shell — denser */}
      <mesh rotation={[0.4, 0.2, 0.1]}>
        <icosahedronGeometry args={[1.25, 2]} />
        <meshBasicMaterial
          color={accentColor}
          wireframe
          transparent
          opacity={isDark ? 0.12 : 0.1}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={isDark ? 1.8 : 1.2}
          transparent
          opacity={0.88}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Soft inner haze */}
      <mesh>
        <sphereGeometry args={[1.05, 16, 16]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={isDark ? 0.06 : 0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbiting dust */}
      <OrbitDust isDark={isDark} />
    </group>
  );
}

// ── Scene ─────────────────────────────────────────────────────
function Scene({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const accentColor = isDark ? '#6c63ff' : '#4f46e5';
  const secondaryColor = isDark ? '#00d4ff' : '#0891b2';

  return (
    <>
      <ambientLight intensity={isDark ? 0.15 : 0.25} />
      <pointLight position={[3, 3, 3]} intensity={isDark ? 2.5 : 1.8} color={accentColor} />
      <pointLight position={[-3, -2, 2]} intensity={isDark ? 1.5 : 1.0} color={secondaryColor} />
      <pointLight position={[0, 0, 4]} intensity={isDark ? 1.0 : 0.6} color={accentColor} />
      <OrbMesh isDark={isDark} mouse={mouse} />
    </>
  );
}

// ── Exported component ────────────────────────────────────────
export default function GlowOrb({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene isDark={isDark} mouse={mouse} />
    </Canvas>
  );
}
