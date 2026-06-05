import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GLASS_MATERIAL_PROS = {
  color: '#25ced1', // Ciano
  transmission: 0.9,
  roughness: 0.05,
  metalness: 0.15,
  ior: 1.5,
  thickness: 0.35,
  clearcoat: 1.0,
  transparent: true,
  opacity: 0.75,
  side: THREE.DoubleSide,
} as const;

export function CylinderAgent({ isFocused }: { isFocused: boolean }) {
  const containerRef = useRef<THREE.Group>(null);
  const tileRefs = useRef<(THREE.Mesh | null)[]>([]);
  const topCapRef = useRef<THREE.Group>(null);
  const bottomCapRef = useRef<THREE.Group>(null);
  const helixRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const focusProgress = useRef(0);
  const time = useRef(0);

  const radius = 0.28;
  const numLayers = 4;
  const tilesPerLayer = 12;
  
  // Alturas das camadas dos ladrilhos
  const layerHeights = useMemo(() => [0.22, 0.07, -0.07, -0.22], []);

  // 1. Gerar as posições e rotações dos 48 ladrilhos
  const tilesData = useMemo(() => {
    const list: {
      basePos: THREE.Vector3;
      rotY: number;
      layerIdx: number;
      angle: number;
      randomOffset: THREE.Vector3;
    }[] = [];

    for (let l = 0; l < numLayers; l++) {
      const y = layerHeights[l];
      for (let t = 0; t < tilesPerLayer; t++) {
        const angle = (t / tilesPerLayer) * Math.PI * 2;
        const basePos = new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        );

        // Direção radial para orientar o ladrilho para fora
        const rotY = Math.PI / 2 - angle;

        // Dispersão caótica individual radial e em Y
        const randomOffset = new THREE.Vector3(
          Math.cos(angle) * 0.15,
          (Math.random() - 0.5) * 0.15,
          Math.sin(angle) * 0.15
        );

        list.push({
          basePos,
          rotY,
          layerIdx: l,
          angle,
          randomOffset
        });
      }
    }
    return list;
  }, [radius, layerHeights]);

  // 2. Gerar as posições da espiral helicoidal dupla de plasma
  const helixPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 30; // 30 pontos por filamento helicoidal
    const rHelix = 0.06;
    const height = 0.55;

    for (let k = 0; k < count; k++) {
      const pct = k / count;
      const y = -height / 2 + height * pct;
      
      const angle1 = pct * Math.PI * 6; // 3 voltas
      points.push(new THREE.Vector3(Math.cos(angle1) * rHelix, y, Math.sin(angle1) * rHelix));

      const angle2 = angle1 + Math.PI;
      points.push(new THREE.Vector3(Math.cos(angle2) * rHelix, y, Math.sin(angle2) * rHelix));
    }
    return points;
  }, []);

  // Dentes de fixação das tampas (6 dentes a cada 60 graus)
  const capTeethAngles = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < 6; i++) {
      list.push((i / 6) * Math.PI * 2);
    }
    return list;
  }, []);

  const addToRefs = (mesh: THREE.Mesh | null, index: number) => {
    tileRefs.current[index] = mesh;
  };

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
    // Fora de foco: rotação lenta apenas em Y
    // Focado: gira suavemente em Y com oscilação pendular no eixo Z
    const currentRotY = t * THREE.MathUtils.lerp(0.15, 0.35, fp);
    const currentRotZ = THREE.MathUtils.lerp(0, Math.sin(t * 1.5) * 0.05, fp);

    if (containerRef.current) {
      containerRef.current.rotation.y = currentRotY;
      containerRef.current.rotation.z = currentRotZ;
    }

    // Animação das Tampas (Fechamento Vertical):
    // Fora de foco: Y = +-0.44 (afastadas/alongadas)
    // Focado: Y = +-0.32 (fechadas/comprimidas)
    const capY = THREE.MathUtils.lerp(0.44, 0.32, fp);
    if (topCapRef.current) topCapRef.current.position.y = capY;
    if (bottomCapRef.current) bottomCapRef.current.position.y = -capY;

    // Animação dos Ladrilhos (Snap Espiral e Flutuação Caótica):
    const spreadRadius = THREE.MathUtils.lerp(0.45, radius, fp);

    tileRefs.current.forEach((mesh, i) => {
      if (!mesh) return;

      const data = tilesData[i];

      // Ruído individual que diminui suavemente sob foco
      const chaosY = Math.sin(t * 2.0 + i * 0.5) * 0.04 * (1 - fp);
      const chaosRad = Math.cos(t * 1.5 + i * 0.3) * 0.04 * (1 - fp);

      // Posicionamento radial dinâmico
      mesh.position.x = Math.cos(data.angle) * (spreadRadius + chaosRad);
      mesh.position.y = layerHeights[data.layerIdx] + chaosY;
      mesh.position.z = Math.sin(data.angle) * (spreadRadius + chaosRad);

      // Rotação individual: oscila sutilmente fora de foco, alinha-se perfeitamente focado
      mesh.rotation.y = THREE.MathUtils.lerp(data.rotY + Math.sin(t + i) * 0.15, data.rotY, fp);
      mesh.rotation.x = THREE.MathUtils.lerp(Math.cos(t + i) * 0.08 * (1 - fp), 0, fp);
    });

    // Rotação do Vórtice Helicoidal (Spin acelerado sob foco):
    if (helixRef.current) {
      const helixSpeed = THREE.MathUtils.lerp(2.0, 8.5, fp);
      helixRef.current.rotation.y = t * helixSpeed;

      // Pulsação sutil no tamanho do feixe de plasma
      const hScale = 1.0 + Math.sin(t * 8) * 0.03 * fp;
      helixRef.current.scale.set(hScale, 1.0, hScale);
    }

    // Luz central reage ao foco e cintila de forma turbulenta
    if (lightRef.current) {
      lightRef.current.intensity = (2.0 + fp * 3.0) * (1.0 + Math.sin(t * 18) * 0.15 * fp);
    }
  });

  return (
    <group ref={containerRef}>
      {/* Luz central do reator */}
      <pointLight ref={lightRef} color="#25ced1" intensity={2.0} distance={2.5} decay={2} />

      {/* Renderização dos 48 Ladrilhos Ciano */}
      {tilesData.map((data, i) => (
        <mesh
          key={i}
          ref={(m) => addToRefs(m, i)}
        >
          <boxGeometry args={[0.10, 0.11, 0.03]} />
          <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} />
        </mesh>
      ))}

      {/* Tampa Superior (Cap) */}
      <group ref={topCapRef}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
          <meshStandardMaterial color="#2d3345" metalness={0.8} roughness={0.3} />
        </mesh>
        {capTeethAngles.map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.22, -0.04, Math.sin(angle) * 0.22]}
            rotation={[Math.PI, 0, -angle]}
          >
            <coneGeometry args={[0.02, 0.06, 4]} />
            <meshStandardMaterial color="#25ced1" emissive="#25ced1" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Tampa Inferior (Cap) */}
      <group ref={bottomCapRef}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
          <meshStandardMaterial color="#2d3345" metalness={0.8} roughness={0.3} />
        </mesh>
        {capTeethAngles.map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.22, 0.04, Math.sin(angle) * 0.22]}
            rotation={[0, 0, angle]}
          >
            <coneGeometry args={[0.02, 0.06, 4]} />
            <meshStandardMaterial color="#25ced1" emissive="#25ced1" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Vórtice Helicoidal de Plasma */}
      <group ref={helixRef}>
        {helixPoints.map((pos, k) => (
          <mesh key={k} position={pos.toArray()}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshBasicMaterial color="#a6f8f9" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
