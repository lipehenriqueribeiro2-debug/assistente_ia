import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GLASS_MATERIAL_PROS = {
  color: '#0066ff', // Azul Cobalto
  transmission: 0.9,
  roughness: 0.05,
  metalness: 0.1,
  ior: 1.52,
  thickness: 0.4,
  clearcoat: 1.0,
  transparent: true,
  opacity: 0.85,
  side: THREE.DoubleSide,
} as const;

// Função geométrica para criar exatamente um prisma tridimensional para uma das 20 faces originais do icosaedro (20 lados)
function createSingleFaceGeometry(
  v0: THREE.Vector3,
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  radius: number,
  gapFactor: number,
  thicknessFactor: number
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  
  // Baricentro da face triangular original
  const G = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);

  // Encolhe os vértices da face externa para criar a fresta (gap) entre as 20 faces
  const Ae = new THREE.Vector3().addVectors(G, new THREE.Vector3().subVectors(v0, G).multiplyScalar(gapFactor));
  const Be = new THREE.Vector3().addVectors(G, new THREE.Vector3().subVectors(v1, G).multiplyScalar(gapFactor));
  const Ce = new THREE.Vector3().addVectors(G, new THREE.Vector3().subVectors(v2, G).multiplyScalar(gapFactor));

  // Vértices internos mais profundos correspondentes para a espessura da face
  const Ai = Ae.clone().normalize().multiplyScalar(radius * thicknessFactor);
  const Bi = Be.clone().normalize().multiplyScalar(radius * thicknessFactor);
  const Ci = Ce.clone().normalize().multiplyScalar(radius * thicknessFactor);

  const positions: number[] = [];

  // Face Externa (Frontal) - anti-horário
  positions.push(...Ae.toArray(), ...Be.toArray(), ...Ce.toArray());
  
  // Face Interna (Traseira) - anti-horário olhando de dentro
  positions.push(...Ai.toArray(), ...Ci.toArray(), ...Bi.toArray());

  // Lateral 1 (Ae -> Be -> Bi -> Ai)
  positions.push(...Ae.toArray(), ...Ai.toArray(), ...Bi.toArray());
  positions.push(...Ae.toArray(), ...Bi.toArray(), ...Be.toArray());

  // Lateral 2 (Be -> Ce -> Ci -> Bi)
  positions.push(...Be.toArray(), ...Bi.toArray(), ...Ci.toArray());
  positions.push(...Be.toArray(), ...Ci.toArray(), ...Ce.toArray());

  // Lateral 3 (Ce -> Ae -> Ai -> Ci)
  positions.push(...Ce.toArray(), ...Ci.toArray(), ...Ai.toArray());
  positions.push(...Ce.toArray(), ...Ai.toArray(), ...Ae.toArray());

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

