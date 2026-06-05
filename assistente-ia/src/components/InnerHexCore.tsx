import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Cores dos Agentes ───────────────────────────────────────────────────────
const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727', // Crimson
  est: '#0066ff', // Cobalto
  rpg: '#b829ff', // Magenta
  hw: '#25ced1',  // Ciano
  pow: '#ffaa00', // Ouro
};

// ─── Constantes do Núcleo Interno ────────────────────────────────────────────
const CORE_RADIUS = 0.8;
const EDGE_TUBE_RADIUS = 0.012; // Raio do tubo de cada aresta

// Calcula o nível de detalhe dinamicamente baseado no raio da esfera.
// Para raio 0.8, resulta em detail=2 → 80 faces → ~30 hexágonos + 12 pentágonos (tamanho médio).
// Se o raio mudar, a quantidade de hexágonos se ajusta automaticamente.
const CORE_DETAIL = Math.max(1, Math.round(CORE_RADIUS * 2.5));

// ─── Funções Utilitárias Locais ──────────────────────────────────────────────

/**
 * Constrói as arestas da malha dual (Poliedro de Goldberg) de um icosaedro subdividido.
 *
 * A malha dual de uma triangulação geodésica é composta por hexágonos e 12 pentágonos
 * que ladrilham a esfera perfeitamente — todas as arestas se conectam base-com-base
 * sem fendas, sobreposições ou desalinhamentos.
 *
 * Algoritmo:
 *   1. Extraímos os vértices e faces triangulares únicos do icosaedro subdividido.
 *   2. Projetamos o centroide de cada face triangular na superfície da esfera.
 *   3. Para cada aresta compartilhada entre duas faces, criamos uma aresta dual
 *      conectando os centroides projetados dessas faces.
 *   4. Essas arestas duais, quando unidas, formam os polígonos (hex/pent) perfeitamente.
 */
