import { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  isVertexActive,
  SHELL_RADIUS,
  SHELL_DETAIL,
  SHELL_R_INNER
} from './ShellWireframe';
import { AGENT_COLORS } from './OrbitalCarousel';

function createRoundedPolygon(points: THREE.Vector2[], radiusOrRadii: number | number[]): THREE.Shape {
  const shape = new THREE.Shape();
  const len = points.length;
  for (let i = 0; i < len; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % len];
    const p0 = points[(i - 1 + len) % len];
    
    const v01 = new THREE.Vector2().subVectors(p1, p0).normalize();
    const v12 = new THREE.Vector2().subVectors(p2, p1).normalize();
    
    const r = Array.isArray(radiusOrRadii) ? radiusOrRadii[i] : radiusOrRadii;
    const start = new THREE.Vector2().addScaledVector(v01, -r).add(p1);
    const end = new THREE.Vector2().addScaledVector(v12, r).add(p1);
    
    if (i === 0) {
      shape.moveTo(start.x, start.y);
    } else {
      shape.lineTo(start.x, start.y);
    }
    shape.quadraticCurveTo(p1.x, p1.y, end.x, end.y);
  }
  shape.closePath();
  return shape;
}

function createHexagonShape(radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  // Rotacionado em 30 graus (PI / 6) para coincidir com as molduras do wireframe
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export function ShellPanels({ focusedAgent }: { focusedAgent: string | null }) {
  const hexRef = useRef<THREE.InstancedMesh>(null);
  const rhombusRef = useRef<THREE.InstancedMesh>(null);
  const rhombusMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const targetColor = useMemo(() => new THREE.Color('#22d3ee'), []);

  // Raio da base do hexágono para caber perfeitamente na moldura
  const baseRadius = useMemo(() => SHELL_R_INNER - 0.005, []);

  // 1. Geometria da Base Hexagonal
  const hexGeo = useMemo(() => {
    const shape = createHexagonShape(baseRadius);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
    });
    geo.translate(0, 0, -0.015); // Centraliza no eixo Z
    geo.computeVertexNormals();
    return geo;
  }, [baseRadius]);

  // 2. Geometria do Losango com Cantos Arredondados (Simetria Polar e Lados Equiláteros)
  const rhombusGeo = useMemo(() => {
    // R determina o tamanho do losango. Aumentado para baseRadius * 0.84 para beira maior e largura X ampliada
    const R = baseRadius * 0.84;
    const gap = 0.028; // Espaçamento central vazado amplo entre os 3 losangos
    
    // Raio de arredondamento individual por vértice: ampliado em todas as pontas para um visual mais suave e orgânico
    const cornerRadiusY = 0.045; // Eixo Y (pontas interna/externa significativamente mais arredondadas)
    const cornerRadiusLat = 0.016; // Eixo X (pontas laterais / bordas)
    const cornerRadii = [cornerRadiusY, cornerRadiusLat, cornerRadiusY, cornerRadiusLat];

    // Vértices do losango perfeitamente alinhados com as direções radiais dos vértices do hexágono (30, 90 e 150 graus)
    // Aplicamos um fator de estreitamento de 9% (widthFactor = 0.91) para descolar as pontas laterais dos losangos vizinhos
    // A geometria abaixo forma um losango equilátero matematicamente perfeito (lados idênticos de comprimento)
    const widthFactor = 0.91;
    const rhombusPoints = [
      new THREE.Vector2(0, gap), // Ponta interna (direção 90 graus, a exatamente 'gap' do centro)
      new THREE.Vector2(R * 0.866 * widthFactor, R * 0.5), // Ponta lateral direita (raio R com estreitamento)
      new THREE.Vector2(0, R - gap), // Ponta externa (direção 90 graus, raio R - gap)
      new THREE.Vector2(-R * 0.866 * widthFactor, R * 0.5) // Ponta lateral esquerda (raio R com estreitamento)
    ];

    const shape = createRoundedPolygon(rhombusPoints, cornerRadii);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
    });
    geo.translate(0, 0, 0.015); // Desloca ligeiramente para cima no eixo Z (sobrepõe a base do hexágono)
    geo.computeVertexNormals();
    return geo;
  }, [baseRadius]);

  // 3. Vértices ativos correspondentes às mesmas posições de ShellWireframe
  const verts = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(SHELL_RADIUS, SHELL_DETAIL);
    const pos = geo.attributes.position;
    const result: THREE.Vector3[] = [];
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (!result.some(e => e.distanceTo(v) < 0.001) && isVertexActive(v)) {
        result.push(v);
      }
    }
    geo.dispose();
    return result;
  }, []);

  useLayoutEffect(() => {
    if (!hexRef.current || !rhombusRef.current) return;
    const d = new THREE.Object3D();
    let hexIdx = 0;
    let rhomIdx = 0;

    for (const vert of verts) {
      // 1. Encontra o vizinho ativo mais próximo
      let neighbor: THREE.Vector3 | null = null;
      let minDist = Infinity;
      for (const other of verts) {
        if (other === vert) continue;
        const dist = vert.distanceTo(other);
        if (dist < minDist) {
          minDist = dist;
          neighbor = other;
        }
      }

      // 2. Calcula a orientação com torção local baseada no vizinho
      const N = vert.clone().normalize();
      const quaternion = new THREE.Quaternion();
      
      if (neighbor) {
        const toNeighbor = neighbor.clone().sub(vert);
        // Projetamos no plano tangente
        const T = toNeighbor.sub(N.clone().multiplyScalar(toNeighbor.dot(N))).normalize();
        const B = new THREE.Vector3().crossVectors(T, N).normalize();
        const matrix = new THREE.Matrix4().makeBasis(B, T, N);
        quaternion.setFromRotationMatrix(matrix);
      } else {
        const z = new THREE.Vector3(0, 0, 1);
        quaternion.setFromUnitVectors(z, N);
      }

      // 3.1. Posiciona a base do hexágono com torção exata
      d.position.copy(vert);
      d.quaternion.copy(quaternion);
      d.scale.setScalar(1);
      d.updateMatrix();
      hexRef.current.setMatrixAt(hexIdx, d.matrix);
      hexIdx++;

      // 3.2. Posiciona os 3 losangos respeitando a torção básica
      for (let k = 0; k < 3; k++) {
        d.position.copy(vert);
        const qa = new THREE.Quaternion().setFromAxisAngle(N, k * Math.PI * 2 / 3);
        d.quaternion.copy(quaternion).premultiply(qa);
        d.scale.setScalar(1);
        d.updateMatrix();
        rhombusRef.current.setMatrixAt(rhomIdx, d.matrix);
        rhomIdx++;
      }
    }

    hexRef.current.instanceMatrix.needsUpdate = true;
    rhombusRef.current.instanceMatrix.needsUpdate = true;
  }, [verts]);

  useFrame((state, delta) => {
    if (rhombusMatRef.current) {
      const targetHex = focusedAgent ? AGENT_COLORS[focusedAgent] : '#22d3ee';
      targetColor.set(targetHex);
      
      // Transiciona suavemente a cor e a emissividade (glow) dos losangos
      rhombusMatRef.current.color.lerp(targetColor, 0.08);
      rhombusMatRef.current.emissive.copy(rhombusMatRef.current.color).multiplyScalar(0.65);
    }
  });

  return (
    <group>
      {/* 1. Base do Hexágono (Slate escuro metálico) */}
      <instancedMesh ref={hexRef} args={[hexGeo, null as any, verts.length]} castShadow receiveShadow={false}>
        <meshStandardMaterial
          color="#101725" // Slate Escuro
          roughness={0.25}
          metalness={0.8}
        />
      </instancedMesh>

      {/* 2. Três Losangos Encrustados (Emissivo/Reativo ao Agente) */}
      <instancedMesh ref={rhombusRef} args={[rhombusGeo, null as any, verts.length * 3]} castShadow receiveShadow={false}>
        <meshStandardMaterial
          ref={rhombusMatRef}
          color="#22d3ee" // Começa com ciano
          roughness={0.1}
          metalness={0.1}
          emissive="#22d3ee"
          emissiveIntensity={1.2} // Brilho emissivo forte
        />
      </instancedMesh>
    </group>
  );
}

