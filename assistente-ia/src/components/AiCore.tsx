import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const PHI = (1 + Math.sqrt(5)) / 2;
const CORE_RADIUS = 1.6;
const PI2 = Math.PI * 2;

function buildTruncatedIcosahedron(radius: number): THREE.BufferGeometry {
  const icoVerts: THREE.Vector3[] = [
    [0, 1, PHI], [0, 1, -PHI], [0, -1, PHI], [0, -1, -PHI],
    [1, PHI, 0], [1, -PHI, 0], [-1, PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, 1], [-PHI, 0, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));

  const icoEdges: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      if (Math.abs(icoVerts[i].distanceTo(icoVerts[j]) - 2) < 0.01) {
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

const dustVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const dustFrag = `
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  float grain = hash(uv + uTime * 0.001) * 0.025;
  float radial = 1.0 - length(uv - 0.5);
  vec3 col = mix(vec3(0.0), uColor, (grain + radial * 0.015) * 0.3);
  gl_FragColor = vec4(col, 0.6);
}
`;

function StarDustBackground({ color }: { color: string }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const dustColor = useMemo(() => new THREE.Color(color), []);

  useEffect(() => {
    if (ref.current) ref.current.uniforms.uColor.value.set(color);
  }, [color]);

  useFrame((state) => {
    if (ref.current) ref.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -3]} renderOrder={-15}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        ref={ref}
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        uniforms={{ uTime: { value: 0 }, uColor: { value: dustColor } }}
        depthWrite={false}
        transparent
      />
    </mesh>
  );
}

function TruncatedCore({ bass, spikeIntensity, spikeColor }: { bass: number; spikeIntensity: number; spikeColor: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => buildTruncatedIcosahedron(CORE_RADIUS), []);
  const origPos = useRef<Float32Array | null>(null);
  const spikeColorRef = useRef(new THREE.Color('#3e3e4d'));
  const baseEmissive = useMemo(() => new THREE.Color('#3e3e4d'), []);
  const currentEmissive = useRef(new THREE.Color('#3e3e4d'));

  useEffect(() => {
    spikeColorRef.current.set(spikeColor);
  }, [spikeColor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const pos = geo.getAttribute('position') as THREE.Float32BufferAttribute;
    const norm = geo.getAttribute('normal') as THREE.Float32BufferAttribute;

    if (!origPos.current) {
      origPos.current = new Float32Array(pos.array);
    }

    const t = state.clock.elapsedTime;

    // Heartbeat timing: fast attack (60ms), cubic ease-out decay
    const beatDuration = 1.5;
    const beatPhase = t % beatDuration;
    const attack = 0.06;
    let beat: number;
    if (beatPhase < attack) {
      beat = Math.sin((beatPhase / attack) * Math.PI * 0.5);
      beat = 1 - (1 - beat) * (1 - beat);
    } else {
      const decay = (beatPhase - attack) / (beatDuration - attack);
      beat = Math.pow(1.0 - decay, 3);
    }

    // Vertex noise displacement
    const intensity = beat * 0.15 + bass * 0.05;
    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      const nx = norm.array[i3];
      const ny = norm.array[i3 + 1];
      const nz = norm.array[i3 + 2];
      const ox = origPos.current[i3];
      const oy = origPos.current[i3 + 1];
      const oz = origPos.current[i3 + 2];
      const hash = Math.sin(ox * 12.9898 + oy * 78.233 + oz * 45.164 + t * 2.7) * 43758.5453;
      const noise = hash - Math.floor(hash);
      const d = intensity * (noise * 2 - 1) * 0.5;
      pos.array[i3] = ox + nx * d;
      pos.array[i3 + 1] = oy + ny * d;
      pos.array[i3 + 2] = oz + nz * d;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // Emissive: base heartbeat + resonance spike (HDR for bloom)
    const mat = mesh.material as THREE.MeshPhysicalMaterial;
    const baseIntensity = 0.3 + beat * 1.5 + Math.sin(t * 0.5) * 0.1 + bass * 0.2;
    mat.emissiveIntensity = baseIntensity + spikeIntensity * 2.0;

    // Lerp emissive color toward spike color
    const targetEmissive = spikeIntensity > 0.01 ? spikeColorRef.current : baseEmissive;
    currentEmissive.current.lerp(targetEmissive, 0.06);
    mat.emissive.copy(currentEmissive.current);
  });

  return (
    <mesh ref={meshRef} geometry={geo}>
      <meshPhysicalMaterial
        transmission={1}
        roughness={0.2}
        ior={1.5}
        thickness={0.8}
        color="#0b1120"
        transparent
        envMapIntensity={0.6}
        clearcoat={0.3}
        clearcoatRoughness={0.2}
        emissive="#3e3e4d"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function CoreWireframe({ bass, spikeIntensity, spikeColor }: { bass: number; spikeIntensity: number; spikeColor: string }) {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => new THREE.EdgesGeometry(buildTruncatedIcosahedron(CORE_RADIUS * 1.002)), []);
  const spikeColorRef = useRef(new THREE.Color('#a92727'));

  useEffect(() => {
    spikeColorRef.current.set(spikeColor);
  }, [spikeColor]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const beatDuration = 1.5;
    const beatPhase = t % beatDuration;
    const attack = 0.06;
    let beat: number;
    if (beatPhase < attack) {
      beat = Math.sin((beatPhase / attack) * Math.PI * 0.5);
      beat = 1 - (1 - beat) * (1 - beat);
    } else {
      const decay = (beatPhase - attack) / (beatDuration - attack);
      beat = Math.pow(1.0 - decay, 3);
    }
    const baseOpacity = 0.15 + beat * 0.6 + bass * 0.1;
    const mat = ref.current.material as THREE.LineBasicMaterial;
    mat.opacity = Math.min(baseOpacity + spikeIntensity * 0.8, 1);
    mat.color.lerp(spikeColorRef.current, spikeIntensity > 0.01 ? 0.1 : 0.01);
  });

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color="#a92727" transparent opacity={0.15} depthWrite={false} />
    </lineSegments>
  );
}

