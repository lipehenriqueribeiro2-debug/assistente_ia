import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InnerHexCore } from './InnerHexCore';
import {
  ShellWireframe,
  getAverageNeighborDistance,
  createHexagonFrameShape
} from './ShellWireframe';
import { ShellPanels } from './ShellPanels';

export function AiCore({
  audioVolumeRef,
  bootState,
  onBootComplete,
  focusedAgent,
  isListening,
}: {
  audioVolumeRef: React.MutableRefObject<number>;
  bootState: 'booting' | 'ready';
  onBootComplete: () => void;
  focusedAgent: string | null;
  isListening: boolean;
}) {
  const coreGroupRef = useRef<THREE.Group>(null);
  const bootMeshRef = useRef<THREE.InstancedMesh>(null);
  const bootMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const shellGroupRef = useRef<THREE.Group>(null);
  const scaleVec = useRef(new THREE.Vector3(1, 1, 1));
  const bootCompleteFired = useRef(false);

  // Parâmetros geométricos do boot
  const BOOT_RADIUS = 1.8;
  const BOOT_DETAIL = 1;

  // Distância do vizinho mais próximo e raios para os hexágonos do boot ficarem adjacentes
  const bootD = useMemo(() => getAverageNeighborDistance(BOOT_RADIUS, BOOT_DETAIL), []);
  const bootROuter = useMemo(() => bootD / Math.sqrt(3), [bootD]);
  const bootRInner = useMemo(() => bootROuter * 0.85, [bootROuter]);

  // Geometria da moldura hexagonal tridimensional para o boot (grossa e visível)
  const bootFrameGeo = useMemo(() => {
    const shape = createHexagonFrameShape(bootROuter, bootRInner);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05, // Profundidade física robusta
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
    });
    geo.translate(0, 0, -0.025); // Centraliza no plano de extrusão
    geo.computeVertexNormals();
    return geo;
  }, [bootROuter, bootRInner]);

  // Vértices da malha de boot para posicionar os hexágonos (sem ocultamento para ficar completa)
  const bootVerts = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(BOOT_RADIUS, BOOT_DETAIL);
    const pos = geo.attributes.position;
    const result: THREE.Vector3[] = [];
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (!result.some(e => e.distanceTo(v) < 0.001)) {
        result.push(v);
      }
    }
    geo.dispose();
    return result;
  }, []);

  // Posiciona inicialmente todas as instâncias do boot com escala 0 (invisíveis)
  useLayoutEffect(() => {
    if (!bootMeshRef.current || bootState !== 'booting') return;
    const dObj = new THREE.Object3D();
    const z = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < bootVerts.length; i++) {
      const vert = bootVerts[i];
      const normal = vert.clone().normalize();
      dObj.position.copy(vert);
      dObj.quaternion.setFromUnitVectors(z, normal);
      dObj.scale.setScalar(0);
      dObj.updateMatrix();
      bootMeshRef.current.setMatrixAt(i, dObj.matrix);
    }
    bootMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [bootVerts, bootState]);

  useFrame((state, delta) => {
    if (!coreGroupRef.current) return;

    coreGroupRef.current.rotation.y += delta * 0.1;
    coreGroupRef.current.rotation.x += delta * 0.05;

    if (bootState === 'booting') {
      const t = state.clock.getElapsedTime();

      // Fase 1: Animação de desenho progressivo (materialização suave dos hexágonos 3D)
      if (t <= 1.5) {
        const drawProgress = Math.min(t / 1.5, 1.0);
        if (bootMeshRef.current) {
          const count = bootVerts.length;
          const visibleCount = Math.floor(drawProgress * count);
          const dObj = new THREE.Object3D();
          const z = new THREE.Vector3(0, 0, 1);
          
          for (let i = 0; i < count; i++) {
            const vert = bootVerts[i];
            const normal = vert.clone().normalize();
            dObj.position.copy(vert);
            dObj.quaternion.setFromUnitVectors(z, normal);
            
            if (i < visibleCount) {
              // Crescimento holográfico individual
              const localProgress = Math.max(0, Math.min(1, (drawProgress * count - i)));
              dObj.scale.setScalar(localProgress);
            } else {
              dObj.scale.setScalar(0);
            }
            dObj.updateMatrix();
            bootMeshRef.current.setMatrixAt(i, dObj.matrix);
          }
          bootMeshRef.current.instanceMatrix.needsUpdate = true;
        }
      }

      // Fase 2: Intensificação do brilho emissivo (glow digital)
      if (t > 1.5 && t <= 2.5) {
        const p = (t - 1.5) / 1.0;
        if (bootMaterialRef.current) {
          bootMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(1.2, 3.0, p);
        }
      }

      // Fase 3: Expansão do diâmetro com fade-out da casca de boot
      if (t > 2.5 && t <= 3.5) {
        const p = (t - 2.5) / 1.0;
        if (shellGroupRef.current) {
          shellGroupRef.current.scale.setScalar(1.0 + p * 1.5);
        }
        if (bootMaterialRef.current) {
          bootMaterialRef.current.opacity = THREE.MathUtils.lerp(1.0, 0.0, p);
        }
      }

      if (t > 3.5 && !bootCompleteFired.current) {
        bootCompleteFired.current = true;
        onBootComplete();
      }

      return;
    }

    // Comportamento normal reativo a áudio pós-boot
    const vol = audioVolumeRef.current || 0;
    const targetScale = 1 + vol * 0.4;
    scaleVec.current.set(targetScale, targetScale, targetScale);
    coreGroupRef.current.scale.lerp(scaleVec.current, 0.2);
  });

  return (
    <group ref={coreGroupRef}>
      {bootState === 'booting' && (
        <group ref={shellGroupRef}>
          {/* InstancedMesh composto de hexágonos 3D grossos brilhantes para substituir as linhas antigas */}
          <instancedMesh ref={bootMeshRef} args={[bootFrameGeo, null as any, bootVerts.length]} castShadow receiveShadow={false}>
            <meshStandardMaterial
              ref={bootMaterialRef}
              color="#22d3ee" // Ciano neon
              emissive="#22d3ee"
              emissiveIntensity={1.2}
              transparent
              opacity={1}
              roughness={0.1}
              metalness={0.1}
            />
          </instancedMesh>
        </group>
      )}
      {bootState === 'ready' && (
        <>
          <InnerHexCore focusedAgent={focusedAgent} isListening={isListening} audioVolumeRef={audioVolumeRef} />
          <ShellWireframe />
          <ShellPanels focusedAgent={focusedAgent} />
        </>
      )}
    </group>
  );
}

