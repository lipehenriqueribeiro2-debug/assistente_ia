import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMicrophone } from './hooks/useMicrophone';
import { AiCore } from './components/AiCore';
import { OrbitalCarousel } from './components/OrbitalCarousel';
import { RepulsionGrid } from './components/RepulsionGrid';
import { OverlayUI } from './components/OverlayUI';
import { Header } from './components/Header';
import { CommandBar } from './components/CommandBar';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomCursor } from './components/CustomCursor';

const MODULE_ENTRIES = [
  { key: 'infra', title: 'INFRA & AUTOMAÇÃO', aura: '#6b7280' },
  { key: 'estudos', title: 'ESTUDOS UFBA', aura: '#6b7280' },
  { key: 'rpg', title: 'RPG & CAMPANHAS', aura: '#6b7280' },
  { key: 'hardware', title: 'HARDWARE & SISTEMA', aura: '#6b7280' },
  { key: 'potencia', title: 'SISTEMAS DE POTÊNCIA', aura: '#6b7280' },
];

function CameraController() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);
  }, []);
  return null;
}

function Stage({ stagePos, stageRot, children }: { stagePos: React.MutableRefObject<THREE.Vector3>; stageRot: React.MutableRefObject<THREE.Euler>; children: React.ReactNode }) {
  const masterRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!masterRef.current) return;
    masterRef.current.position.lerp(stagePos.current, 0.015);
    masterRef.current.rotation.x = THREE.MathUtils.lerp(masterRef.current.rotation.x, stageRot.current.x, 0.015);
    masterRef.current.rotation.y = THREE.MathUtils.lerp(masterRef.current.rotation.y, stageRot.current.y, 0.015);
    masterRef.current.rotation.z = THREE.MathUtils.lerp(masterRef.current.rotation.z, stageRot.current.z, 0.015);
  });

  return <group ref={masterRef} scale={1.25}>{children}</group>;
}

const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727', // Crimson
  est: '#0066ff', // Cobalto
  rpg: '#b829ff', // Magenta
  hw: '#25ced1',  // Ciano
  pow: '#ffaa00', // Ouro
};

