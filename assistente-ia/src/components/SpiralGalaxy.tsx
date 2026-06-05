import { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AGENT_COLORS } from './OrbitalCarousel';

const VERTEX_SHADER = `
#include <common>
#include <color_pars_vertex>

uniform vec3 uAgentPositions[5];
uniform vec3 uMousePos;
uniform float uTime;

varying float vAntigravityFade;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

void main() {
  #include <color_vertex>
  
  vAntigravityFade = 1.0;
  vec3 transformed = vec3(position);
  
  #ifdef USE_INSTANCING
    // 1. Extrai a posição central (pivô) da bolinha atual no espaço local da malha
    vec3 instanceCenter = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    // 2. Calcula a posição real do vértice (esfera) no espaço local da malha
    vec3 actualPos = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    vec3 deformedPos = actualPos;
    
    // --- EFEITO DE ONDA SUAVE (WAVE EFFECT) ---
    float distToCenterOriginal = length(instanceCenter.xz);
    float waveAmplitude = 0.12;
    float waveFrequency = 1.2;
    float waveSpeed = 1.8;
    float wave = sin(distToCenterOriginal * waveFrequency - uTime * waveSpeed) * waveAmplitude;
    float edgeFade = 1.0 - smoothstep(8.0, 16.0, distToCenterOriginal);
    deformedPos.y += wave * edgeFade;
    
    // --- CAMPO DO NÚCLEO (AiCore) - POÇO GRAVITACIONAL CENTRAL ---
    float coreFieldRadius = 3.0;
    float influenceRadiusCoreXZ = 5.0;
    vec2 coreXZ = instanceCenter.xz;
    float distCoreXZ = length(coreXZ);
    
    if (distCoreXZ < influenceRadiusCoreXZ && distCoreXZ > 0.01) {
      float tCore = (influenceRadiusCoreXZ - distCoreXZ) / influenceRadiusCoreXZ;
      tCore = clamp(tCore, 0.0, 1.0);
      float smoothTCore = tCore * tCore * (3.0 - 2.0 * tCore);
      
      float depressionCoreY = -3.5 * smoothTCore;
      vec2 attractionCoreXZ = -coreXZ * 0.12 * smoothTCore;
      
      deformedPos.y += depressionCoreY;
      deformedPos.x += attractionCoreXZ.x;
      deformedPos.z += attractionCoreXZ.y;
      
      float dist3DCore = length(deformedPos);
      if (dist3DCore < coreFieldRadius) {
        deformedPos = normalize(deformedPos) * coreFieldRadius;
      }
    }
    
    // --- CAMPO DOS AGENTES (POÇO GRAVITACIONAL ORBITAL) ---
    float agentRadius = 1.3;
    float influenceRadiusXZ = 2.6;
    for(int i = 0; i < 5; i++) {
      vec2 dirXZ = instanceCenter.xz - uAgentPositions[i].xz;
      float distXZ = length(dirXZ);
      
      if (distXZ < influenceRadiusXZ && distXZ > 0.001) {
        float t = (influenceRadiusXZ - distXZ) / influenceRadiusXZ;
        t = clamp(t, 0.0, 1.0);
        float smoothT = t * t * (3.0 - 2.0 * t);
        
        float depressionY = -1.65 * smoothT;
        vec2 attractionXZ = -dirXZ * 0.12 * smoothT;
        
        deformedPos.y += depressionY;
        deformedPos.x += attractionXZ.x;
        deformedPos.z += attractionXZ.y;
        
        vec3 relPos = deformedPos - uAgentPositions[i];
        float dist3D = length(relPos);
        if (dist3D < agentRadius) {
          deformedPos = uAgentPositions[i] + normalize(relPos) * agentRadius;
        }
      }
    }
    
    // --- POÇO GRAVITACIONAL DO CURSOR DO MOUSE ---
    float mouseRadius = 0.55;
    float influenceRadiusMouseXZ = 1.7;
    vec2 mouseXZ = instanceCenter.xz - uMousePos.xz;
    float distMouseXZ = length(mouseXZ);
    
    if (distMouseXZ < influenceRadiusMouseXZ && distMouseXZ > 0.001) {
      float tMouse = (influenceRadiusMouseXZ - distMouseXZ) / influenceRadiusMouseXZ;
      tMouse = clamp(tMouse, 0.0, 1.0);
      float smoothT = tMouse * tMouse * (3.0 - 2.0 * tMouse);
      
      float depressionMouseY = -0.9 * smoothT;
      vec2 attractionMouseXZ = -mouseXZ * 0.12 * smoothT;
      
      deformedPos.y += depressionMouseY;
      deformedPos.x += attractionMouseXZ.x;
      deformedPos.z += attractionMouseXZ.y;
      
      vec3 relMouse = deformedPos - uMousePos;
      float dist3DMouse = length(relMouse);
      if (dist3DMouse < mouseRadius) {
        deformedPos = uMousePos + normalize(relMouse) * mouseRadius;
      }
    }
    
    actualPos = deformedPos;
    
    // --- EFEITO ANTIGRAVIDADE (Drift ascendente para ~1.5% das partículas) ---
    float h = hash(instanceCenter);
    if (h > 0.985) {
      float driftSpeed = 0.3 + hash(instanceCenter * 2.0) * 0.5;
      float driftHeight = 6.0 + hash(instanceCenter * 3.0) * 4.0;
      float cycle = mod(uTime * driftSpeed + h * 100.0, driftHeight);
      
      actualPos.y += cycle;
      
      float angle = h * 6.28318;
      actualPos.x += cos(angle) * cycle * 0.15;
      actualPos.z += sin(angle) * cycle * 0.15;
      
      vAntigravityFade = 1.0 - (cycle / driftHeight);
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(actualPos, 1.0);
  #else
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  #endif

  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = `
