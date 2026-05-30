import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

export function AiCorePlaceholder({ color = '#3e3e4d' }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).color.set(color);
    }
  }, [color]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.35;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.6;
      meshRef.current.rotation.z = Math.cos(t * 0.15) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 0]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}