export function IcosahedronAgent({ isFocused }: { isFocused: boolean }) {
  const containerRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const focusProgress = useRef(0);
  const time = useRef(0);

  const radius = 0.35;
  const gapFactor = 0.88; // Cria fresta uniforme entre as 20 faces
  const thicknessFactor = 0.90; // Espessura do vidro

  // Cálculo estático dos vértices e das 20 faces do icosaedro regular de base
  const { panelsData, normalDirections } = useMemo(() => {
    const t = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      new THREE.Vector3(-1, t, 0).normalize().multiplyScalar(radius),
      new THREE.Vector3(1, t, 0).normalize().multiplyScalar(radius),
      new THREE.Vector3(-1, -t, 0).normalize().multiplyScalar(radius),
      new THREE.Vector3(1, -t, 0).normalize().multiplyScalar(radius),
      new THREE.Vector3(0, -1, t).normalize().multiplyScalar(radius),
      new THREE.Vector3(0, 1, t).normalize().multiplyScalar(radius),
      new THREE.Vector3(0, -1, -t).normalize().multiplyScalar(radius),
      new THREE.Vector3(0, 1, -t).normalize().multiplyScalar(radius),
      new THREE.Vector3(t, 0, -1).normalize().multiplyScalar(radius),
      new THREE.Vector3(t, 0, 1).normalize().multiplyScalar(radius),
      new THREE.Vector3(-t, 0, -1).normalize().multiplyScalar(radius),
      new THREE.Vector3(-t, 0, 1).normalize().multiplyScalar(radius),
    ];

    const faceIndices = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    // Gerar geometrias individuais de 1 prisma por face (exatamente 20 faces)
    const geoms = faceIndices.map(([i0, i1, i2]) => {
      return createSingleFaceGeometry(
        baseVertices[i0],
        baseVertices[i1],
        baseVertices[i2],
        radius,
        gapFactor,
        thicknessFactor
      );
    });

    const normals = faceIndices.map(([i0, i1, i2]) => {
      const v0 = baseVertices[i0];
      const v1 = baseVertices[i1];
      const v2 = baseVertices[i2];
      return new THREE.Vector3()
        .add(v0)
        .add(v1)
        .add(v2)
        .normalize();
    });

    return { panelsData: geoms, normalDirections: normals };
  }, [radius]);

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

    // Rotação Dinâmica Ativa (Diferente sob Foco e Sem Travar):
    // Fora de foco: rotação tridimensional contínua em X e Y.
    // Focado: gira suavemente apenas em Y com uma inclinação senoidal constante e fluida em X (dinamismo sem travar)
    const rotSpeedY = THREE.MathUtils.lerp(0.2, 0.35, fp);
    const currentRotY = t * rotSpeedY;
    const currentRotX = THREE.MathUtils.lerp(t * 0.12, Math.sin(t * 1.5) * 0.08, fp);

    if (containerRef.current) {
      containerRef.current.rotation.x = currentRotX;
      containerRef.current.rotation.y = currentRotY;
    }

    // Animação das 20 Faces (Snap Magnético e Flutuação Radial):
    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;

      const normal = normalDirections[i];
      const chaosDist = Math.sin(t * 1.5 + i * 0.7) * 0.08 + 0.05;
      
      // Encaixa as faces de vidro cobalto na casca de raio original sob foco
      const currentDist = THREE.MathUtils.lerp(chaosDist, 0, fp);
      
      mesh.position.copy(normal).multiplyScalar(currentDist);
    });

    // Wireframe interno (icosaedro regular simples correspondente a 20 faces)
    if (wireframeRef.current) {
      const wireframeMat = wireframeRef.current.material as THREE.LineBasicMaterial;
      if (wireframeMat) {
        wireframeMat.opacity = 0.3 + fp * 0.6;
      }
      
      const wScale = 0.98 + Math.sin(t * 3) * 0.01 * (1 - fp);
      wireframeRef.current.scale.setScalar(wScale);
    }

    // Núcleo de Plasma Central pulsa e brilha sob foco
    if (coreRef.current) {
      coreRef.current.rotation.z = t * -0.4;
      const corePulse = (0.9 + Math.sin(t * 5) * 0.04) * (1.0 + fp * 0.2);
      coreRef.current.scale.setScalar(corePulse);

      const coreMat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (coreMat) {
        coreMat.emissiveIntensity = 1.2 + fp * 2.3;
      }
    }

    // Brilho da luz central se intensifica com o foco e pulsa
    if (lightRef.current) {
      lightRef.current.intensity = (2.0 + fp * 3.0) * (1.0 + Math.sin(t * 10) * 0.15);
    }
  });

  return (
    <group ref={containerRef}>
      {/* Luz central que brilha através dos gaps */}
      <pointLight ref={lightRef} color="#0099ff" intensity={2.0} distance={2.5} decay={2} />

      {/* Renderização dos 20 painéis geodésicos modulares (exatamente 20 faces) */}
      {panelsData.map((geometry, index) => (
        <mesh
          key={index}
          ref={(m) => {
            panelRefs.current[index] = m;
          }}
          geometry={geometry}
        >
          <meshPhysicalMaterial {...GLASS_MATERIAL_PROS} />
        </mesh>
      ))}

      {/* Wireframe interno (icosaedro simples de 20 faces) */}
      <lineSegments ref={wireframeRef}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(radius * 0.99, 0)]} />
        <lineBasicMaterial color="#33ccff" linewidth={1.5} transparent opacity={0.5} />
      </lineSegments>

      {/* Núcleo de Plasma Azul Central */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.08, 1]} />
        <meshStandardMaterial
          color="#002288"
          emissive="#0077ff"
          emissiveIntensity={1.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