#include <common>
#include <color_pars_fragment>

uniform vec3 uGlobalTint;
uniform float uOpacity;

varying float vAntigravityFade;

void main() {
  vec4 diffuseColor = vec4(1.0);
  
  #include <color_fragment>
  
  diffuseColor.rgb *= uGlobalTint;
  
  gl_FragColor = vec4(diffuseColor.rgb, diffuseColor.a * uOpacity * vAntigravityFade);
}
`;

export function SpiralGalaxy({
  focusedAgent,
  agentPositionsRef,
  theme,
}: {
  focusedAgent: string | null;
  agentPositionsRef?: React.MutableRefObject<THREE.Vector3[]>;
  theme?: 'dark' | 'light';
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const count = 40000;
  const numArms = 8;

  // ─── REF DE TEMA ──────────────────────────────────────────────────────────
  // Usamos uma ref para acessar o tema atual dentro do useFrame sem
  // stale closure e sem precisar recriar uniforms ou re-rodar effects.
  const themeRef = useRef<'dark' | 'light'>(theme ?? 'dark');
  themeRef.current = theme ?? 'dark'; // atualiza a cada render

  // Geometria otimizada: IcosahedronGeometry(0) = 12 verts, 20 faces
  const particleGeo = useMemo(() => new THREE.IcosahedronGeometry(0.018, 0), []);

  // Cor alvo mutável — reutilizada a cada frame para lerp (zero alocação)
  const targetColor = useMemo(() => new THREE.Color('#ffffff'), []);

  // ─── UNIFORMS SEMPRE ESTÁVEIS (deps []) ───────────────────────────────────
  // CRÍTICO: NÃO adicionar dependências aqui.
  // Recriar uniforms causa rerenderização do ShaderMaterial pelo R3F, zerando
  // uAgentPositions → campo de força para de rastrear os agentes.
  const uniforms = useMemo(
    () => ({
      uGlobalTint:     { value: new THREE.Color('#ffffff') },
      uOpacity:        { value: 0.6 },
      uTime:           { value: 0 },
      uMousePos:       { value: new THREE.Vector3(9999, 9999, 9999) },
      uAgentPositions: { value: Array.from({ length: 5 }, () => new THREE.Vector3()) },
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ─── POSICIONAMENTO E COR BASE (apenas na montagem) ───────────────────────
  // CRÍTICO: NÃO incluir `theme` nas deps.
  // Incluir theme re-rodaria os 40k Math.random(), reembaralhando a galáxia
  // visualmente toda vez que o usuário troca de tema.
  // A cor base é SEMPRE branca — uGlobalTint e blending controlam a aparência.
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    if (!meshRef.current.instanceColor) {
      meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(count * 3),
        3
      );
    }

    const tempObj = new THREE.Object3D();
    const coreRadius = 0.1;
    const maxRadius = 16.0;

    for (let i = 0; i < count; i++) {
      const isSpine = Math.random() > 0.3;
      const t = Math.pow(Math.random(), 1.5);
      const radius = coreRadius + t * maxRadius;
      const angleTwist = t * Math.PI * 2 * 3.5;
      const spreadMultiplier = 0.06 + Math.pow(t, 2.0) * 2.5;

      let armOffset = 0;
      let noiseX = 0;
      let noiseZ = 0;
      let scale = 1.0;
      let opacityMult = 1.0;

      if (isSpine) {
        armOffset = (i % numArms) * ((Math.PI * 2) / numArms);
        noiseX = (Math.random() - 0.5) * spreadMultiplier;
        noiseZ = (Math.random() - 0.5) * spreadMultiplier;
        scale = 1.5 + Math.random() * 1.5;
        opacityMult = 1.0;
      } else {
        const baseArmOffset = (i % numArms) * ((Math.PI * 2) / numArms);
        const angleSpread = t * Math.PI * 2;
        armOffset = baseArmOffset + (Math.random() - 0.5) * angleSpread;
        const spread = spreadMultiplier * 1.8;
        noiseX = (Math.random() - 0.5) * spread;
        noiseZ = (Math.random() - 0.5) * spread;
        scale = 0.2 + Math.random() * 0.4;
        opacityMult = 0.45;
      }

      const finalAngle = angleTwist + armOffset;
      const x = Math.cos(finalAngle) * radius + noiseX;
      const z = Math.sin(finalAngle) * radius + noiseZ;
      const noiseY = (Math.random() - 0.5) * 0.15;

      tempObj.position.set(x, noiseY, z);
      tempObj.scale.setScalar(scale);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);

      // Cor base SEMPRE branca — uGlobalTint × branco = uGlobalTint.
      // AdditiveBlending (dark mode): soma tint ao fundo escuro → visível ✓
      // NormalBlending  (light mode): blend normal com alpha → visível ✓
      const baseColor = new THREE.Color(0xffffff).multiplyScalar(opacityMult);
      if (t < 0.25) baseColor.setHex(0xffffff); // núcleo ultra-brilhante
      meshRef.current.setColorAt(i, baseColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, numArms]); // ← sem theme: galáxia nunca é reembaralhada

  useFrame((state, delta) => {
    // Lê o tema atual via ref (sem stale closure, sem dependência no hook)
    const isLight = themeRef.current === 'light';

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
    }

    if (materialRef.current) {
      const mat = materialRef.current;

      // ── BLENDING DINÂMICO ──────────────────────────────────────────────────
      // AdditiveBlending (dark): partículas brilhantes se somam ao fundo escuro ✓
      // NormalBlending  (light): partículas semi-transparentes sobre fundo claro ✓
      // AdditiveBlending + cor escura + fundo branco = SOMA ZERO = invisível ✗
      const wantedBlending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      if (mat.blending !== wantedBlending) {
        mat.blending = wantedBlending;
        mat.needsUpdate = true; // força GPU a recompilar estado de blending
      }

      // ── OPACIDADE DINÂMICA ─────────────────────────────────────────────────
      const wantedOpacity = isLight ? 0.55 : 0.6;

      // ── COR TINT ALVO ──────────────────────────────────────────────────────
      // dark  + sem agente: branco    → multiplicação neutra (AdditiveBlending)
      // light + sem agente: #0f172a   → partículas escuras visíveis sobre claro
      // qualquer + agente focado: cor do agente (ChromaticShift)
      const neutralTint = isLight ? '#0f172a' : '#ffffff';
      const targetHex = focusedAgent ? AGENT_COLORS[focusedAgent] : neutralTint;
      targetColor.set(targetHex);

      const u = mat.uniforms;
      if (u) {
        // Lerp suave de cor (≈ 0.5s de transição a 60fps)
        if (u.uGlobalTint?.value) {
          u.uGlobalTint.value.lerp(targetColor, 0.08);
        }
        // Lerp suave de opacidade
        if (u.uOpacity) {
          u.uOpacity.value = THREE.MathUtils.lerp(u.uOpacity.value, wantedOpacity, 0.05);
        }
        if (u.uTime) {
          u.uTime.value = state.clock.getElapsedTime();
        }

        // ── SINCRONIA COM POSIÇÕES DOS AGENTES ────────────────────────────────
        if (u.uAgentPositions?.value && agentPositionsRef?.current && meshRef.current) {
          for (let i = 0; i < 5; i++) {
            const localPos = agentPositionsRef.current[i].clone();
            meshRef.current.worldToLocal(localPos);
            u.uAgentPositions.value[i].copy(localPos);
          }
        }

        // ── CURSOR DO MOUSE NO PLANO LOCAL DA GALÁXIA ────────────────────────
        if (u.uMousePos?.value && meshRef.current) {
          const rayLocal = state.raycaster.ray.clone();
          const invMat = new THREE.Matrix4().copy(meshRef.current.matrixWorld).invert();
          rayLocal.applyMatrix4(invMat);
          const localPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const intersectPoint = new THREE.Vector3();
          if (rayLocal.intersectPlane(localPlane, intersectPoint)) {
            u.uMousePos.value.copy(intersectPoint);
          } else {
            u.uMousePos.value.set(9999, 9999, 9999);
          }
        }
      }
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[particleGeo, undefined, count]}
      castShadow={false}
      receiveShadow={false}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent={true}
        blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
        vertexColors={true}
      />
    </instancedMesh>
  );
}