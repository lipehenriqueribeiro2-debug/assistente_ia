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

export function HardwareAgent({ isFocused }: { isFocused: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const boxRefs = useRef<THREE.Mesh[]>([]);
  const time = useRef(0);
  const currentSpeed = useRef(0.5);

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

    const targetSpeed = isFocused ? 4.0 : 0.5;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 0.015);

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * currentSpeed.current;
      groupRef.current.rotation.x += delta * currentSpeed.current * 0.5;
    }

    boxRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const off = offsets[i];
      const spread = 0.1;
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
          <meshPhysicalMaterial {...GLASS_MATERIAL} />
        </mesh>
      ))}
    </group>
  );
}
