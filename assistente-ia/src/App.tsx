import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { AiCore } from './components/AiCore';
import { OrbitalCarousel } from './components/OrbitalCarousel';
import { OverlayUI } from './components/OverlayUI';
import { CommandBar } from './components/CommandBar';

const MODULE_ENTRIES = [
  { key: 'infra', title: 'INFRA & AUTOMAÇÃO', aura: '#6b7280' },
  { key: 'estudos', title: 'ESTUDOS UFBA', aura: '#6b7280' },
  { key: 'rpg', title: 'RPG & CAMPANHAS', aura: '#6b7280' },
  { key: 'hardware', title: 'HARDWARE & SISTEMA', aura: '#6b7280' },
];

function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, input.trim()]);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '30vw',
            minWidth: 350,
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(0,0,0,0.06)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#111827' }}>
              Aura Interface
            </span>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(0,0,0,0.05)', color: '#374151', padding: '12px 16px', borderRadius: 10, width: 'fit-content', maxWidth: '85%', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              Sistema Aura iniciado. Aguardando comandos de orquestração.
            </div>
            <div style={{ background: '#ffffff', color: '#111827', border: '1px solid rgba(0,0,0,0.08)', padding: '12px 16px', borderRadius: 10, width: 'fit-content', maxWidth: '85%', alignSelf: 'flex-end', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              Status dos sub-agentes.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Digite sua mensagem..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 100,
                  padding: '12px 44px 12px 18px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: '#111827',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6b7280', fontSize: 16, cursor: 'pointer', padding: '6px 8px' }}
              >
                ▶
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const ALIGNMENT_MAP: Record<string, { pos: [number, number, number]; rot: [number, number, number] }> = {
  orq: { pos: [3.2, -1.8, 1.5], rot: [0.05, -0.15, 0] },
  est: { pos: [2.8, -2.0, 1.2], rot: [0.02, -0.05, 0] },
  rpg: { pos: [3.8, -1.5, 0.8], rot: [0.08, -0.2, 0] },
  hw: { pos: [3.5, -2.2, 1.8], rot: [0.03, -0.1, 0] },
};

function CameraController() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, []);
  return null;
}

function Stage({ focusedAgent, children }: { focusedAgent: string | null; children: React.ReactNode }) {
  const stagePos = useRef(new THREE.Vector3(4.0, -0.5, -2.0));
  const stageRot = useRef(new THREE.Euler(Math.PI / 6, 0, -Math.PI / 16));
  const masterRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (focusedAgent && ALIGNMENT_MAP[focusedAgent]) {
      const target = ALIGNMENT_MAP[focusedAgent];
      stagePos.current.set(target.pos[0], target.pos[1], target.pos[2]);
      stageRot.current.set(target.rot[0], target.rot[1], target.rot[2]);
    } else {
      stagePos.current.set(4.0, -0.5, -2.0);
      stageRot.current.set(Math.PI / 6, 0, -Math.PI / 16);
    }
  }, [focusedAgent]);

  useFrame(() => {
    if (!masterRef.current) return;
    masterRef.current.position.lerp(stagePos.current, 0.05);
    masterRef.current.rotation.x = THREE.MathUtils.lerp(masterRef.current.rotation.x, stageRot.current.x, 0.05);
    masterRef.current.rotation.y = THREE.MathUtils.lerp(masterRef.current.rotation.y, stageRot.current.y, 0.05);
    masterRef.current.rotation.z = THREE.MathUtils.lerp(masterRef.current.rotation.z, stageRot.current.z, 0.05);
  });

  return <group ref={masterRef} scale={1.25}>{children}</group>;
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [focusedAgent, setFocusedAgent] = useState<string | null>(null);
  const focusedPos = useRef<THREE.Vector3>(new THREE.Vector3());

  const closeCommandBar = useCallback(() => setCommandBarOpen(false), []);

  const handleAgentClick = useCallback((id: string, index: number) => {
    setFocusedAgent((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (isChatOpen) { setIsChatOpen(false); return; }
        if (focusedAgent) { setFocusedAgent(null); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, focusedAgent]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#F5F5F7', position: 'relative', overflow: 'hidden' }}>
      <div data-tauri-drag-region style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 28, zIndex: 100 }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas dpr={[1, 2]} gl={{ alpha: true }} camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={['#F5F5F7']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={2} />
          <CameraController />
          <Stage focusedAgent={focusedAgent}>
            <Suspense fallback={null}>
              <AiCore />
            </Suspense>
            <Suspense fallback={null}>
              <OrbitalCarousel focusedAgent={focusedAgent} onAgentClick={handleAgentClick} focusedPos={focusedPos} />
            </Suspense>
          </Stage>
        </Canvas>
      </div>

      <OverlayUI focusedAgent={focusedAgent} onClose={() => setFocusedAgent(null)} />

      <motion.button
        onClick={() => setIsChatOpen((prev) => !prev)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: 'fixed',
            top: 40,
            right: 48,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 100,
            color: '#374151',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ marginLeft: 4 }}>Aura AI</span>
        </motion.button>

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <CommandBar
        isOpen={commandBarOpen}
        onClose={closeCommandBar}
        modules={MODULE_ENTRIES}
        onSelect={() => {}}
      />
    </div>
  );
}

export default App;