const ORBIT_RADII = [2.8, 3.4, 4.0, 4.6];
const ORBIT_COLORS = ['#a92727', '#0066ff', '#b829ff', '#3ecf8e'];

const trailVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const trailFrag = `
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
varying vec2 vUv;

void main() {
  float pos = fract(uTime * uSpeed);
  float dist = abs(vUv.x - pos);
  dist = min(dist, 1.0 - dist);
  float pulse = exp(-dist * 100.0);
  float trail = exp(-dist * 20.0) * 0.3;
  vec3 col = uColor * (pulse * 8.0 + trail);
  col += uColor * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`;

function LightTrail({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const trailColor = useMemo(() => new THREE.Color(color), []);

  useEffect(() => {
    if (ref.current) ref.current.uniforms.uColor.value.set(color);
  }, [color]);

  useFrame((state) => {
    if (ref.current) ref.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 8, 120]} />
      <shaderMaterial
        ref={ref}
        vertexShader={trailVert}
        fragmentShader={trailFrag}
        uniforms={{ uTime: { value: 0 }, uColor: { value: trailColor }, uSpeed: { value: speed } }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function LightTrails({ color }: { color: string }) {
  return (
    <group>
      {ORBIT_RADII.map((r, i) => (
        <LightTrail key={i} radius={r} speed={0.08 + i * 0.02} color={color} />
      ))}
    </group>
  );
}

function makeArtifactMat(colorIndex: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.15,
    ior: 1.5,
    thickness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    metalness: 0.1,
    envMapIntensity: 0.8,
    transparent: true,
    color: new THREE.Color(ORBIT_COLORS[colorIndex]),
    emissive: new THREE.Color(ORBIT_COLORS[colorIndex]),
    emissiveIntensity: 0.4,
  });
}

function useArtifactLerp(colorIndex: number, isSelected: boolean, targetAura: string) {
  const currentC = useRef(new THREE.Color(ORBIT_COLORS[colorIndex]));
  const targetC = useRef(new THREE.Color(ORBIT_COLORS[colorIndex]));
  const currentE = useRef(new THREE.Color(ORBIT_COLORS[colorIndex]));
  const targetE = useRef(new THREE.Color(ORBIT_COLORS[colorIndex]));

  useEffect(() => {
    const c = isSelected ? targetAura : ORBIT_COLORS[colorIndex];
    targetC.current.set(c);
    targetE.current.set(c);
  }, [isSelected, targetAura, colorIndex]);

  return { currentC, targetC, currentE, targetE };
}

function updateArtifactMat(
  mat: THREE.MeshPhysicalMaterial,
  currentC: React.MutableRefObject<THREE.Color>,
  targetC: React.MutableRefObject<THREE.Color>,
  currentE: React.MutableRefObject<THREE.Color>,
  targetE: React.MutableRefObject<THREE.Color>,
  isSelected: boolean,
  t: number,
) {
  currentC.current.lerp(targetC.current, 0.04);
  currentE.current.lerp(targetE.current, 0.04);
  mat.color.copy(currentC.current);
  mat.emissive.copy(currentE.current);
  mat.emissiveIntensity = isSelected ? 1.2 + Math.sin(t * 3) * 0.2 : 0.4;
}

function ShatteredMonolith({ colorIndex, isSelected, targetAura }: { colorIndex: number; isSelected: boolean; targetAura: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const mat = useMemo(() => makeArtifactMat(colorIndex), [colorIndex]);
  const { currentC, targetC, currentE, targetE } = useArtifactLerp(colorIndex, isSelected, targetAura);

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.008;
    updateArtifactMat(mat, currentC, targetC, currentE, targetE, isSelected, state.clock.elapsedTime);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-0.09, 0.03, 0]} material={mat}><boxGeometry args={[0.035, 0.42, 0.035]} /></mesh>
      <mesh position={[0, -0.04, 0.015]} material={mat}><boxGeometry args={[0.028, 0.48, 0.028]} /></mesh>
      <mesh position={[0.09, 0.015, -0.015]} material={mat}><boxGeometry args={[0.04, 0.32, 0.04]} /></mesh>
      <mesh position={[-0.04, 0.1, -0.025]} material={mat}><boxGeometry args={[0.025, 0.24, 0.025]} /></mesh>
    </group>
  );
}

