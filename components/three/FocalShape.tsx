/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Single orbiting particle ──────────────────────────────────────
function OrbitDot({
  isDark,
  radius,
  speed,
  tiltX,
  tiltZ,
}: {
  isDark: boolean;
  radius: number;
  speed: number;
  tiltX: number;
  tiltZ: number;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(3);
    pos[0] = radius; pos[1] = 0; pos[2] = 0;
    return pos;
  }, [radius]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    // Orbit in a tilted plane
    const cx = Math.cos(t);
    const cy = Math.sin(t) * Math.cos(tiltX);
    const cz = Math.sin(t) * Math.sin(tiltX + tiltZ);
    pos[0] = cx * radius;
    pos[1] = cy * radius;
    pos[2] = cz * radius;
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.07 : 0.09}
        color={isDark ? '#00d4ff' : '#5b4cff'}
        transparent
        opacity={isDark ? 0.75 : 0.85}
        sizeAttenuation
      />
    </points>
  );
}

// ── Core icosahedron mesh ─────────────────────────────────────────
function IcoMesh({
  isDark,
  mouse,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef  = useRef<THREE.Group>(null);
  const meshRef   = useRef<THREE.Mesh>(null);
  const lerpPos   = useRef({ x: 0, y: 0 });

  // Light mode: use darker, more saturated colors for contrast on light bg
  const accentColor    = isDark ? '#6c63ff' : '#5b4cff';
  const secondaryColor = isDark ? '#00d4ff' : '#4a3de8';

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow auto-rotation
    meshRef.current.rotation.x += 0.0035;
    meshRef.current.rotation.y += 0.006;

    // Gentle float
    const floatY = Math.sin(t * 0.5) * 0.09;

    // Smooth mouse parallax (15-20 px equivalent = ~0.2-0.3 world units)
    lerpPos.current.x += (mouse.current.x * 0.28 - lerpPos.current.x) * 0.04;
    lerpPos.current.y += (-mouse.current.y * 0.28 - lerpPos.current.y) * 0.04;

    groupRef.current.position.x = lerpPos.current.x;
    groupRef.current.position.y = floatY + lerpPos.current.y;
  });

  return (
    <group ref={groupRef}>
      {/* Primary wireframe icosahedron — MORE opaque in light for contrast */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshBasicMaterial
          color={accentColor}
          wireframe
          transparent
          opacity={isDark ? 0.52 : 0.62}
        />
      </mesh>

      {/* Secondary inner icosahedron — slightly rotated offset for depth */}
      <mesh rotation={[0.4, 0.7, 0.2]}>
        <icosahedronGeometry args={[0.78, 0]} />
        <meshBasicMaterial
          color={secondaryColor}
          wireframe
          transparent
          opacity={isDark ? 0.20 : 0.28}
        />
      </mesh>

      {/* Inner solid sphere — gives the shape body on light bg */}
      <mesh>
        <sphereGeometry args={[0.68, 24, 24]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={isDark ? 0.05 : 0.07}
        />
      </mesh>

      {/* 4 orbiting micro-dots on different tilted planes */}
      <OrbitDot isDark={isDark} radius={1.42} speed={0.48} tiltX={0}               tiltZ={0}              />
      <OrbitDot isDark={isDark} radius={1.38} speed={0.33} tiltX={Math.PI / 3}     tiltZ={0}              />
      <OrbitDot isDark={isDark} radius={1.45} speed={0.61} tiltX={Math.PI * 0.72}  tiltZ={0.3}            />
      <OrbitDot isDark={isDark} radius={1.40} speed={0.42} tiltX={-Math.PI / 4}    tiltZ={Math.PI * 0.5}  />
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
  const accentColor = isDark ? '#6c63ff' : '#4f46e5';
  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[3, 3, 3]}  intensity={isDark ? 3.5 : 2.5} color={accentColor} />
      <pointLight position={[-2, -1, 2]} intensity={isDark ? 1.2 : 0.8} color={isDark ? '#00d4ff' : '#0891b2'} />
      <IcoMesh isDark={isDark} mouse={mouse} />
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
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene isDark={isDark} mouse={mouse} />
    </Canvas>
  );
}
