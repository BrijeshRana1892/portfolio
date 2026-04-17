/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── Central wireframe icosahedron core ────────────────────────
function CoreNode({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  const color = isDark ? '#6c63ff' : '#7c3aed';
  const accent = isDark ? '#00d4ff' : '#0891b2';

  const handleClick = (e: any) => {
    e.stopPropagation();
    pulseRef.current = 1.0;
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.25;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.25;

    const p = pulseRef.current;
    pulseRef.current *= 0.92;
    const scale = 1 + p * 0.3 + (hovered ? 0.05 : 0);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={isDark ? 0.55 : 0.40}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[0.3, 0.4, 0]}>
        <icosahedronGeometry args={[0.65, 0]} />
        <meshBasicMaterial
          color={accent}
          wireframe
          transparent
          opacity={isDark ? 0.35 : 0.25}
          toneMapped={false}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={isDark ? 0.22 : 0.10}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ── Orbiting satellite node (clickable) ───────────────────────
function Satellite({
  angleOffset,
  radius,
  speed,
  yTilt,
  size,
  color,
  isDark,
}: {
  angleOffset: number;
  radius: number;
  speed: number;
  yTilt: number;
  size: number;
  color: string;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);
  const verticalKick = useRef(0);

  const handleClick = (e: any) => {
    e.stopPropagation();
    pulseRef.current = 1.0;
    verticalKick.current = (Math.random() - 0.5) * 0.6 + 0.3;
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const a = t * speed + angleOffset;
    meshRef.current.position.x = Math.cos(a) * radius;
    meshRef.current.position.z = Math.sin(a) * radius;
    meshRef.current.position.y =
      Math.sin(t * speed * 1.3 + angleOffset) * yTilt + verticalKick.current;

    verticalKick.current *= 0.94;

    meshRef.current.rotation.x = t * 0.6 + angleOffset;
    meshRef.current.rotation.y = t * 0.4;

    const p = pulseRef.current;
    pulseRef.current *= 0.90;
    meshRef.current.scale.setScalar(1 + p * 0.5);
  });

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <octahedronGeometry args={[size, 0]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={isDark ? 0.75 : 0.55}
        toneMapped={false}
      />
    </mesh>
  );
}

// ── Connection lines (dark-only, additive glow) ───────────────
function ConnectionLines({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.LineSegments>(null);

  const { positions, count } = useMemo(() => {
    const pairs: number[] = [];
    const nodeCount = 14;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.4 + Math.random() * 0.8;
      nodes.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * r,
          Math.sin(phi) * Math.sin(theta) * r * 0.6,
          Math.cos(phi) * r
        )
      );
    }
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 2.2) {
          pairs.push(nodes[i].x, nodes[i].y, nodes[i].z);
          pairs.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    return {
      positions: new Float32Array(pairs),
      count: pairs.length / 3,
    };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.15) * 0.1;
  });

  if (!isDark) return null;

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00d4ff"
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

// ── Ambient drifting particles ────────────────────────────────
function DriftParticles({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.8 + Math.random() * 2.2;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.7;
      pos[i * 3 + 2] = Math.cos(phi) * r;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color={isDark ? '#9b8fff' : '#7c3aed'}
        transparent
        opacity={isDark ? 0.5 : 0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

// ── Main group with mouse parallax ────────────────────────────
function MainGroup({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lerp = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!groupRef.current) return;
    lerp.current.x += (mouse.current.x * 0.4 - lerp.current.x) * 0.03;
    lerp.current.y += (-mouse.current.y * 0.3 - lerp.current.y) * 0.03;
    groupRef.current.rotation.y = lerp.current.x * 0.3;
    groupRef.current.rotation.x = lerp.current.y * 0.2;
  });

  const satellites = useMemo(
    () => [
      { angleOffset: 0,          radius: 2.1, speed: 0.35, yTilt: 0.8,  size: 0.18, color: isDark ? '#00d4ff' : '#0891b2' },
      { angleOffset: Math.PI*0.7, radius: 2.4, speed: 0.28, yTilt: 0.6,  size: 0.14, color: isDark ? '#ff6bcb' : '#db2777' },
      { angleOffset: Math.PI*1.3, radius: 1.9, speed: 0.42, yTilt: 1.0,  size: 0.16, color: isDark ? '#9b8fff' : '#7c3aed' },
      { angleOffset: Math.PI*1.8, radius: 2.6, speed: 0.22, yTilt: 0.5,  size: 0.20, color: isDark ? '#00ff88' : '#059669' },
      { angleOffset: Math.PI*0.4, radius: 2.2, speed: 0.31, yTilt: 0.7,  size: 0.13, color: isDark ? '#ffb547' : '#ea580c' },
    ],
    [isDark]
  );

  return (
    <group ref={groupRef}>
      <CoreNode isDark={isDark} />
      {satellites.map((s, i) => (
        <Satellite key={i} {...s} isDark={isDark} />
      ))}
      <ConnectionLines isDark={isDark} />
      <DriftParticles isDark={isDark} />
    </group>
  );
}

// ── Scene wrapper ─────────────────────────────────────────────
function Scene({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.4 : 0.9} />
      <MainGroup isDark={isDark} mouse={mouse} />
    </>
  );
}

// ── Export ────────────────────────────────────────────────────
export default function ContactScene({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Scene isDark={isDark} mouse={mouse} />
    </Canvas>
  );
}
