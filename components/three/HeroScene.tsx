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
  { pos: [-3.9,  2.4, -2.0], type: 'icosahedron', scale: 0.26, color: '#ffffff', speed: 0.8  },
  { pos: [-4.4,  1.1, -3.0], type: 'torus',       scale: 0.20, color: '#00d4ff', speed: 0.55 },
  { pos: [-3.3,  2.8, -1.5], type: 'octahedron',  scale: 0.18, color: '#9b8fff', speed: 1.1  },
  // Top-right cluster
  { pos: [ 4.1,  2.2, -2.5], type: 'torus',       scale: 0.22, color: '#6c63ff', speed: 0.65 },
  { pos: [ 3.5,  2.9, -1.8], type: 'icosahedron', scale: 0.16, color: '#00d4ff', speed: 0.9  },
  // Left edge mid
  { pos: [-4.5,  0.3, -2.2], type: 'octahedron',  scale: 0.28, color: '#ffffff', speed: 0.7  },
  { pos: [-3.8, -1.3, -1.8], type: 'torus',       scale: 0.15, color: '#6c63ff', speed: 1.2  },
  // Bottom-left
  { pos: [-4.2, -2.4, -2.8], type: 'icosahedron', scale: 0.20, color: '#9b8fff', speed: 0.6  },
  // Bottom-right
  { pos: [ 3.9, -2.1, -2.5], type: 'octahedron',  scale: 0.22, color: '#00d4ff', speed: 0.85 },
  { pos: [ 4.5, -0.8, -3.0], type: 'torus',       scale: 0.18, color: '#ffffff', speed: 1.0  },
] as const;

// ── Connecting constellation pairs ────────────────────────────
const CONSTELLATION_PAIRS: [number, number][] = [
  [0, 1], [0, 2], [1, 5], [2, 3], [3, 4],
  [5, 7], [6, 7], [8, 9], [4, 9], [5, 6],
];

// ── Single peripheral shape ───────────────────────────────────
function PeripheralShape({
  position, type, scale, color, speed, mouse, isDark,
}: {
  position: [number, number, number];
  type: string;
  scale: number;
  color: string;
  speed: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePos    = useRef(new THREE.Vector3(...position));
  const currentPos = useRef(new THREE.Vector3(...position));
  const velocity   = useRef(new THREE.Vector3());
  const spinBoost  = useRef(0);
  const REPEL_RADIUS = 1.4;

  const handleClick = (e: any) => {
    e.stopPropagation();
    const angle = Math.random() * Math.PI * 2;
    velocity.current.x += Math.cos(angle) * 0.12;
    velocity.current.y += Math.sin(angle) * 0.12 + 0.08;
    velocity.current.z += (Math.random() - 0.5) * 0.08;
    spinBoost.current += 0.22;
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    meshRef.current.rotation.x += 0.004 * speed + spinBoost.current;
    meshRef.current.rotation.y += 0.006 * speed + spinBoost.current;
    spinBoost.current *= 0.93;

    const floatY = Math.sin(t * 0.35 * speed + position[0]) * 0.12;
    const floatX = Math.cos(t * 0.28 * speed + position[1]) * 0.08;

    const mx = mouse.current.x * 4.6;
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

    // Apply kick velocity and damp it
    currentPos.current.x += velocity.current.x;
    currentPos.current.y += velocity.current.y;
    currentPos.current.z += velocity.current.z;
    velocity.current.multiplyScalar(0.90);

    // Spring back to base (+float +repel)
    currentPos.current.x += (basePos.current.x + floatX + repelX - currentPos.current.x) * 0.04;
    currentPos.current.y += (basePos.current.y + floatY + repelY - currentPos.current.y) * 0.04;
    currentPos.current.z += (position[2] - currentPos.current.z) * 0.04;

    meshRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y,
      currentPos.current.z,
    );

    const distFromCenter = Math.max(Math.abs(currentPos.current.x) - 2.8, 0)
      + Math.max(Math.abs(currentPos.current.y) - 2.0, 0);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      Math.max(0.08, Math.min(0.6, 0.22 + distFromCenter * 0.4));
  });

  const geo = useMemo(() => {
    switch (type) {
      case 'torus':       return new THREE.TorusGeometry(0.5, 0.12, 6, 14);
      case 'octahedron':  return new THREE.OctahedronGeometry(0.6, 0);
      default:            return new THREE.IcosahedronGeometry(0.6, 0);
    }
  }, [type]);

  const lightColor  = '#5b4cff';
  const wireColor   = isDark ? color : lightColor;
  const wireOpacity = isDark ? 0.4 : 0.22;

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      geometry={geo}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <meshBasicMaterial color={wireColor} wireframe transparent opacity={wireOpacity} toneMapped={false} />
    </mesh>
  );
}

