import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SPACING = 2.5;
const RANGE_X = 25;
const RANGE_Y = 15;
const Z_DEPTH = -15;
const REPULSION_RADIUS = 1.5;

export function RepulsionGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { baseX, baseY, currX, currY, count } = useMemo(() => {
    const cols = Math.floor(RANGE_X * 2 / SPACING) + 1;
    const rows = Math.floor(RANGE_Y * 2 / SPACING) + 1;
    const total = cols * rows;
    const bx = new Float32Array(total);
    const by = new Float32Array(total);
    const cx = new Float32Array(total);
    const cy = new Float32Array(total);
    let idx = 0;
    for (let j = -RANGE_Y; j <= RANGE_Y; j += SPACING) {
      for (let i = -RANGE_X; i <= RANGE_X; i += SPACING) {
        bx[idx] = i;
        by[idx] = j;
        cx[idx] = i;
        cy[idx] = j;
        idx++;
      }
    }
    return { baseX: bx, baseY: by, currX: cx, currY: cy, count: total };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const camera = state.camera;
    const mouse = state.pointer;

    vec.set(mouse.x, mouse.y, 0.5);
    vec.unproject(camera);
    dir.copy(vec).sub(camera.position).normalize();
    const dist = (Z_DEPTH - camera.position.z) / dir.z;
    mouseWorld.set(
      camera.position.x + dir.x * dist,
      camera.position.y + dir.y * dist,
      Z_DEPTH,
    );

    const radiusSq = REPULSION_RADIUS * REPULSION_RADIUS;

    for (let i = 0; i < count; i++) {
      const cx = currX[i];
      const cy = currY[i];
      const dx = cx - mouseWorld.x;
      const dy = cy - mouseWorld.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < radiusSq) {
        const d = Math.sqrt(distSq);
        const force = (REPULSION_RADIUS - d) / REPULSION_RADIUS;
        currX[i] = cx + (dx / d) * force;
        currY[i] = cy + (dy / d) * force;
      } else {
        currX[i] += (baseX[i] - cx) * 0.03;
        currY[i] += (baseY[i] - cy) * 0.03;
      }

      point.set(currX[i], currY[i], Z_DEPTH);
      dummy.position.copy(point);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <circleGeometry args={[0.015, 16]} />
      <meshBasicMaterial color="#333333" transparent opacity={0.15} depthWrite={false} />
    </instancedMesh>
  );
}
