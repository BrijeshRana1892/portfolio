/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Rotating wireframe torus knot ─────────────────────────────
function KnotMesh({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lerp = useRef({ x: 0, y: 0 });

  const color     = isDark ? '#6c63ff' : '#5b4cff';
  const accent    = isDark ? '#00d4ff' : '#0891b2';

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.18;

    lerp.current.x += (mouse.current.x * 0.3 - lerp.current.x) * 0.03;
    lerp.current.y += (-mouse.current.y * 0.3 - lerp.current.y) * 0.03;
    groupRef.current.position.x = lerp.current.x;
    groupRef.current.position.y = lerp.current.y;
  });

  return (
    <group ref={groupRef}>
      {/* Outer wireframe torus knot */}
      <mesh>
        <torusKnotGeometry args={[1.2, 0.36, 220, 28, 2, 3]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={isDark ? 0.28 : 0.22}
          toneMapped={false}
        />
      </mesh>
      {/* Inner faint accent knot */}
      <mesh rotation={[0.4, 0.2, 0.1]}>
        <torusKnotGeometry args={[1.05, 0.28, 160, 22, 3, 4]} />
        <meshBasicMaterial
          color={accent}
          wireframe
          transparent
          opacity={isDark ? 0.18 : 0.14}
          toneMapped={false}
        />
      </mesh>
      {/* Inner glow core */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={isDark ? 0.18 : 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ── Orbiting particles ────────────────────────────────────────
function OrbitParticles({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 120;

  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.7 + Math.random() * 0.8;
      pos[i * 3]     = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color={isDark ? '#00d4ff' : '#5b4cff'}
        transparent
        opacity={isDark ? 0.55 : 0.30}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
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
  return (
    <>
      <ambientLight intensity={0.4} />
      <KnotMesh isDark={isDark} mouse={mouse} />
      <OrbitParticles isDark={isDark} />
    </>
  );
}

// ── Export ────────────────────────────────────────────────────
export default function AboutScene({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Scene isDark={isDark} mouse={mouse} />
    </Canvas>
  );
}
