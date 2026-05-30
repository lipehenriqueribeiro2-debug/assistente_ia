import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AiCore } from './AiCore';
import * as THREE from 'three';

const RADIUS = 3;
const PANEL_W = 1.4;
const PANEL_H = 2.2;
const PI2 = Math.PI * 2;

function shortestArc(from: number, to: number): number {
  let d = (to - from) % PI2;
  if (d < 0) d += PI2;
  return d > Math.PI ? d - PI2 : d;
}

const moduleLineStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  lineHeight: '16px',
  letterSpacing: '-0.5px',
  color: '#cbd5e1',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const activeTitleStyle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '-0.2px',
  color: '#fcfdff',
  marginBottom: 8,
};

interface ModuleNodeProps {
  index: number;
  total: number;
  title: string;
  aura: string;
  isActive: boolean;
  logs: string[];
}

function ModuleNode({ index, total, title, aura, isActive, logs }: ModuleNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const angle = (index / total) * PI2;
  const x = Math.sin(angle) * RADIUS;
  const z = Math.cos(angle) * RADIUS;

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.getWorldPosition(worldPos);
    const zNorm = Math.max(0, Math.min(1, (worldPos.z / RADIUS) * 0.5 + 0.5));
    const opacity = 0.08 + 0.92 * zNorm;
    const scale = 0.5 + 0.5 * zNorm;
    const mat = meshRef.current.material as THREE.Material;
    mat.opacity = isActive ? Math.max(opacity, 0.6) : opacity * 0.25;
    mat.transparent = true;
    groupRef.current?.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        {isActive ? (
          <meshPhysicalMaterial
            transmission={0.6}
            roughness={0.2}
            metalness={0}
            ior={1.5}
            thickness={0.3}
            color="#0b1120"
            transparent
            opacity={0.6}
            envMapIntensity={0.3}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshBasicMaterial
            color="#0b1120"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {isActive && logs.length > 0 && (
        <Html transform occlude style={{ width: '200px', pointerEvents: 'none' }}>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: aura, flexShrink: 0 }} />
              <span style={activeTitleStyle}>{title}</span>
            </div>
            {logs.map((line, i) => (
              <div key={i} style={moduleLineStyle}>{line}</div>
            ))}
          </div>
        </Html>
      )}

      {!isActive && (
        <Html transform occlude style={{ width: '140px', pointerEvents: 'none' }}>
          <div style={{ padding: '8px 12px', textAlign: 'center' }}>
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '-0.15px',
              color: '#64748b',
            }}>
              {title}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

interface OrbitalCarouselProps {
  modules: { key: string; title: string; aura: string; mono?: boolean }[];
  activeKey: string | null;
  logs: Record<string, string[]>;
  color: string;
  mouseX: number;
  mouseY: number;
  bass: number;
  reducedMotion: boolean;
}

export function OrbitalCarousel({ modules, activeKey, logs, color, mouseX, mouseY, bass, reducedMotion }: OrbitalCarouselProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);
  const velocity = useRef(0);
  const targetAngle = useRef(0);
  const prevActiveKey = useRef(activeKey);

  if (activeKey !== prevActiveKey.current) {
    prevActiveKey.current = activeKey;
    const idx = modules.findIndex((m) => m.key === activeKey);
    if (idx >= 0) {
      targetAngle.current = -((idx / modules.length) * PI2);
    }
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const diff = shortestArc(currentAngle.current, targetAngle.current);
    const springForce = 120 * diff;
    const dampForce = -14 * velocity.current;
    const accel = springForce + dampForce;
    velocity.current += accel * dt;
    currentAngle.current += velocity.current * dt;

    if (groupRef.current) {
      groupRef.current.rotation.y = currentAngle.current;
    }
  });

  return (
    <group ref={groupRef}>
      <AiCore color={color} mouseX={mouseX} mouseY={mouseY} bass={bass} reducedMotion={reducedMotion} modules={modules} activeKey={activeKey} />

      {modules.map((mod, i) => (
        <ModuleNode
          key={mod.key}
          index={i}
          total={modules.length}
          title={mod.title}
          aura={mod.aura}
          isActive={mod.key === activeKey}
          logs={logs[mod.key] || []}
        />
      ))}
    </group>
  );
}
