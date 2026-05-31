import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const INSTANCE_COUNT = 128;
const BASE_RADIUS = 0.85;

export function AiCore() {
  const innerRef = useRef<THREE.InstancedMesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const hexGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 6);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const instanceData = useMemo(() => {
    const data: { pos: THREE.Vector3 }[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const y = 1 - (i / (INSTANCE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      data.push({ pos: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r) });
    }
    return data;
  }, []);

  useEffect(() => {
    const im = innerRef.current;
    if (!im) return;
    const c = new THREE.Color();
    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const gray = 0.15 + Math.abs(instanceData[i].pos.y) * 0.2;
      c.setRGB(gray, gray, gray);
      im.setColorAt(i, c);
    }
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const fast = t * 2.5;

    if (innerRef.current) {
      const im = innerRef.current;
      for (let i = 0; i < INSTANCE_COUNT; i++) {
        const pos = instanceData[i].pos;
        const wave = Math.sin(pos.x * 2.5 + pos.y * 3.0 + pos.z * 2.0 + fast) * 0.02;
        const radius = BASE_RADIUS + wave;

        dummy.position.set(pos.x * radius, pos.y * radius, pos.z * radius);
        dummy.lookAt(0, 0, 0);
        dummy.rotateX(Math.PI / 2);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
      im.rotation.y += 0.005;
    }

    if (outerRef.current) {
      outerRef.current.rotation.x = t * -0.04;
      outerRef.current.rotation.y = t * -0.07;
    }
  });

  return (
    <group>
      <instancedMesh ref={innerRef} args={[hexGeo, undefined, INSTANCE_COUNT]}>
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} flatShading />
      </instancedMesh>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.25, 2]} />
        <meshBasicMaterial color="#BBBBBB" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