// ── Constellation lines between nearby shape pairs ────────────
function ConstellationLines({ isDark }: { isDark: boolean }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const matRef  = useRef<THREE.LineBasicMaterial>(null);

  const { geometry, positions } = useMemo(() => {
    const pts: number[] = [];
    CONSTELLATION_PAIRS.forEach(([a, b]) => {
      const pa = SHAPES_DATA[a].pos;
      const pb = SHAPES_DATA[b].pos;
      pts.push(pa[0], pa[1], pa[2], pb[0], pb[1], pb[2]);
    });
    const pos = new Float32Array(pts);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: g, positions: pos };
  }, []);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.elapsedTime;
    matRef.current.opacity = (isDark ? 0.12 : 0.08) + Math.sin(t * 0.6) * 0.04;
  });

  if (!isDark) return null;

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={matRef}
        color={'#6c63ff'}
        transparent
        opacity={0.12}
        toneMapped={false}
      />
    </lineSegments>
  );
}

// ── Particle starfield with twinkle ───────────────────────────
function StarField({ isDark }: { isDark: boolean }) {
  const ref   = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const COUNT = 3200;

  const [positions, colors, phases] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const ph  = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
      ph[i] = Math.random() * Math.PI * 2;

      const rand = Math.random();
      if (rand < 0.55) {
        col[i * 3] = 0.94; col[i * 3 + 1] = 0.94; col[i * 3 + 2] = 0.97;
      } else if (rand < 0.78) {
        col[i * 3] = 0.0;  col[i * 3 + 1] = 0.83; col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3] = 0.55; col[i * 3 + 1] = 0.49; col[i * 3 + 2] = 1.0;
      }
    }
    return [pos, col, ph];
  }, []);

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.009;
    ref.current.rotation.x = t * 0.004;
    // Subtle global twinkle (opacity breathing)
    matRef.current.opacity = 0.55 + Math.sin(t * 0.8) * 0.08;
  });

  if (!isDark) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]}    />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.032}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

// ── Shooting stars ────────────────────────────────────────────
function ShootingStar({ isDark, seed }: { isDark: boolean; seed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const state = useRef({
    active: false,
    t: 0,
    duration: 0,
    start: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    nextFire: 2 + Math.random() * 4 + seed,
  });

  useFrame((s, delta) => {
    if (!ref.current) return;
    const st = state.current;
    if (!st.active) {
      st.nextFire -= delta;
      if (st.nextFire <= 0) {
        st.active = true;
        st.t = 0;
        st.duration = 0.8 + Math.random() * 0.6;
        st.start.set(
          -10 + Math.random() * 4,
          2 + Math.random() * 3,
          -3 - Math.random() * 3,
        );
        st.dir.set(14 + Math.random() * 4, -3 - Math.random() * 2, 0);
      } else {
        (ref.current.material as THREE.MeshBasicMaterial).opacity = 0;
        return;
      }
    }

    st.t += delta;
    const p = Math.min(st.t / st.duration, 1);
    ref.current.position.set(
      st.start.x + st.dir.x * p,
      st.start.y + st.dir.y * p,
      st.start.z,
    );
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = p < 0.2 ? p * 5 : (p > 0.8 ? (1 - p) * 5 : 1);

    if (p >= 1) {
      st.active = false;
      st.nextFire = 3 + Math.random() * 6;
    }
  });

  if (!isDark) return null;

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color={'#ffffff'} transparent opacity={0} toneMapped={false} />
    </mesh>
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
      <ConstellationLines isDark={isDark} />
      {SHAPES_DATA.map((s, i) => (
        <PeripheralShape
          key={i}
          position={s.pos as [number, number, number]}
          type={s.type}
          scale={s.scale}
          color={s.color}
          speed={s.speed}
          mouse={mouse}
          isDark={isDark}
        />
      ))}
      <ShootingStar isDark={isDark} seed={0} />
      <ShootingStar isDark={isDark} seed={2.3} />
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
