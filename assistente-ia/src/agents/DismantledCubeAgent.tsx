import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GLASS_MATERIAL_PROS = {
  color: '#b829ff', // Magenta/Violeta
  transmission: 0.95,
  roughness: 0.1,
  metalness: 0.1,
  ior: 1.6,
  thickness: 0.4,
  clearcoat: 1.0,
  transparent: true,
  opacity: 0.75,
  side: THREE.DoubleSide,
} as const;

export function DismantledCubeAgent({ isFocused }: { isFocused: boolean }) {
  const containerRef = useRef<THREE.Group>(null);
  const tileRefs = useRef<(THREE.Mesh | null)[]>([]);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const focusProgress = useRef(0);
  const time = useRef(0);

  const cubeRadius = 0.28;
  const tileSpacing = 0.16;

  // Gerar as informações de posicionamento dos 54 ladrilhos (9 por face, 6 faces)
  const tilesData = useMemo(() => {
    const list: {
      basePos: THREE.Vector3;
      normal: THREE.Vector3;
      rotation: THREE.Euler;
      randomOffset: THREE.Vector3;
    }[] = [];

    const faces = [
      { normal: new THREE.Vector3(1, 0, 0), u: new THREE.Vector3(0, 1, 0), v: new THREE.Vector3(0, 0, 1), rot: new THREE.Euler(0, Math.PI / 2, 0) },
      { normal: new THREE.Vector3(-1, 0, 0), u: new THREE.Vector3(0, 1, 0), v: new THREE.Vector3(0, 0, -1), rot: new THREE.Euler(0, -Math.PI / 2, 0) },
      { normal: new THREE.Vector3(0, 1, 0), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), rot: new THREE.Euler(-Math.PI / 2, 0, 0) },
      { normal: new THREE.Vector3(0, -1, 0), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, -1), rot: new THREE.Euler(Math.PI / 2, 0, 0) },
      { normal: new THREE.Vector3(0, 0, 1), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 1, 0), rot: new THREE.Euler(0, 0, 0) },
      { normal: new THREE.Vector3(0, 0, -1), u: new THREE.Vector3(-1, 0, 0), v: new THREE.Vector3(0, 1, 0), rot: new THREE.Euler(0, Math.PI, 0) }
    ];

    for (const face of faces) {
      for (let uIdx of [-1, 0, 1]) {
        for (let vIdx of [-1, 0, 1]) {
          const basePos = new THREE.Vector3()
            .copy(face.normal).multiplyScalar(cubeRadius)
            .addScaledVector(face.u, uIdx * tileSpacing)
            .addScaledVector(face.v, vIdx * tileSpacing);

          // Vetor de dispersão radial caótica (afastando-se da face)
          const randomOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15
          ).add(face.normal.clone().multiplyScalar(0.35));

          list.push({
            basePos,
            normal: face.normal,
            rotation: face.rot,
            randomOffset
          });
        }
      }
    }
    return list;
  }, []);

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

    // Rotação do Grupo Principal (Dinamismo Ativo):
    // Fora de foco: rotação tridimensional livre e contínua
    // Focado: gira majestosamente no eixo Y com oscilação pendular suave em X
    const currentRotY = t * THREE.MathUtils.lerp(0.15, 0.3, fp);
    const currentRotX = THREE.MathUtils.lerp(t * 0.1, Math.sin(t * 1.2) * 0.06, fp);

    if (containerRef.current) {
      containerRef.current.rotation.x = currentRotX;
      containerRef.current.rotation.y = currentRotY;
    }

    // Animação de Snap Magnético e Alinhamento dos 54 Ladrilhos:
    tileRefs.current.forEach((mesh, i) => {
      if (!mesh) return;

      const data = tilesData[i];

      // Afastamento radial caótico sutil que pulsa fora de foco
      const chaosScale = 1.0 + Math.sin(t * 1.5 + i * 0.4) * 0.15;
      const currentOffset = data.randomOffset.clone().multiplyScalar(chaosScale * (1 - fp));

      // Snap magnético interpolado
      mesh.position.addVectors(data.basePos, currentOffset);

      // Rotação individual: livre em repouso; alinha-se perfeitamente focado
      mesh.rotation.x = THREE.MathUtils.lerp(t * 0.4 + i, data.rotation.x, fp);
      mesh.rotation.y = THREE.MathUtils.lerp(t * 0.2 + i, data.rotation.y, fp);
      mesh.rotation.z = THREE.MathUtils.lerp(t * 0.3 + i, data.rotation.z, fp);
    });

    // Rotação dos Meridianos (Spin acelerado sob foco):
    const ringSpeedMult = 1.0 + fp * 2.5;
    if (ring1Ref.current) ring1Ref.current.rotation.x = t * 0.8 * ringSpeedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.y = t * -0.9 * ringSpeedMult;
    if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.75 * ringSpeedMult;

    // Núcleo e Luz reagem ao foco
    if (coreRef.current) {
      const corePulse = (1.0 + Math.sin(t * 4) * 0.03) * (1.0 + fp * 0.05);
      coreRef.current.scale.setScalar(corePulse);
    }

    if (lightRef.current) {
      lightRef.current.intensity = (2.0 + fp * 2.5) * (1.0 + Math.sin(t * 10) * 0.12);
    }
  });

  return (
    <group ref={containerRef}>
      {/* Luz central para destacar a casca de vidro e as órbitas de energia */}
      <pointLight ref={lightRef} color="#b829ff" intensity={2.0} distance={2.5} decay={2} />

      {/* Renderização dos 54 ladrilhos */}
      {tilesData.map((data, i) => (
        <mesh
          key={i}
          ref={(el) => {
            tileRefs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.12, 0.12, 0.04]} />
          <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} />
        </mesh>
      ))}

      {/* Esfera Central Escura */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.11, 32, 32]} />
        <meshStandardMaterial color="#1a0033" roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Meridianos / Órbitas de Luz de Energia */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.15, 0.007, 8, 48]} />
        <meshBasicMaterial color="#d899ff" transparent opacity={0.8} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.152, 0.007, 8, 48]} />
        <meshBasicMaterial color="#d899ff" transparent opacity={0.8} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.154, 0.007, 8, 48]} />
        <meshBasicMaterial color="#d899ff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
