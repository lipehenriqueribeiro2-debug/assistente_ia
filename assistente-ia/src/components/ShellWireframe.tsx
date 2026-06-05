import { useRef, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';

export const SHELL_RADIUS = 1.305;
export const SHELL_DETAIL = 2;

// Lógica determinista de ocultamento para criar as aberturas (vazios) na casca geodésica.
// Compartilhada com ShellPanels.tsx para manter o alinhamento perfeito dos buracos.
export const isVertexActive = (v: THREE.Vector3) => {
  const n = v.clone().normalize();
  const hash = Math.abs(Math.sin(n.x * 12.9898 + n.y * 78.233 + n.z * 437.585) * 43758.5453) % 1;
  return hash > 0.48; // Oculta ~48% dos painéis para revelar o núcleo interno
};

// Calcula a distância média entre vizinhos mais próximos para compatibilidade de layout
export function getAverageNeighborDistance(radius: number, detail: number): number {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const uniqueVerts: THREE.Vector3[] = [];
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    if (!uniqueVerts.some(e => e.distanceTo(v) < 0.001)) {
      uniqueVerts.push(v);
    }
  }
  if (uniqueVerts.length < 2) return 0;

  let sumMinDist = 0;
  for (let i = 0; i < uniqueVerts.length; i++) {
    let minDist = Infinity;
    const p1 = uniqueVerts[i];
    for (let j = 0; j < uniqueVerts.length; j++) {
      if (i === j) continue;
      const dist = p1.distanceTo(uniqueVerts[j]);
      if (dist < minDist) {
        minDist = dist;
      }
    }
    sumMinDist += minDist;
  }
  geo.dispose();
  return sumMinDist / uniqueVerts.length;
}

export const SHELL_D = getAverageNeighborDistance(SHELL_RADIUS, SHELL_DETAIL);
export const SHELL_R_OUTER = (SHELL_D / Math.sqrt(3)) - 0.015; // Folga de 0.015 para criar fendas vazadas entre as arestas
export const SHELL_R_INNER = SHELL_R_OUTER - 0.035; // Largura elegante da moldura de prata

// Cria o shape do hexágono com furo concêntrico rotacionado em 30 graus (PI / 6)
export function createHexagonFrameShape(outerRadius: number, innerRadius: number): THREE.Shape {
  const shape = new THREE.Shape();
  // Caminho externo (sentido horário) - Rotacionado em 30 graus
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const x = Math.cos(angle) * outerRadius;
    const y = Math.sin(angle) * outerRadius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  // Caminho interno (sentido anti-horário) - Rotacionado em 30 graus
  const hole = new THREE.Path();
  for (let i = 5; i >= 0; i--) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const x = Math.cos(angle) * innerRadius;
    const y = Math.sin(angle) * innerRadius;
    if (i === 5) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

export function ShellWireframe() {
  const ref = useRef<THREE.InstancedMesh>(null);

  const frameGeo = useMemo(() => {
    const shape = createHexagonFrameShape(SHELL_R_OUTER, SHELL_R_INNER);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    });
    geo.translate(0, 0, -0.02); // Centraliza no plano de extrusão
    geo.computeVertexNormals();
    return geo;
  }, []);

  const verts = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(SHELL_RADIUS, SHELL_DETAIL);
    const pos = geo.attributes.position;
    const result: THREE.Vector3[] = [];
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      // Filtra duplicados e aplica o mesmo algoritmo de ocultamento determinista
      if (!result.some(e => e.distanceTo(v) < 0.001) && isVertexActive(v)) {
        result.push(v);
      }
    }
    geo.dispose();
    return result;
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const dObj = new THREE.Object3D();
    let idx = 0;

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

      dObj.position.copy(vert);
      dObj.quaternion.copy(quaternion);
      dObj.scale.setScalar(1);
      dObj.updateMatrix();
      ref.current.setMatrixAt(idx, dObj.matrix);
      idx++;
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [verts]);

  return (
    <instancedMesh ref={ref} args={[frameGeo, null as any, verts.length]} castShadow receiveShadow={false}>
      <meshStandardMaterial
        color="#d1d5db" // Prata Chrome
        metalness={0.95}
        roughness={0.15}
        transparent
        opacity={0.95}
      />
    </instancedMesh>
  );
}