function MobiusKnot({ colorIndex, isSelected, targetAura }: { colorIndex: number; isSelected: boolean; targetAura: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => makeArtifactMat(colorIndex), [colorIndex]);
  const { currentC, targetC, currentE, targetE } = useArtifactLerp(colorIndex, isSelected, targetAura);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.005;
      ref.current.rotation.y += 0.012;
    }
    updateArtifactMat(mat, currentC, targetC, currentE, targetE, isSelected, state.clock.elapsedTime);
  });

  return (
    <mesh ref={ref} material={mat}>
      <torusKnotGeometry args={[0.18, 0.04, 64, 8, 2, 3]} />
    </mesh>
  );
}

function Astrolabe({ colorIndex, isSelected, targetAura }: { colorIndex: number; isSelected: boolean; targetAura: string }) {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => makeArtifactMat(colorIndex), [colorIndex]);
  const { currentC, targetC, currentE, targetE } = useArtifactLerp(colorIndex, isSelected, targetAura);

  useFrame((state) => {
    if (r1.current) r1.current.rotation.x += 0.01;
    if (r2.current) r2.current.rotation.y += 0.008;
    if (r3.current) r3.current.rotation.z += 0.012;
    updateArtifactMat(mat, currentC, targetC, currentE, targetE, isSelected, state.clock.elapsedTime);
  });

  return (
    <group>
      <mesh ref={r1} material={mat}>
        <torusGeometry args={[0.3, 0.008, 16, 48]} />
      </mesh>
      <mesh ref={r2} material={mat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.006, 16, 40]} />
      </mesh>
      <mesh ref={r3} material={mat} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.12, 0.005, 12, 32]} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function FrequencyCrystal({ colorIndex, isSelected, targetAura }: { colorIndex: number; isSelected: boolean; targetAura: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => makeArtifactMat(colorIndex), [colorIndex]);
  const { currentC, targetC, currentE, targetE } = useArtifactLerp(colorIndex, isSelected, targetAura);
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.14, 0);
    const pos = g.getAttribute('position') as THREE.Float32BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      pos.array[i3 + 1] *= 2.2;
      pos.array[i3] += (Math.random() - 0.5) * 0.018;
      pos.array[i3 + 2] += (Math.random() - 0.5) * 0.018;
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.008;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
      ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
    }
    updateArtifactMat(mat, currentC, targetC, currentE, targetE, isSelected, state.clock.elapsedTime);
  });

  return <mesh ref={ref} material={mat} geometry={geo} />;
}

