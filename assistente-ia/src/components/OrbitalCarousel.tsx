import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import {
  ShatteredMonolith,
  MobiusKnot,
  Astrolabe,
  FrequencyCrystal,
} from './SubAgentArtifacts';

const AGENTS_DATA = [
  { id: 'orq', radius: 3.6, offset: 0, Component: ShatteredMonolith },
  { id: 'est', radius: 4.2, offset: Math.PI / 2, Component: MobiusKnot },
  { id: 'rpg', radius: 4.8, offset: Math.PI, Component: Astrolabe },
  { id: 'hw', radius: 5.4, offset: Math.PI * 1.5, Component: FrequencyCrystal },
];

function RingLine({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segs = 80;
    for (let i = 0; i <= segs; i++) {
      const theta = (i / segs) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#999999" transparent opacity={0.25} />
    </line>
  );
}

interface OrbitalCarouselProps {
  focusedAgent: string | null;
  onAgentClick: (id: string, index: number) => void;
  focusedPos: React.MutableRefObject<THREE.Vector3>;
}

export function OrbitalCarousel({ focusedAgent, onAgentClick, focusedPos }: OrbitalCarouselProps) {
  const targetVelocity = useRef(0);
  const currentVelocity = useRef(0);
  const globalAngle = useRef(0);
  const agentRefs = useRef<(THREE.Group | null)[]>(new Array(AGENTS_DATA.length).fill(null));
  const targetGlobalAngle = useRef<number | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (focusedAgent) return;
      targetVelocity.current += e.deltaY * 0.0015;
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [focusedAgent]);

  useEffect(() => {
    if (focusedAgent) {
      const agent = AGENTS_DATA.find(a => a.id === focusedAgent);
      if (agent) {
        const baseTarget = (Math.PI / 2) - agent.offset;
        const current = globalAngle.current;
        const diff = ((baseTarget - current) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
        const shortestDiff = diff > Math.PI ? diff - Math.PI * 2 : diff;
        targetGlobalAngle.current = current + shortestDiff;
      }
    } else {
      targetGlobalAngle.current = null;
    }
  }, [focusedAgent]);

  useFrame((state, delta) => {
    if (focusedAgent && targetGlobalAngle.current !== null) {
      globalAngle.current = THREE.MathUtils.lerp(globalAngle.current, targetGlobalAngle.current, 0.05);
    } else if (!focusedAgent) {
      currentVelocity.current = THREE.MathUtils.damp(currentVelocity.current, targetVelocity.current, 5, delta);
      targetVelocity.current = THREE.MathUtils.damp(targetVelocity.current, 0, 8, delta);
      globalAngle.current += (0.05 * delta) + (currentVelocity.current * delta);
    }

    AGENTS_DATA.forEach((agent, i) => {
      const grp = agentRefs.current[i];
      if (!grp) return;

      const angle = globalAngle.current + agent.offset;
      const baseX = Math.cos(angle) * agent.radius;
      const baseZ = Math.sin(angle) * agent.radius;

      if (focusedAgent === agent.id) {
        grp.position.x = baseX;
        grp.position.z = baseZ;
        const time = state.clock.elapsedTime;
        switch (agent.id) {
          case 'orq':
            grp.position.y = THREE.MathUtils.lerp(grp.position.y, Math.sin(time * 8) * 0.15, 0.1);
            grp.rotation.z = THREE.MathUtils.lerp(grp.rotation.z, Math.sin(time * 4) * 0.1, 0.1);
            break;
          case 'est':
            grp.rotation.x += delta * 3.5;
            grp.rotation.z -= delta * 2.0;
            grp.position.y = THREE.MathUtils.lerp(grp.position.y, 0, 0.1);
            break;
          case 'rpg':
            grp.position.y = THREE.MathUtils.lerp(grp.position.y, Math.sin(time * 2) * 0.3, 0.05);
            grp.rotation.y += delta * 0.4;
            grp.rotation.x += delta * 0.2;
            break;
          case 'hw':
            grp.position.z = THREE.MathUtils.lerp(grp.position.z, baseZ + Math.sin(time * 5) * 0.4, 0.1);
            grp.rotation.set(0, 0, 0);
            break;
        }
      } else {
        grp.position.set(baseX, 0, baseZ);
        if (focusedAgent) {
          grp.rotation.y = THREE.MathUtils.damp(grp.rotation.y, 0, 4, delta);
          grp.rotation.x = THREE.MathUtils.damp(grp.rotation.x, 0, 4, delta);
          grp.rotation.z = THREE.MathUtils.damp(grp.rotation.z, 0, 4, delta);
        }
      }
    });
  });

  return (
    <group>
      {AGENTS_DATA.map((agent, i) => {
        const Component = agent.Component;
        return (
          <group key={agent.id} castShadow={false} receiveShadow={false}>
            <RingLine radius={agent.radius} />
            <group ref={(el) => { agentRefs.current[i] = el; }} castShadow={false} receiveShadow={false}>
              <Trail width={0.1} length={4} decay={1} local={false} stride={0} attenuation={(t) => t * t}>
                <Component isFocused={false} />
              </Trail>
              <mesh
                visible={false}
                onClick={(e) => {
                  e.stopPropagation();
                  if (focusedAgent === agent.id) return;
                  const grp = agentRefs.current[i];
                  if (grp) grp.getWorldPosition(focusedPos.current);
                  onAgentClick(agent.id, i);
                }}
                onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
              >
                <sphereGeometry args={[2.0, 16, 16]} />
                <meshBasicMaterial />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
