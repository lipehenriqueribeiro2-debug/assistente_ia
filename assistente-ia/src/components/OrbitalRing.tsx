// DEPRECATED — replaced by OrbitalCarousel + updated positioning math
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DualCore } from './DualCore';
import { SUB_AGENTS_CONFIG } from './SubAgentArtifacts';

const RADIUS = 5.0;
const LAMBDA = 4.0;
const PI2 = Math.PI * 2;

const ORBITAL_CAM = new THREE.Vector3(0, 2, 10);

const FOCUS_POSITIONS = [
  new THREE.Vector3(2, 2.5, 7),
  new THREE.Vector3(7, 2.5, 2),
  new THREE.Vector3(-2, 2.5, -7),
  new THREE.Vector3(-7, 2.5, -2),
];

function SubAgentNode({ index, total, isFocused, onSelect, Component }: {
  index: number;
  total: number;
  isFocused: boolean;
  onSelect: (index: number) => void;
  Component: React.ComponentType<{ isFocused: boolean }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothScale = useRef(1);
  const angle = (index / total) * PI2;
  const x = Math.sin(angle) * RADIUS;
  const z = Math.cos(angle) * RADIUS;

  useFrame((_, delta) => {
    const targetScale = isFocused ? 1.8 : 1;
    smoothScale.current = THREE.MathUtils.damp(smoothScale.current, targetScale, LAMBDA, delta);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(smoothScale.current);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[x, 0, z]}
      onClick={(e) => { e.stopPropagation(); onSelect(index); }}
    >
      <Component isFocused={isFocused} />
    </group>
  );
}

export function OrbitalRing() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const smoothRotation = useRef(0);
  const targetRotation = useRef(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const camPos = useRef(new THREE.Vector3().copy(ORBITAL_CAM));
  const targetCamPos = useRef(new THREE.Vector3().copy(ORBITAL_CAM));

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (focusedIndex !== null) {
        setFocusedIndex(null);
      } else {
        targetRotation.current += e.deltaY * 0.002;
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [focusedIndex]);

  const handleSelect = useCallback((index: number) => {
    setFocusedIndex((prev) => (prev === index ? null : index));
  }, []);

  useEffect(() => {
    if (focusedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusedIndex(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusedIndex]);

  useFrame((_, delta) => {
    smoothRotation.current = THREE.MathUtils.damp(
      smoothRotation.current, targetRotation.current, LAMBDA, delta
    );
    if (groupRef.current) {
      groupRef.current.rotation.y = smoothRotation.current;
    }

    targetCamPos.current.copy(
      focusedIndex !== null ? FOCUS_POSITIONS[focusedIndex] : ORBITAL_CAM
    );
    camPos.current.lerp(targetCamPos.current, 1 - Math.exp(-LAMBDA * delta));
    camera.position.copy(camPos.current);
    camera.lookAt(0, 0, 0);
  });

  const configs = useMemo(() => SUB_AGENTS_CONFIG, []);

  return (
    <group ref={groupRef}>
      <DualCore />

      {configs.map((cfg, i) => {
        const C = cfg.Component;
        return (
          <SubAgentNode
            key={cfg.id}
            index={i}
            total={configs.length}
            isFocused={focusedIndex === i}
            onSelect={handleSelect}
            Component={C}
          />
        );
      })}
    </group>
  );
}
