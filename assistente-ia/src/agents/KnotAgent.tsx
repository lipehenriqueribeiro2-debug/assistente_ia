import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GLASS_MATERIAL_PROS = {
  color: '#ffaa00', // Dourado / Âmbar
  transmission: 0.95,
  roughness: 0.05,
  metalness: 0.1,
  ior: 1.55,
  thickness: 0.45,
  clearcoat: 1.0,
  transparent: true,
  opacity: 0.8,
  side: THREE.DoubleSide,
} as const;

export function KnotAgent({ isFocused }: { isFocused: boolean }) {
  const containerRef = useRef<THREE.Group>(null);
  const knot1Ref = useRef<THREE.Mesh>(null);
  const knot2Ref = useRef<THREE.Mesh>(null);
  const knot3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const focusProgress = useRef(0);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    const t = time.current;

    // Amortecimento do progresso do foco (0 a 1)
    focusProgress.current = THREE.MathUtils.damp(
      focusProgress.current,
      isFocused ? 1 : 0,
      4.0,
      delta
    );

    const fp = focusProgress.current;

    // Rotação do Container Principal (Dinamismo Ativo):
    // Fora de foco: rotação tridimensional lenta em X e Y
    // Focado: gira continuamente em Y com inclinação senoidal constante em X
    const currentRotY = t * THREE.MathUtils.lerp(0.2, 0.35, fp);
    const currentRotX = THREE.MathUtils.lerp(t * 0.15, Math.sin(t * 1.2) * 0.06, fp);

    if (containerRef.current) {
      containerRef.current.rotation.x = currentRotX;
      containerRef.current.rotation.y = currentRotY;
    }

    // Animação de Desentrelaçamento e Snap Magnético dos 3 Filamentos:
    // Fora de foco: se deslocam em eixos diferentes
    // Focado: deslocamento vai a 0 (nó perfeitamente unido)
    const floatDist = THREE.MathUtils.lerp(0.14, 0, fp);
    
    if (knot1Ref.current) {
      const offset = Math.sin(t * 1.5 + 0.0) * floatDist;
      knot1Ref.current.position.set(offset, 0, 0);
      knot1Ref.current.rotation.z = THREE.MathUtils.lerp(t * 0.3, 0, fp);
    }
    if (knot2Ref.current) {
      const offset = Math.sin(t * 1.5 + 1.2) * floatDist;
      knot2Ref.current.position.set(0, offset, 0);
      knot2Ref.current.rotation.x = THREE.MathUtils.lerp(t * -0.2, 0, fp);
    }
    if (knot3Ref.current) {
      const offset = Math.sin(t * 1.5 + 2.4) * floatDist;
      knot3Ref.current.position.set(0, 0, offset);
      knot3Ref.current.rotation.y = THREE.MathUtils.lerp(t * 0.15, 0, fp);
    }

    // Núcleo e Luz reagem ao foco e pulsam
    if (coreRef.current) {
      const corePulse = (1.0 + Math.sin(t * 6) * 0.03) * (1.0 + fp * 0.04);
      coreRef.current.scale.setScalar(corePulse);

      const coreMat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (coreMat) {
        coreMat.emissiveIntensity = 1.2 + fp * 2.3;
      }
    }

    if (lightRef.current) {
      lightRef.current.intensity = (1.8 + fp * 2.7) * (1.0 + Math.sin(t * 12) * 0.15);
    }
  });

  return (
    <group ref={containerRef}>
      {/* Luz central dourada retroiluminando os filamentos */}
      <pointLight ref={lightRef} color="#ffaa00" intensity={1.8} distance={2.5} decay={2} />

      {/* Filamento 1 */}
      <mesh ref={knot1Ref}>
        <torusKnotGeometry args={[0.34, 0.045, 64, 8, 2, 3]} />
        <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} />
      </mesh>

      {/* Filamento 2 */}
      <mesh ref={knot2Ref}>
        <torusKnotGeometry args={[0.34, 0.045, 64, 8, 2, 3]} />
        <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} />
      </mesh>

      {/* Filamento 3 */}
      <mesh ref={knot3Ref}>
        <torusKnotGeometry args={[0.34, 0.045, 64, 8, 2, 3]} />
        <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} />
      </mesh>

      {/* Núcleo Central de Energia Möbius */}
      <mesh ref={coreRef}>
        <torusKnotGeometry args={[0.34, 0.008, 64, 8, 2, 3]} />
        <meshStandardMaterial
          color="#8c5800"
          emissive="#ffaa00"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