function App() {
  const [bootState, setBootState] = useState<'booting' | 'ready'>('booting');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeView, setActiveView] = useState<'orbital' | 'chat'>('orbital');
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [focusedAgent, setFocusedAgent] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const focusedPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const orbitTilt = useMemo(() => new THREE.Euler(Math.PI / 5, 0, -Math.PI / 8), []);
  const stagePos = useRef(new THREE.Vector3(0, 0, 0));
  const stageRot = useRef(new THREE.Euler(0, 0, 0));
  const { audioVolumeRef, startListening, stopListening } = useMicrophone();
 
  // Inicializa o microfone automaticamente na inicialização da aplicação
  useEffect(() => {
    const initMic = async () => {
      try {
        await startListening();
        setIsListening(true);
      } catch (err) {
        console.error("Erro ao inicializar o microfone automaticamente:", err);
      }
    };
    initMic();
  }, [startListening]);
 
  const closeCommandBar = useCallback(() => setCommandBarOpen(false), []);
 
  const handleBootComplete = useCallback(() => {
    setBootState('ready');
    stagePos.current.set(5.5, 0.5, -3.0);
    stageRot.current.set(Math.PI / 6, 0, -Math.PI / 16);
  }, []);
 
  const handleAgentClick = useCallback((id: string, index: number) => {
    setFocusedAgent((prev) => (prev === id ? null : id));
  }, []);
 
  const handleToggleView = useCallback(() => {
    setActiveView((prev) => {
      const next = prev === 'orbital' ? 'chat' : 'orbital';
      if (next === 'chat') {
        stopListening();
        setIsListening(false);
      }
      return next;
    });
  }, [stopListening]);
 
  const handleToggleMic = useCallback(() => {
    setIsListening((prev) => {
      if (prev) { stopListening(); return false; }
      startListening();
      return true;
    });
  }, [startListening, stopListening]);
 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (activeView === 'chat') { setActiveView('orbital'); return; }
        if (focusedAgent) { setFocusedAgent(null); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, focusedAgent]);
 
  const activeColor = focusedAgent ? AGENT_COLORS[focusedAgent] : '#f8fafc';
  const activeColorGlow = focusedAgent ? `${AGENT_COLORS[focusedAgent]}22` : '#f8fafc08';
 
  const themeVars = theme === 'dark' ? {
    '--bg-app': '#0b1120',
    '--bg-card': 'rgba(255, 255, 255, 0.04)',
    '--bg-card-solid': 'rgba(15, 23, 42, 0.85)',
    '--border-card': 'rgba(255, 255, 255, 0.12)',
    '--text-white': '#ffffff',
    '--text-primary': '#f8fafc',
    '--text-secondary': 'rgba(255, 255, 255, 0.45)',
    '--text-muted': 'rgba(255, 255, 255, 0.3)',
    '--bg-header': 'rgba(15, 23, 42, 0.35)',
    '--border-header': 'rgba(255, 255, 255, 0.08)',
    '--chat-bg': 'rgba(7, 11, 22, 0.96)',
    '--chat-border': 'rgba(255, 255, 255, 0.08)',
    '--glass-blur': '24px',
    '--item-bg': 'rgba(0, 0, 0, 0.15)',
    '--item-border': 'rgba(255, 255, 255, 0.03)',
    '--shadow-card': '0 20px 40px rgba(0, 0, 0, 0.35)',
    '--chat-shadow': '0 30px 70px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
  } : {
    '--bg-app': '#f1f5f9',
    '--bg-card': 'rgba(255, 255, 255, 0.75)',
    '--bg-card-solid': 'rgba(255, 255, 255, 0.92)',
    '--border-card': 'rgba(15, 23, 42, 0.12)',
    '--text-white': '#0f172a',
    '--text-primary': '#1e293b',
    '--text-secondary': '#475569',
    '--text-muted': '#94a3b8',
    '--bg-header': 'rgba(255, 255, 255, 0.65)',
    '--border-header': 'rgba(15, 23, 42, 0.1)',
    '--chat-bg': 'rgba(255, 255, 255, 0.98)',
    '--chat-border': 'rgba(15, 23, 42, 0.12)',
    '--glass-blur': '30px',
    '--item-bg': 'rgba(15, 23, 42, 0.04)',
    '--item-border': 'rgba(15, 23, 42, 0.05)',
    '--shadow-card': '0 20px 40px rgba(15, 23, 42, 0.08)',
    '--chat-shadow': '0 30px 70px rgba(15, 23, 42, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.6)',
  };
 
  return (
    <>
    <CustomCursor focusedAgent={focusedAgent} />
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative', 
        overflow: 'hidden', 
        background: 'var(--bg-app)', 
        pointerEvents: 'none',
        '--primary': activeColor,
        '--primary-glow': activeColorGlow,
        ...themeVars,
      } as React.CSSProperties}
    >
      {/* Aurora Background premium, dinâmico e vívido */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: focusedAgent ? 0.95 : 0.45,
          filter: 'blur(110px)',
          transition: 'opacity 1.2s ease, filter 1.2s ease',
        }}
      >
        {/* Blob 1: Cor Principal (segue a cor do subagente) */}
        <motion.div
          animate={{
            x: [0, 90, -70, 0],
            y: [0, -100, 60, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '25%',
            left: '20%',
            width: '42vw',
            height: '42vw',
            borderRadius: '50%',
            background: focusedAgent ? `${activeColor}2d` : 'rgba(37, 206, 209, 0.08)',
            transition: 'background 1.5s ease',
          }}
        />
 
        {/* Blob 2: Cor Complementar */}
        <motion.div
          animate={{
            x: [0, -110, 80, 0],
            y: [0, 70, -90, 0],
            scale: [1, 0.85, 1.25, 1],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '48vw',
            height: '48vw',
            borderRadius: '50%',
            background: focusedAgent ? `${activeColor}1b` : 'rgba(184, 41, 255, 0.06)',
            transition: 'background 1.8s ease',
          }}
        />
 
        {/* Blob 3: Centro Luminoso Pulsante */}
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, 40, 40, 0],
            scale: [1.1, 0.9, 1.15, 1.1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '45%',
            left: '40%',
            transform: 'translate(-50%, -50%)',
            width: '38vw',
            height: '38vw',
            borderRadius: '50%',
            background: focusedAgent ? `${activeColor}26` : 'rgba(0, 102, 255, 0.05)',
            transition: 'background 1.2s ease',
          }}
        />
      </div>
      <div data-tauri-drag-region style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 28, zIndex: 100, pointerEvents: 'auto' }} />
 
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Canvas 
          dpr={[1, 2]} 
          gl={{ alpha: true }} 
          camera={{ position: [0, 0, 18], fov: 45 }}
          style={{ pointerEvents: 'auto' }}
        >
          <ambientLight intensity={theme === 'dark' ? 0.8 : 1.4} />
          <directionalLight position={[10, 10, 10]} intensity={theme === 'dark' ? 2 : 3.5} />
          <CameraController />
          {bootState === 'ready' && <RepulsionGrid />}
          <Stage stagePos={stagePos} stageRot={stageRot}>
            <Suspense fallback={null}>
              <AiCore audioVolumeRef={audioVolumeRef} bootState={bootState} onBootComplete={handleBootComplete} focusedAgent={focusedAgent} isListening={isListening} />
            </Suspense>
            {bootState === 'ready' && (
              <Suspense fallback={null}>
                <OrbitalCarousel focusedAgent={focusedAgent} onAgentClick={handleAgentClick} focusedPos={focusedPos} orbitTilt={orbitTilt} stagePos={stagePos} stageRot={stageRot} theme={theme} />
              </Suspense>
            )}
          </Stage>
        </Canvas>
        {bootState === 'ready' && (
          <OverlayUI focusedAgent={focusedAgent} onSelectAgent={setFocusedAgent} onClose={() => setFocusedAgent(null)} activeView={activeView} theme={theme} />
        )}
      </div>
 
      {bootState === 'ready' && (
        <Header activeView={activeView} onToggleView={handleToggleView} isListening={isListening} onToggleMic={handleToggleMic} theme={theme} onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} focusedAgent={focusedAgent} />
      )}

      {bootState === 'ready' && (
        <CommandBar
          isOpen={commandBarOpen}
          onClose={closeCommandBar}
          modules={MODULE_ENTRIES}
          theme={theme}
          onSelect={(key) => {
            const KEY_TO_ID: Record<string, string> = {
              infra: 'orq',
              estudos: 'est',
              rpg: 'rpg',
              hardware: 'hw',
              potencia: 'pow',
            };
            const agentId = KEY_TO_ID[key];
            if (agentId) {
              setFocusedAgent(agentId);
            }
          }}
        />
      )}
    </div>
    </>
  );
}

export default App;
