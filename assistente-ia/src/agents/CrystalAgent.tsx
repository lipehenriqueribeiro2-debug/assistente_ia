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

export function CrystalAgent({ isFocused }: { isFocused: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
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

    if (meshRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.05 * (isFocused ? 1 : 0);
      meshRef.current.scale.y = pulse;
      meshRef.current.rotation.y = t * 0.2;

      const tRX = isFocused ? -Math.PI / 2 : 0;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, tRX, 0.015);
    }
  });

  return (
    <mesh ref={meshRef} geometry={baseGeo}>
      <meshPhysicalMaterial {...GLASS_MATERIAL} />
    </mesh>
  );
}
