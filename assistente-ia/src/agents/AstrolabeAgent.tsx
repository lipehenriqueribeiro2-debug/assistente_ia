import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GLASS_MATERIAL_PROS = {
  color: '#ffffff',
  transmission: 1.0,
  roughness: 0.05,
  metalness: 0.1,
  ior: 1.5,
  thickness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  transparent: true,
  opacity: 0.8,
  side: THREE.DoubleSide,
} as const;

export function AstrolabeAgent({ isFocused }: { isFocused: boolean }) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const focusProgress = useRef(0);
  const time = useRef(0);

  // Eixos e tamanhos para a modelagem dos anéis concêntricos (Etapa 1)
  const ringParams = useMemo(() => ({
    outer: { radius: 0.6, tube: 0.018 },
    mid: { radius: 0.46, tube: 0.015 },
    inner: { radius: 0.32, tube: 0.012 }
  }), []);

  useFrame((state, delta) => {
    time.current += delta;
    const t = time.current;

    // Interpolação suave do progresso de foco (0 a 1)
    focusProgress.current = THREE.MathUtils.damp(
      focusProgress.current,
      isFocused ? 1 : 0,
      4.0,
      delta
    );

    const fp = focusProgress.current;

    // Velocidades de rotação: aumentam e se alinham quando focado
    const outerSpeed = 0.15 + fp * 0.45;
    const midSpeed = -0.25 - fp * 0.55;
    const innerSpeed = 0.35 + fp * 0.75;
    
    // Rotação dos anéis:
    // Fora de foco: rotação desordenada em múltiplos eixos (giroscópio clássico)
    // Focado: os anéis convergem gradativamente para alinhar suas inclinações e eixos
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = THREE.MathUtils.lerp(t * outerSpeed, 0, fp * 0.8);
      outerRingRef.current.rotation.y = t * outerSpeed;
      outerRingRef.current.rotation.z = THREE.MathUtils.lerp(0, t * outerSpeed * 0.2, fp);
    }

    if (midRingRef.current) {
      midRingRef.current.rotation.x = t * midSpeed * 0.5;
      midRingRef.current.rotation.y = THREE.MathUtils.lerp(t * midSpeed, 0, fp * 0.7);
      midRingRef.current.rotation.z = t * midSpeed;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * innerSpeed;
      innerRingRef.current.rotation.y = t * innerSpeed * 0.3;
      innerRingRef.current.rotation.z = THREE.MathUtils.lerp(t * innerSpeed, 0, fp * 0.9);
    }

    // Núcleo pulsa em escala e brilha mais forte no foco
    if (coreRef.current) {
      const pulseScale = 1.0 + Math.sin(t * (4 + fp * 6)) * (0.05 + fp * 0.08);
      coreRef.current.scale.setScalar(pulseScale);
      coreRef.current.rotation.y = t * -0.5;

      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 1.2 + fp * 2.5;
      }
    }

    // Luz interna reage ao pulso e foco
    if (lightRef.current) {
      lightRef.current.intensity = (1.5 + fp * 2.5) * (1.0 + Math.sin(t * 8) * 0.1);
    }
  });

  return (
    <group>
      {/* Luz interna para fazer o núcleo de plasma vermelho do Orquestrador brilhar */}
      <pointLight ref={lightRef} color="#a92727" intensity={1.5} distance={2.5} decay={2} />

      {/* Anel Externo */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[ringParams.outer.radius, ringParams.outer.tube, 16, 100]} />
        <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} color="#ffb3b3" />
      </mesh>

      {/* Anel Médio */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[ringParams.mid.radius, ringParams.mid.tube, 16, 100]} />
        <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} color="#ffffff" />
      </mesh>

      {/* Anel Interno */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[ringParams.inner.radius, ringParams.inner.tube, 16, 100]} />
        <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} color="#ff8080" />
      </mesh>

      {/* Núcleo Central Luminoso (Plasma) */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.15, 2]} />
        <meshStandardMaterial
          color="#a92727"
          emissive="#ff3333"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
