/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ────────────────────────────────────────────────────────────────
//  PERIPHERAL SHAPE POSITIONS
//  Camera z=8, fov=60 → visible half-width ≈ 4.6 units
//  Exclusion zone: |x| < 2.8 AND |y| < 2.0
//  Every position below sits OUTSIDE that zone.
// ────────────────────────────────────────────────────────────────
const SHAPES_DATA = [
  // Top-left cluster
  { pos: [-3.9, 2.4, -2.0],  type: 'icosahedron', scale: 0.26, color: '#ffffff',   speed: 0.8  },
  { pos: [-4.4, 1.1, -3.0],  type: 'torus',       scale: 0.20, color: '#00d4ff',   speed: 0.55 },
  { pos: [-3.3, 2.8, -1.5],  type: 'octahedron',  scale: 0.18, color: '#9b8fff',   speed: 1.1  },
  // Top-right cluster
  { pos: [ 4.1, 2.2, -2.5],  type: 'torus',       scale: 0.22, color: '#6c63ff',   speed: 0.65 },
  { pos: [ 3.5, 2.9, -1.8],  type: 'icosahedron', scale: 0.16, color: '#00d4ff',   speed: 0.9  },
  // Left edge mid
  { pos: [-4.5, 0.3, -2.2],  type: 'octahedron',  scale: 0.28, color: '#ffffff',   speed: 0.7  },
  { pos: [-3.8, -1.3, -1.8], type: 'torus',       scale: 0.15, color: '#6c63ff',   speed: 1.2  },
  // Bottom-left
  { pos: [-4.2, -2.4, -2.8], type: 'icosahedron', scale: 0.20, color: '#9b8fff',   speed: 0.6  },
  // Bottom-right
  { pos: [ 3.9, -2.1, -2.5], type: 'octahedron',  scale: 0.22, color: '#00d4ff',   speed: 0.85 },
  { pos: [ 4.5, -0.8, -3.0], type: 'torus',       scale: 0.18, color: '#ffffff',   speed: 1.0  },
] as const;

// ── Single peripheral shape ───────────────────────────────────
function PeripheralShape({
  position, type, scale, color, speed, mouse,
}: {
  position: [number, number, number];
  type: string;
  scale: number;
  color: string;
  speed: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePos = useRef(new THREE.Vector3(...position));
  const currentPos = useRef(new THREE.Vector3(...position));
  const REPEL_RADIUS = 1.4; // in 3D units (~30px visual)

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Auto-rotation
    meshRef.current.rotation.x += 0.004 * speed;
    meshRef.current.rotation.y += 0.006 * speed;

    // Gentle float offset
    const floatY = Math.sin(t * 0.35 * speed + position[0]) * 0.12;
    const floatX = Math.cos(t * 0.28 * speed + position[1]) * 0.08;

    // Mouse repel (gentle, 30px range)
    const mx = mouse.current.x * 4.6; // normalize to 3D units
    const my = mouse.current.y * 2.6;
    const dx = basePos.current.x - mx;
    const dy = basePos.current.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let repelX = 0, repelY = 0;
    if (dist < REPEL_RADIUS && dist > 0.01) {
      const strength = (REPEL_RADIUS - dist) / REPEL_RADIUS;
      repelX = (dx / dist) * strength * 0.25;
      repelY = (dy / dist) * strength * 0.25;
    }

    currentPos.current.x += (basePos.current.x + floatX + repelX - currentPos.current.x) * 0.04;
    currentPos.current.y += (basePos.current.y + floatY + repelY - currentPos.current.y) * 0.04;

    meshRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y,
      position[2],
    );

    // Opacity: reduce if shape somehow drifts toward center exclusion zone
    const distFromCenter = Math.max(Math.abs(currentPos.current.x) - 2.8, 0)
      + Math.max(Math.abs(currentPos.current.y) - 2.0, 0);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      Math.max(0.08, Math.min(0.55, 0.2 + distFromCenter * 0.4));
  });

  const geo = useMemo(() => {
    switch (type) {
      case 'torus':       return new THREE.TorusGeometry(0.5, 0.12, 6, 14);
      case 'octahedron':  return new THREE.OctahedronGeometry(0.6, 0);
      default:            return new THREE.IcosahedronGeometry(0.6, 0);
    }
  }, [type]);

  return (
    <mesh ref={meshRef} position={position} scale={scale} geometry={geo}>
      <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
    </mesh>
  );
}

// ── Particle starfield ────────────────────────────────────────
function StarField({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 2500;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const rand = Math.random();
      if (rand < 0.55) {
        // white-ish
        col[i * 3] = 0.94; col[i * 3 + 1] = 0.94; col[i * 3 + 2] = 0.97;
      } else if (rand < 0.78) {
        // faint cyan
        col[i * 3] = 0.0; col[i * 3 + 1] = 0.83; col[i * 3 + 2] = 1.0;
      } else {
        // faint violet
        col[i * 3] = 0.55; col[i * 3 + 1] = 0.49; col[i * 3 + 2] = 1.0;
      }
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.009;
    ref.current.rotation.x = state.clock.elapsedTime * 0.004;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]}    />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.028 : 0.018}
        vertexColors
        transparent
        opacity={isDark ? 0.55 : 0.3}
        sizeAttenuation
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
      <ambientLight intensity={0.1} />
      <StarField isDark={isDark} />
      {SHAPES_DATA.map((s, i) => (
        <PeripheralShape
          key={i}
          position={s.pos as [number, number, number]}
          type={s.type}
          scale={s.scale}
          color={s.color}
          speed={s.speed}
          mouse={mouse}
        />
      ))}
    </>
  );
}

// ── Export ────────────────────────────────────────────────────
export default function HeroScene({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <Scene isDark={isDark} mouse={mouse} />
    </Canvas>
  );
}
