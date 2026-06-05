import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AstrolabeAgent } from '../agents/AstrolabeAgent';
import { DismantledCubeAgent } from '../agents/DismantledCubeAgent';
import { IcosahedronAgent } from '../agents/IcosahedronAgent';
import { CylinderAgent } from '../agents/CylinderAgent';
import { KnotAgent } from '../agents/KnotAgent';
import { SpiralGalaxy } from './SpiralGalaxy';

// AGENTS_DATA expandido para 5 órbitas concêntricas equilibradas
const AGENTS_DATA = [
  { id: 'orq', radius: 4.5, offset: 0, Component: AstrolabeAgent },
  { id: 'est', radius: 5.5, offset: (Math.PI * 2) / 5, Component: IcosahedronAgent },
  { id: 'rpg', radius: 6.5, offset: (Math.PI * 4) / 5, Component: DismantledCubeAgent },
  { id: 'hw', radius: 7.5, offset: (Math.PI * 6) / 5, Component: CylinderAgent },
  { id: 'pow', radius: 8.5, offset: (Math.PI * 8) / 5, Component: KnotAgent },
];

export const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727', // Crimson - Astrolábio (Orquestrador)
  est: '#0066ff', // Cobalto - Icosaedro (Estudos UFBA)
  rpg: '#b829ff', // Magenta - Cubo Desmantelado (Mestre de Campanhas)
  hw: '#25ced1',  // Ciano - Cilindro (Hardware e Sistema)
  pow: '#ffaa00', // Dourado/Ouro - Nó de Möbius (Sistemas de Potência)
};

const fixedAgentPos = new THREE.Vector3(4.5, -1.5, 2.0);

interface OrbitalCarouselProps {
  focusedAgent: string | null;
  onAgentClick: (id: string, index: number) => void;
  focusedPos: React.MutableRefObject<THREE.Vector3>;
  orbitTilt: THREE.Euler;
  stagePos: React.MutableRefObject<THREE.Vector3>;
  stageRot: React.MutableRefObject<THREE.Euler>;
  theme: 'dark' | 'light';
}

export function OrbitalCarousel({ focusedAgent, onAgentClick, focusedPos, orbitTilt, stagePos, stageRot, theme }: OrbitalCarouselProps) {
  const targetVelocity = useRef(0);
  const currentVelocity = useRef(0);
  const globalAngle = useRef(0);
  const agentRefs = useRef<(THREE.Group | null)[]>(new Array(AGENTS_DATA.length).fill(null));
  const targetGlobalAngle = useRef<number | null>(null);
  const tempVec = useRef(new THREE.Vector3());
  const agentPositionsRef = useRef<THREE.Vector3[]>(AGENTS_DATA.map(() => new THREE.Vector3()));

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (focusedAgent) return;
      targetVelocity.current += e.deltaY * 0.004;
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [focusedAgent]);

  useEffect(() => {
    if (focusedAgent) {
      const agent = AGENTS_DATA.find(a => a.id === focusedAgent);
      if (agent) {
        const targetAngleLocal = Math.PI / 2.2;
        const baseTarget = targetAngleLocal - agent.offset;
        const current = globalAngle.current;
        const diff = ((baseTarget - current) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
        const shortestDiff = diff > Math.PI ? diff - Math.PI * 2 : diff;
        targetGlobalAngle.current = current + shortestDiff;

        tempVec.current.set(
          Math.cos(targetAngleLocal) * agent.radius,
          0,
          Math.sin(targetAngleLocal) * agent.radius
        ).applyEuler(orbitTilt);

        stagePos.current.set(
          fixedAgentPos.x - tempVec.current.x,
          fixedAgentPos.y - tempVec.current.y,
          fixedAgentPos.z - tempVec.current.z
        );
        stageRot.current.set(0, 0, 0);
      }
    } else {
      targetGlobalAngle.current = null;
      stagePos.current.set(5.5, 0.5, -3.0);
      stageRot.current.set(Math.PI / 6, 0, -Math.PI / 16);
    }
  }, [focusedAgent, orbitTilt, stagePos, stageRot]);

  useFrame((state, delta) => {
    // 1. Atualização do ângulo de rotação global
    if (focusedAgent && targetGlobalAngle.current !== null) {
      globalAngle.current = THREE.MathUtils.lerp(globalAngle.current, targetGlobalAngle.current, 0.015);
    } else if (!focusedAgent) {
      currentVelocity.current = THREE.MathUtils.damp(currentVelocity.current, targetVelocity.current, 5, delta);
      targetVelocity.current = THREE.MathUtils.damp(targetVelocity.current, 0, 3, delta);
      globalAngle.current -= (0.15 * delta) + (currentVelocity.current * delta);
    }

    // 2. Posicionamento de cada subagente na órbita circular clássica
    AGENTS_DATA.forEach((agent, i) => {
      const grp = agentRefs.current[i];
      if (!grp) return;

      // Cálculo circular atrelado à rotação global do carrossel
      const angle = globalAngle.current + agent.offset;
      const x = Math.cos(angle) * agent.radius;
      const z = Math.sin(angle) * agent.radius;
      
      // Alinhamento de plano (Y = 0) garante que a órbita circular corta 
      // exatamente o equador da SpiralGalaxy.
      grp.position.set(x, 0, z);
      
      // Redução de escala exigida (escala global de 0.75)
      grp.scale.setScalar(0.75); 

      // Captura a posição absoluta do agente no mundo 3D
      grp.getWorldPosition(agentPositionsRef.current[i]);
    });
  });

  return (
    <group rotation={orbitTilt}>
      {/* A galáxia Helios de fundo com reatividade cromática e tema repassados */}
      <SpiralGalaxy focusedAgent={focusedAgent} agentPositionsRef={agentPositionsRef} theme={theme} />
      {AGENTS_DATA.map((agent, i) => {
        const Component = agent.Component;
        return (
          <group key={agent.id} castShadow={false} receiveShadow={false}>
            <group ref={(el) => { agentRefs.current[i] = el; }} castShadow={false} receiveShadow={false}>
              {/* Renderização direta do agente sem Trail */}
              <Component isFocused={focusedAgent === agent.id} />
              <mesh
                visible={false}
                onClick={(e) => {
                  e.stopPropagation();
                  if (focusedAgent === agent.id) return;
                  const grp = agentRefs.current[i];
                  if (grp) {
                    grp.getWorldPosition(focusedPos.current);
                  }
                  onAgentClick(agent.id, i);
                }}
                onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
              >
                <sphereGeometry args={[0.25, 16]} />
                <meshBasicMaterial />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
