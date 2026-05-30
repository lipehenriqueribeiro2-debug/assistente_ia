import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import { Bloom } from './components/BloomEffect';
import { OrbitalCarousel } from './components/OrbitalCarousel';
import { CommandBar, type ModuleEntry } from './components/CommandBar';
import { useSimulatedAudio } from './hooks/useSimulatedAudio';
import { useTauriBackend } from './hooks/useTauriBackend';

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.round(Math.max(0, Math.min(255, n)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

function lerpColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

const NEUTRAL_AURA = '#3e3e4d';

function useColorMorph(target: string): string {
  const [color, setColor] = useState(target);
  const fromRef = useRef(target);
  const targetRef = useRef(target);
  const startRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (target === targetRef.current) return;
    fromRef.current = color;
    targetRef.current = target;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - startRef.current) / 1200, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setColor(lerpColor(fromRef.current, targetRef.current, eased));
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return color;
}

const MODULES: Record<string, { title: string; aura: string; mono?: boolean }> = {
  orquestracao: {
    title: 'Infra & Automação',
    aura: '#a92727',
    mono: true,
  },
  estudos: {
    title: 'Sistemas de Potência',
    aura: '#0066ff',
  },
  spotifySync: {
    title: 'Controle de Mídia',
    aura: '#b829ff',
    mono: true,
  },
};

const MODULE_ENTRIES: ModuleEntry[] = Object.keys(MODULES).map((key) => ({
  key,
  title: MODULES[key].title,
  aura: MODULES[key].aura,
}));

const MODULE_KEYS = Object.keys(MODULES);

function App() {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>(
    Object.fromEntries(MODULE_KEYS.map((k) => [k, false]))
  );
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(rawY, { stiffness: 120, damping: 20 });

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useMotionValueEvent(smoothX, 'change', (v) => setMouseX(v));
  useMotionValueEvent(smoothY, 'change', (v) => setMouseY(v));

  const handleMouseMove = useMemo(() => (e: React.MouseEvent) => {
    rawX.set((e.clientX / window.innerWidth) * 2 - 1);
    rawY.set(-(e.clientY / window.innerHeight) * 2 + 1);
  }, [rawX, rawY]);

  const bass = useSimulatedAudio();
  const { logs, sendCommand: tauriSendCommand } = useTauriBackend();
  const reducedMotion = useReducedMotion();

  const closeCommandBar = useCallback(() => setCommandBarOpen(false), []);

  const handleSendCommand = useCallback((command: string) => {
    const lower = command.toLowerCase();
    const targetKey = lower.includes('infra') || lower.includes('automacao') || lower.includes('pipeline')
      ? 'orquestracao'
      : lower.includes('estudo') || lower.includes('potencia') || lower.includes('academico')
      ? 'estudos'
      : lower.includes('musica') || lower.includes('midia') || lower.includes('spotify') || lower.includes('audio')
      ? 'spotifySync'
      : 'orquestracao';

    setOpenModals((prev) => ({ ...prev, [targetKey]: true }));
    tauriSendCommand(command);
  }, [tauriSendCommand]);

  const navigateToModule = useCallback((key: string) => {
    setOpenModals((prev) => ({ ...prev, [key]: true }));
  }, []);

  const closeAllPanels = useCallback(() => {
    setOpenModals((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) next[k] = false;
      return next;
    });
  }, []);

  const anyPanelOpen = Object.values(openModals).some(Boolean);

  const activeKey = useMemo(
    () => Object.entries(openModals).find(([, v]) => v)?.[0] ?? null,
    [openModals]
  );

  const targetColor = activeKey ? MODULES[activeKey].aura : NEUTRAL_AURA;
  const morphColor = useColorMorph(targetColor);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (anyPanelOpen) {
          closeAllPanels();
        } else {
          setCommandBarOpen((prev) => !prev);
        }
      }
      if (e.key === 'Escape' && anyPanelOpen) {
        closeAllPanels();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anyPanelOpen, closeAllPanels]);

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ '--primary': morphColor, width: '100vw', height: '100vh', background: 'var(--canvas-night)', position: 'relative', overflow: 'hidden' } as React.CSSProperties}
    >
      <div data-tauri-drag-region style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 28, zIndex: 100 }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas dpr={[1, 2]} gl={{ alpha: true }} camera={{ position: [0, 0, 12], fov: 50 }}>
          <color attach="background" args={['#06090f']} />
          <ambientLight intensity={0.2} />

          <Suspense fallback={null}>
            <OrbitalCarousel
              modules={MODULE_ENTRIES}
              activeKey={activeKey}
              logs={logs}
              color={morphColor}
              mouseX={mouseX}
              mouseY={mouseY}
              bass={bass}
              reducedMotion={reducedMotion}
            />
          </Suspense>

          <Bloom threshold={1.2} intensity={1.5} />
        </Canvas>
      </div>

      <CommandBar
        isOpen={commandBarOpen}
        onClose={closeCommandBar}
        modules={MODULE_ENTRIES}
        onSelect={navigateToModule}
        onSendCommand={handleSendCommand}
      />
    </div>
  );
}

export default App;