function buildDualEdges(radius: number, detail: number) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;

  // 1. Desduplicar vértices (IcosahedronGeometry pode ter vértices com coords repetidas)
  const vertMap = new Map<string, number>();
  const uniqueVerts: THREE.Vector3[] = [];
  const remap: number[] = [];

  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const key = `${v.x.toFixed(5)},${v.y.toFixed(5)},${v.z.toFixed(5)}`;
    if (!vertMap.has(key)) {
      vertMap.set(key, uniqueVerts.length);
      uniqueVerts.push(v);
    }
    remap.push(vertMap.get(key)!);
  }

  // 2. Montar lista de faces triangulares (suporta geometrias indexadas e não-indexadas)
  const faces: [number, number, number][] = [];
  const idx = geo.index;
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      faces.push([
        remap[idx.getX(i)],
        remap[idx.getX(i + 1)],
        remap[idx.getX(i + 2)],
      ]);
    }
  } else {
    // Geometria não-indexada: cada 3 vértices consecutivos formam uma face
    for (let i = 0; i < pos.count; i += 3) {
      faces.push([remap[i], remap[i + 1], remap[i + 2]]);
    }
  }

  // 3. Centroides de cada face projetados na superfície esférica
  const centroids = faces.map(([a, b, c]) =>
    new THREE.Vector3()
      .add(uniqueVerts[a])
      .add(uniqueVerts[b])
      .add(uniqueVerts[c])
      .divideScalar(3)
      .normalize()
      .multiplyScalar(radius),
  );

  // 4. Mapear arestas originais → faces adjacentes
  const edgeKey = (a: number, b: number) =>
    a < b ? `${a}-${b}` : `${b}-${a}`;
  const edgeFaces = new Map<string, number[]>();

  for (let fi = 0; fi < faces.length; fi++) {
    const [a, b, c] = faces[fi];
    for (const [v1, v2] of [[a, b], [b, c], [c, a]]) {
      const key = edgeKey(v1, v2);
      if (!edgeFaces.has(key)) edgeFaces.set(key, []);
      edgeFaces.get(key)!.push(fi);
    }
  }

  // 5. Arestas duais: conectam centroides de faces que compartilham uma aresta
  const edges: [THREE.Vector3, THREE.Vector3][] = [];
  for (const faceIds of edgeFaces.values()) {
    if (faceIds.length === 2) {
      edges.push([centroids[faceIds[0]], centroids[faceIds[1]]]);
    }
  }

  geo.dispose();
  return edges;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface InnerHexCoreProps {
  focusedAgent: string | null;
  isListening: boolean;
  audioVolumeRef: React.MutableRefObject<number>;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function InnerHexCore({ focusedAgent, isListening, audioVolumeRef }: InnerHexCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const edgesRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Refs para as faces dos ladrilhos e materiais correspondentes
  const hexTilesRef = useRef<THREE.InstancedMesh>(null);
  const pentTilesRef = useRef<THREE.InstancedMesh>(null);
  const hexMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const pentMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const targetColor = useMemo(() => new THREE.Color('#f8fafc'), []);

  // ── Esfera central lisa (metálica escura, perfeitamente redonda) ──
  const sphereGeo = useMemo(
    () => new THREE.SphereGeometry(CORE_RADIUS - 0.01, 64, 64),
    [],
  );

  // ── Arestas duais do poliedro de Goldberg ──
  const dualEdges = useMemo(
    () => buildDualEdges(CORE_RADIUS, CORE_DETAIL),
    [],
  );

  // ── Transforma e alinha estaticamente os parâmetros de cada aresta ──
  const edgeTransforms = useMemo(() => {
    const list: {
      mid: THREE.Vector3;
      quaternion: THREE.Quaternion;
      length: number;
    }[] = [];
    const zAxis = new THREE.Vector3(0, 0, 1);

    for (let i = 0; i < dualEdges.length; i++) {
      const [a, b] = dualEdges[i];

      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(CORE_RADIUS);

      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      dir.normalize();

      const quat = new THREE.Quaternion().setFromUnitVectors(zAxis, dir);

      list.push({ mid, quaternion: quat, length: len });
    }
    return list;
  }, [dualEdges]);

  // ── Topologia das Células (Vértices e Orientação de Hexágonos e Pentágonos) ──
  const coreTopology = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(CORE_RADIUS, CORE_DETAIL);
    const pos = geo.attributes.position;

    // Desduplica vértices da malha original
    const vertMap = new Map<string, number>();
    const uniqueVerts: THREE.Vector3[] = [];
    const remap: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      const key = `${v.x.toFixed(5)},${v.y.toFixed(5)},${v.z.toFixed(5)}`;
      if (!vertMap.has(key)) {
        vertMap.set(key, uniqueVerts.length);
        uniqueVerts.push(v);
      }
      remap.push(vertMap.get(key)!);
    }

    // Coleta faces e vizinhos para calcular valência
    const neighbors = new Map<number, Set<number>>();
    const addNeighbor = (v1: number, v2: number) => {
      if (!neighbors.has(v1)) neighbors.set(v1, new Set());
      neighbors.get(v1)!.add(v2);
    };

    const idx = geo.index;
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = remap[idx.getX(i)];
        const b = remap[idx.getX(i + 1)];
        const c = remap[idx.getX(i + 2)];
        addNeighbor(a, b); addNeighbor(b, a);
        addNeighbor(b, c); addNeighbor(c, b);
        addNeighbor(c, a); addNeighbor(a, c);
      }
    } else {
      for (let i = 0; i < pos.count; i += 3) {
        const a = remap[i];
        const b = remap[i + 1];
        const c = remap[i + 2];
        addNeighbor(a, b); addNeighbor(b, a);
        addNeighbor(b, c); addNeighbor(c, b);
        addNeighbor(c, a); addNeighbor(a, c);
      }
    }

    geo.dispose();

    const hexList: { pos: THREE.Vector3; quat: THREE.Quaternion }[] = [];
    const pentList: { pos: THREE.Vector3; quat: THREE.Quaternion }[] = [];
    const yAxis = new THREE.Vector3(0, 1, 0); // O cilindro no Three.js tem o eixo de altura apontando em Y

    for (let i = 0; i < uniqueVerts.length; i++) {
      const v = uniqueVerts[i];
      const valency = neighbors.get(i)?.size || 6;

      const normal = v.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(yAxis, normal);

      if (valency === 5) {
        pentList.push({ pos: v, quat });
      } else {
        hexList.push({ pos: v, quat });
      }
    }

    return { hexList, pentList };
  }, []);

  // ── Geometrias de cilindro de 6 e 5 lados ──
  const hexGeo = useMemo(() => {
    // Geometria de hexágono: cilindro de 6 lados chanfrado
    return new THREE.CylinderGeometry(0.092, 0.078, 0.035, 6);
  }, []);

  const pentGeo = useMemo(() => {
    // Geometria de pentágono: cilindro de 5 lados chanfrado
    return new THREE.CylinderGeometry(0.084, 0.070, 0.035, 5);
  }, []);

  // ── Geometria de tubo para cada aresta (cilindro fino alinhado ao eixo Z) ──
  const tubeGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(EDGE_TUBE_RADIUS, EDGE_TUBE_RADIUS, 1, 8);
    g.rotateX(Math.PI / 2); // Alinha ao eixo Z para facilitar a orientação
    return g;
  }, []);

  // ── Animação e vibração dinâmica baseada no volume do áudio (eixo Z local/radial) ──
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Rotação contrária sutil para criar profundidade
    groupRef.current.rotation.y -= delta * 0.04;
    groupRef.current.rotation.x -= delta * 0.02;

    const vol = (isListening && audioVolumeRef) ? audioVolumeRef.current : 0;

    // 1. Atualiza a posição radial e espessura de cada aresta com base no volume (vibração)
    if (edgesRef.current) {
      const dObj = new THREE.Object3D();
      for (let i = 0; i < edgeTransforms.length; i++) {
        const tr = edgeTransforms[i];

        // Vibração ondulada orgânica e assíncrona baseada no índice e alta frequência
        const pulse = Math.sin(t * 22.0 + i * 0.3) * 0.5 + 0.5;
        const disp = vol * 0.32 * (0.3 + 0.7 * pulse);

        // Desloca radialmente para fora (eixo Z local das arestas na esfera)
        const dispPos = tr.mid.clone().normalize().multiplyScalar(CORE_RADIUS + disp);

        dObj.position.copy(dispPos);
        dObj.quaternion.copy(tr.quaternion);

        // A espessura do tubo também expande fisicamente com a fala
        const thicknessScale = 1.0 + vol * 1.5;
        dObj.scale.set(thicknessScale, thicknessScale, tr.length);

        dObj.updateMatrix();
        edgesRef.current.setMatrixAt(i, dObj.matrix);
      }
      edgesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Atualiza a posição radial de cada ladrilho hexagonal no eixo Z local (direção radial) com base no volume (vibração)
    if (hexTilesRef.current) {
      const dObj = new THREE.Object3D();
      for (let i = 0; i < coreTopology.hexList.length; i++) {
        const item = coreTopology.hexList[i];

        // Ondulação e ruído orgânico
        const wave = Math.sin(t * 18.0 + i * 0.25) * 0.5 + 0.5;
        const disp = vol * 0.28 * (0.4 + 0.6 * wave) + (focusedAgent ? 0.015 * Math.sin(t * 4 + i * 0.1) : 0.003 * Math.sin(t * 2 + i * 0.2));

        const dispPos = item.pos.clone().normalize().multiplyScalar(CORE_RADIUS + disp);

        dObj.position.copy(dispPos);
        dObj.quaternion.copy(item.quat);
        
        // Efeito físico de contração de volume ao esticar
        const scaleY = 1.0 + vol * 0.4;
        dObj.scale.set(1.0, scaleY, 1.0);

        dObj.updateMatrix();
        hexTilesRef.current.setMatrixAt(i, dObj.matrix);
      }
      hexTilesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Atualiza a posição radial de cada ladrilho pentagonal no eixo Z local com base no volume (vibração)
    if (pentTilesRef.current) {
      const dObj = new THREE.Object3D();
      for (let i = 0; i < coreTopology.pentList.length; i++) {
        const item = coreTopology.pentList[i];

        // Ondulação e ruído orgânico
        const wave = Math.sin(t * 18.0 + (i + 40) * 0.25) * 0.5 + 0.5;
        const disp = vol * 0.28 * (0.4 + 0.6 * wave) + (focusedAgent ? 0.015 * Math.sin(t * 4 + i * 0.1) : 0.003 * Math.sin(t * 2 + i * 0.2));

        const dispPos = item.pos.clone().normalize().multiplyScalar(CORE_RADIUS + disp);

        dObj.position.copy(dispPos);
        dObj.quaternion.copy(item.quat);

        const scaleY = 1.0 + vol * 0.4;
        dObj.scale.set(1.0, scaleY, 1.0);

        dObj.updateMatrix();
        pentTilesRef.current.setMatrixAt(i, dObj.matrix);
      }
      pentTilesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Transição suave de cor e intensidade emissiva pulsante das arestas hexagonais
    if (matRef.current) {
      const hex = focusedAgent ? AGENT_COLORS[focusedAgent] : '#f8fafc';
      targetColor.set(hex);
      matRef.current.color.lerp(targetColor, 0.08);
      
      const emissiveIntensity = 0.6 + vol * 2.0;
      matRef.current.emissive.copy(matRef.current.color).multiplyScalar(emissiveIntensity);
    }

    // 5. Transição suave de cor e luminescência interna dos blocos/ladrilhos das faces
    const updateTileMaterial = (mat: THREE.MeshPhysicalMaterial) => {
      const hex = focusedAgent ? AGENT_COLORS[focusedAgent] : '#1e293b';
      targetColor.set(hex);
      mat.color.lerp(targetColor, 0.08);

      const currentEmissive = new THREE.Color(hex).multiplyScalar(vol * 2.5 + 0.05);
      mat.emissive.lerp(currentEmissive, 0.1);
    };

    if (hexMatRef.current) updateTileMaterial(hexMatRef.current);
    if (pentMatRef.current) updateTileMaterial(pentMatRef.current);
  });

  return (
    <group ref={groupRef}>
      {/* Esfera central lisa e reflexiva */}
      <mesh geometry={sphereGeo}>
        <meshStandardMaterial
          color="#080808"
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Arestas hexagonais do poliedro de Goldberg (perfeitamente conectadas) */}
      <instancedMesh
        ref={edgesRef}
        args={[tubeGeo, null as any, dualEdges.length]}
        castShadow
        receiveShadow={false}
      >
        <meshStandardMaterial
          ref={matRef}
          color="#f8fafc"
          emissive="#f8fafc"
          emissiveIntensity={1.2}
          transparent
          opacity={0.95}
          roughness={0.1}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Ladrilhos hexagonais (faces do poliedro) */}
      <instancedMesh
        ref={hexTilesRef}
        args={[hexGeo, null as any, coreTopology.hexList.length]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          ref={hexMatRef}
          color="#1e293b"
          emissive="#1e293b"
          emissiveIntensity={0.05}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={0.8}
          transmission={0.4}
          thickness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </instancedMesh>

      {/* Ladrilhos pentagonais (faces do poliedro) */}
      <instancedMesh
        ref={pentTilesRef}
        args={[pentGeo, null as any, coreTopology.pentList.length]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          ref={pentMatRef}
          color="#1e293b"
          emissive="#1e293b"
          emissiveIntensity={0.05}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={0.8}
          transmission={0.4}
          thickness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </instancedMesh>
    </group>
  );
}