const ARTIFACTS = [ShatteredMonolith, MobiusKnot, Astrolabe, FrequencyCrystal];

function SubAgent({ index, total, isSelected, targetAura }: { index: number; total: number; isSelected: boolean; targetAura: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const baseAngle = (index / total) * PI2;
  const Artifact = ARTIFACTS[index];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const angle = baseAngle + t * (0.15 + index * 0.03);
    const radius = ORBIT_RADII[index];
    const yOff = Math.sin(t * 0.4 + index) * 0.15;
    groupRef.current.position.set(
      Math.sin(angle) * radius,
      yOff,
      Math.cos(angle) * radius,
    );
  });

  return (
    <group ref={groupRef}>
      <Artifact colorIndex={index} isSelected={isSelected} targetAura={targetAura} />
    </group>
  );
}

function OrbitingSubAgents({ selectedIndex, moduleAuras }: { selectedIndex: number; moduleAuras: string[] }) {
  return (
    <group>
      {Array.from({ length: 4 }, (_, i) => (
        <SubAgent
          key={i}
          index={i}
          total={4}
          isSelected={i === selectedIndex}
          targetAura={moduleAuras[i] || ORBIT_COLORS[i]}
        />
      ))}
    </group>
  );
}

function CenterLight({ color }: { color: string }) {
  const ref = useRef<THREE.PointLight>(null);
  const currentColor = useRef(new THREE.Color('#3e3e4d'));
  const targetColor = useRef(new THREE.Color('#3e3e4d'));

  useEffect(() => {
    targetColor.current.set(color);
  }, [color]);

  useFrame(() => {
    if (ref.current) {
      currentColor.current.lerp(targetColor.current, 0.02);
      ref.current.color.copy(currentColor.current);
    }
  });

  return <pointLight ref={ref} position={[0, 0, 0]} intensity={2} distance={8} />;
}

export function AiCore({ color = '#3e3e4d', mouseX = 0, mouseY = 0, bass = 0, reducedMotion = false, modules = [], activeKey = null }: { color?: string; mouseX?: number; mouseY?: number; bass?: number; reducedMotion?: boolean; modules?: { key: string; title: string; aura: string }[]; activeKey?: string | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const prevActiveKey = useRef(activeKey);
  const spikeTime = useRef(-10);
  const clockRef = useRef(0);
  const spikeColorRef = useRef('#3e3e4d');

  if (activeKey !== prevActiveKey.current && activeKey !== null) {
    prevActiveKey.current = activeKey;
    spikeTime.current = clockRef.current;
    const mod = modules.find(m => m.key === activeKey);
    if (mod) spikeColorRef.current = mod.aura;
  }

  const activeIndex = activeKey ? modules.findIndex(m => m.key === activeKey) : -1;
  const moduleAuras = useMemo(() => modules.map(m => m.aura), [modules]);

  useFrame((state) => {
    clockRef.current = state.clock.elapsedTime;
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y += (mouseX * 0.4 - groupRef.current.rotation.y) * 0.015;
      groupRef.current.rotation.x += (-mouseY * 0.3 - groupRef.current.rotation.x) * 0.015;
    }
  });

  const sinceSpike = clockRef.current - spikeTime.current;
  const spikeDecay = Math.max(0, 1 - sinceSpike / 1.2);
  const spikeIntensity = spikeDecay * spikeDecay;

  return (
    <>
      <StarDustBackground color={color} />

      <directionalLight position={[-6, 4, 2]} intensity={3} color="#c8d8ff" />
      <directionalLight position={[5, -3, -4]} intensity={1.5} color="#6688cc" />

      <CenterLight color={color} />

      <group ref={groupRef}>
        <LightTrails color={color} />
        <TruncatedCore
          bass={reducedMotion ? 0 : bass}
          spikeIntensity={reducedMotion ? 0 : spikeIntensity}
          spikeColor={spikeColorRef.current}
        />
        <CoreWireframe
          bass={reducedMotion ? 0 : bass}
          spikeIntensity={reducedMotion ? 0 : spikeIntensity}
          spikeColor={spikeColorRef.current}
        />
        <OrbitingSubAgents selectedIndex={reducedMotion ? -1 : activeIndex} moduleAuras={moduleAuras} />
      </group>

      <Environment preset="studio" background={false} />
    </>
  );
}
