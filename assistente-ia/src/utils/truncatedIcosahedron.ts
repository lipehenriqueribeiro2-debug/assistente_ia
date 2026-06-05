import * as THREE from 'three';

export interface FaceData {
  vertexIndices: number[];
  positions: THREE.Vector3[];
  center: THREE.Vector3;
  normal: THREE.Vector3;
  isHexagon: boolean;
}

export interface TruncatedIcosahedronData {
  vertices: THREE.Vector3[];
  edges: [number, number][];
  faces: FaceData[];
}

function generateVertices(radius: number): THREE.Vector3[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: number[][] = [];

  for (const [a, b, c] of [[0, 1, 3 * phi], [1, 2 + phi, 2 * phi], [phi, 2, 2 * phi + 1]]) {
    const sValues = a === 0 ? [1] : [1, -1];
    for (const sa of sValues) {
      for (const sb of [1, -1]) {
        for (const sc of [1, -1]) {
          const v0 = sa * a, v1 = sb * b, v2 = sc * c;
          raw.push([v0, v1, v2], [v1, v2, v0], [v2, v0, v1]);
        }
      }
    }
  }

  const seen = new Set<string>();
  const verts: THREE.Vector3[] = [];
  for (const [x, y, z] of raw) {
    const key = `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;
    if (!seen.has(key)) {
      seen.add(key);
      verts.push(new THREE.Vector3(x, y, z).normalize().multiplyScalar(radius));
    }
  }

  return verts;
}

function computeEdges(vertices: THREE.Vector3[]): [number, number][] {
  let minDist = Infinity;
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      minDist = Math.min(minDist, vertices[i].distanceTo(vertices[j]));

  const eps = 0.001;
  const edges: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      if (Math.abs(vertices[i].distanceTo(vertices[j]) - minDist) < eps)
        edges.push([i, j]);

  return edges;
}

function computeFaces(vertices: THREE.Vector3[], edges: [number, number][]): FaceData[] {
  const n = vertices.length;

  const adj = new Map<number, number[]>();
  for (let i = 0; i < n; i++) adj.set(i, []);
  for (const [i, j] of edges) {
    adj.get(i)!.push(j);
    adj.get(j)!.push(i);
  }

  for (let i = 0; i < n; i++) {
    const p = vertices[i];
    const normal = p.clone().normalize();
    const ref = new THREE.Vector3();
    if (Math.abs(normal.x) < 0.9) ref.crossVectors(normal, new THREE.Vector3(1, 0, 0));
    else ref.crossVectors(normal, new THREE.Vector3(0, 1, 0));
    ref.normalize();
    const ref2 = new THREE.Vector3().crossVectors(ref, normal).normalize();

    adj.get(i)!.sort((ai, bi) => {
      const a = new THREE.Vector3().copy(vertices[ai]).sub(p);
      const b = new THREE.Vector3().copy(vertices[bi]).sub(p);
      return Math.atan2(a.dot(ref2), a.dot(ref)) - Math.atan2(b.dot(ref2), b.dot(ref));
    });
  }

  const faceVerticesList: number[][] = [];
  const visited = new Set<string>();

  for (let start = 0; start < n; start++) {
    const nbrs = adj.get(start)!;
    for (const next of nbrs) {
      const key = `${start},${next}`;
      if (visited.has(key)) continue;

      const faceVerts: number[] = [start];
      let from = start, to = next;

      while (true) {
        faceVerts.push(to);
        visited.add(`${from},${to}`);

        const toNbrs = adj.get(to)!;
        const idx = toNbrs.indexOf(from);
        const nextIdx = (idx - 1 + toNbrs.length) % toNbrs.length;
        const nextTo = toNbrs[nextIdx];

        from = to;
        to = nextTo;

        if (to === start) break;
        if (faceVerts.length > 60) break;
      }

      if (faceVerts.length >= 3) {
        faceVerticesList.push(faceVerts);
      }
    }
  }

  const canonicalMap = new Map<string, number[]>();
  for (const fv of faceVerticesList) {
    const key = [...fv].sort((a, b) => a - b).join(',');
    if (!canonicalMap.has(key)) {
      canonicalMap.set(key, fv);
    }
  }

  return [...canonicalMap.values()].map(fv => {
    const positions = fv.map(i => vertices[i].clone());
    const center = new THREE.Vector3();
    for (const p of positions) center.add(p);
    center.divideScalar(positions.length);
    return {
      vertexIndices: fv,
      positions,
      center,
      normal: center.clone().normalize(),
      isHexagon: fv.length === 6,
    };
  });
}

export function truncatedIcosahedron(radius: number): TruncatedIcosahedronData {
  const vertices = generateVertices(radius);
  const edges = computeEdges(vertices);
  const faces = computeFaces(vertices, edges);
  return { vertices, edges, faces };
}
