import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GLASS_MATERIAL = {
  color: '#FFFFFF',
  transmission: 1.0,
  roughness: 0.1,
  ior: 1.5,
  clearcoat: 1.0,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide,
} as const;

const LAMBDA = 4.0;

export function ShatteredMonolith({ isFocused, opacity = 0.7 }: { isFocused: boolean; opacity?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const boxRefs = useRef<THREE.Mesh[]>([]);
  const time = useRef(0);
  const focusProgress = useRef(0);

  const offsets = useMemo(() => {
    const positions: { x: number; z: number; ry: number }[] = [];
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.15;
      positions.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        ry: Math.random() * 0.1,
      });
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;

    focusProgress.current = THREE.MathUtils.damp(
      focusProgress.current, isFocused ? 1 : 0, LAMBDA, delta
    );

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
    }

    boxRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const off = offsets[i];
      const spread = 0.1 + focusProgress.current * 0.2;
      mesh.position.x = off.x * (1 + spread * 10);
      mesh.position.z = off.z * (1 + spread * 10);
      mesh.position.y = Math.sin(t * 0.5 + i * 1.5) * 0.05;
    });
  });

  const addToRefs = (mesh: THREE.Mesh | null) => {
    if (mesh && !boxRefs.current.includes(mesh)) {
      boxRefs.current.push(mesh);
    }
  };

  return (
    <group ref={groupRef}>
      {offsets.map((off, i) => (
        <mesh
          key={i}
          ref={addToRefs}
          position={[off.x, 0, off.z]}
          rotation={[0, off.ry, 0]}
        >
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshPhysicalMaterial {...GLASS_MATERIAL} opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

export function MobiusKnot({ isFocused, opacity = 0.7 }: { isFocused: boolean; opacity?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const focusProgress = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;

    focusProgress.current = THREE.MathUtils.damp(
      focusProgress.current, isFocused ? 1 : 0, LAMBDA, delta
    );

    if (meshRef.current) {
      const speed = 0.3 + focusProgress.current * 0.8;
      meshRef.current.rotation.x = t * speed * 0.5;
      meshRef.current.rotation.y = t * speed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.35, 0.12, 64, 8, 2, 3]} />
      <meshPhysicalMaterial {...GLASS_MATERIAL} opacity={opacity} />
    </mesh>
  );
}

export function Astrolabe({ isFocused, opacity = 0.7 }: { isFocused: boolean; opacity?: number }) {
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const time = useRef(0);
  const focusProgress = useRef(0);

  const ringSpeeds = useMemo(() => [
    { axis: 'x' as const, speed: 0.4, radius: 0.55 },
    { axis: 'y' as const, speed: 0.6, radius: 0.45 },
    { axis: 'z' as const, speed: 0.5, radius: 0.35 },
  ], []);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;

    focusProgress.current = THREE.MathUtils.damp(
      focusProgress.current, isFocused ? 1 : 0, LAMBDA, delta
    );

    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const sp = ringSpeeds[i];
      const align = focusProgress.current;
      const ax = sp.axis;
      const baseSpeed = sp.speed;
      const s = baseSpeed + align * 0.3;
      if (ax === 'x') mesh.rotation.x = t * s + align * 0.2;
      if (ax === 'y') mesh.rotation.y = t * s + align * 0.2;
      if (ax === 'z') mesh.rotation.z = t * s + align * 0.2;
    });
  });

  const addToRefs = (mesh: THREE.Mesh | null) => {
    if (mesh && !ringRefs.current.includes(mesh)) {
      ringRefs.current.push(mesh);
    }
  };

  return (
    <group>
      {ringSpeeds.map((sp, i) => (
        <mesh key={i} ref={addToRefs}>
          <ringGeometry args={[sp.radius - 0.03, sp.radius, 64]} />
          <meshPhysicalMaterial {...GLASS_MATERIAL} side={THREE.DoubleSide} opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

export function FrequencyCrystal({ isFocused, opacity = 0.7 }: { isFocused: boolean; opacity?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const focusProgress = useRef(0);
  const baseGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.3, 1);
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const y = arr[i + 1];
      const stretch = 1 + Math.abs(y) * 2.5;
      arr[i] *= stretch * 0.6;
      arr[i + 1] *= stretch;
      arr[i + 2] *= stretch * 0.6;
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;

    focusProgress.current = THREE.MathUtils.damp(
      focusProgress.current, isFocused ? 1 : 0, LAMBDA, delta
    );

    if (meshRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.05 * focusProgress.current;
      meshRef.current.scale.y = pulse;
      meshRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} geometry={baseGeo}>
      <meshPhysicalMaterial {...GLASS_MATERIAL} opacity={opacity} />
    </mesh>
  );
}

export const SUB_AGENTS_CONFIG = [
  { id: 'orchestrator_01', title: 'Infra & Automação', Component: ShatteredMonolith },
  { id: 'focus_01', title: 'Sistemas de Potência', Component: MobiusKnot },
  { id: 'campaign_01', title: 'World-building & Lore', Component: Astrolabe },
  { id: 'media_01', title: 'Controle de Mídia', Component: FrequencyCrystal },
];
