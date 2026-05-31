import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_EDGE = 4 / Math.sqrt(10 + 2 * Math.sqrt(5));
const INSTANCE_COUNT = 60;

function buildTruncatedIcosahedron(radius: number): THREE.BufferGeometry {
  const icoVerts: THREE.Vector3[] = [
    [0, 1, PHI], [0, 1, -PHI], [0, -1, PHI], [0, -1, -PHI],
    [1, PHI, 0], [1, -PHI, 0], [-1, PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, 1], [-PHI, 0, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(radius));

  const targetEdge = radius * ICO_EDGE;
  const icoEdges: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      if (Math.abs(icoVerts[i].distanceTo(icoVerts[j]) - targetEdge) < 0.01) {
        icoEdges.push([i, j]);
      }
    }
  }

  const vertEdges: number[][] = Array.from({ length: 12 }, () => []);
  for (let e = 0; e < icoEdges.length; e++) {
    const [i, j] = icoEdges[e];
    vertEdges[i].push(e);
    vertEdges[j].push(e);
  }

  const icoFaces: [number, number, number][] = [];
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      const ij = icoEdges.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
      if (!ij) continue;
      for (let k = j + 1; k < 12; k++) {
        const jk = icoEdges.some(([a, b]) => (a === j && b === k) || (a === k && b === j));
        const ki = icoEdges.some(([a, b]) => (a === k && b === i) || (a === i && b === k));
        if (ij && jk && ki) icoFaces.push([i, j, k]);
      }
    }
  }

  const truncVerts: THREE.Vector3[] = [];
  for (const [vi, vj] of icoEdges) {
    for (const t of [1 / 3, 2 / 3]) {
      truncVerts.push(
        new THREE.Vector3().lerpVectors(icoVerts[vi], icoVerts[vj], t).normalize().multiplyScalar(radius)
      );
    }
  }

  const faceVerts: number[][] = [];

  for (let v = 0; v < 12; v++) {
    const pent: number[] = [];
    for (const e of vertEdges[v]) {
      const [i, j] = icoEdges[e];
      pent.push(v === i ? 2 * e : 2 * e + 1);
    }
    const dir = icoVerts[v].clone().normalize();
    const up = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const localUp = new THREE.Vector3().crossVectors(right, dir).normalize();
    pent.sort((a, b) => {
      const pa = truncVerts[a], pb = truncVerts[b];
      return Math.atan2(pa.dot(right), pa.dot(localUp)) - Math.atan2(pb.dot(right), pb.dot(localUp));
    });
    faceVerts.push(pent);
  }

  function edgeIdx(a: number, b: number): number {
    return icoEdges.findIndex(([i, j]) => (i === a && j === b) || (i === b && j === a));
  }

  function nearVert(eIdx: number, v: number): number {
    const [i, j] = icoEdges[eIdx];
    return v === i ? 2 * eIdx : 2 * eIdx + 1;
  }

  function farVert(eIdx: number, v: number): number {
    const [i, j] = icoEdges[eIdx];
    return v === i ? 2 * eIdx + 1 : 2 * eIdx;
  }

  for (const [a, b, c] of icoFaces) {
    const eab = edgeIdx(a, b);
    const ebc = edgeIdx(b, c);
    const eca = edgeIdx(c, a);
    faceVerts.push([
      nearVert(eab, a), farVert(eab, a),
      nearVert(ebc, b), farVert(ebc, b),
      nearVert(eca, c), farVert(eca, c),
    ]);
  }

  const positions: number[] = [];
  const normals: number[] = [];

  for (const face of faceVerts) {
    const n = face.length;
    const center = new THREE.Vector3();
    for (const vi of face) center.add(truncVerts[vi]);
    center.divideScalar(n);
    const normal = center.clone().normalize();

    for (let i = 1; i < n - 1; i++) {
      const v0 = truncVerts[face[0]];
      const v1 = truncVerts[face[i]];
      const v2 = truncVerts[face[i + 1]];
      positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      normals.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return geo;
}

interface InstanceData {
  pos: THREE.Vector3;
}

export function DualCore() {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.InstancedMesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const shellGeo = useMemo(() => buildTruncatedIcosahedron(1.7), []);

  const hexGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.19, 0.19, 0.15, 6);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const instanceData = useMemo<InstanceData[]>(() => {
    const data: InstanceData[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const y = 1 - (i / (INSTANCE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const pos = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
      data.push({ pos });
    }
    return data;
  }, []);

  useEffect(() => {
    const im = innerRef.current;
    if (!im) return;
    const c = new THREE.Color();
    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const { pos } = instanceData[i];
      const gray = 0.25 + Math.abs(pos.y) * 0.3 + (Math.sin(pos.x * 4 + pos.z * 2) * 0.03 + 0.03);
      c.setRGB(gray, gray, gray);
      im.setColorAt(i, c);
    }
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dt = state.clock.getDelta();

    if (innerRef.current) {
      const im = innerRef.current;
      const fast = t * 2.5;
      for (let i = 0; i < INSTANCE_COUNT; i++) {
        const { pos } = instanceData[i];
        const wave =
          Math.sin(pos.x * 2.5 + pos.y * 3.0 + pos.z * 2.0 + fast) * 0.03 +
          Math.sin(pos.x * 1.0 + pos.y * 1.5 + pos.z * 1.2 - fast * 1.5) * 0.02;

        const radius = 0.85 + wave;

        dummy.position.set(pos.x * radius, pos.y * radius, pos.z * radius);
        dummy.lookAt(0, 0, 0);
        dummy.rotateX(Math.PI / 2);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      }
      im.instanceMatrix.needsUpdate = true;

      im.rotation.y += dt * 0.15;
      im.rotation.z += dt * 0.03;
    }

    if (outerRef.current) {
      outerRef.current.rotation.x = t * -0.06;
      outerRef.current.rotation.y = t * -0.1;
      const pulse = 1 + Math.sin(t * 1.2) * 0.03;
      outerRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight position={[0, 0, 0]} intensity={0.5} />
      <instancedMesh ref={innerRef} args={[hexGeo, undefined, INSTANCE_COUNT]}>
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} flatShading />
      </instancedMesh>
      <mesh ref={outerRef} geometry={shellGeo}>
        <meshStandardMaterial color="#D1D1D1" wireframe roughness={0.4} />
      </mesh>
    </group>
  );
}
