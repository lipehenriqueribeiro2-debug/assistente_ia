import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────
   Mapa de cores dos agentes (espelha App.tsx)
───────────────────────────────────────────── */
const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727',
  est: '#0066ff',
  rpg: '#b829ff',
  hw:  '#25ced1',
  pow: '#ffaa00',
};

const DEFAULT_COLOR = '#25ced1';

interface TrailDot {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

interface CustomCursorProps {
  focusedAgent: string | null;
}

export function CustomCursor({ focusedAgent }: CustomCursorProps) {
  const outerRef  = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  const posRef     = useRef({ x: -200, y: -200 });
  const targetRef  = useRef({ x: -200, y: -200 });
  const rafRef     = useRef<number>(0);
  const trailTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'click' | 'drag'>('default');
  const [trailDots, setTrailDots]     = useState<TrailDot[]>([]);
  const [isVisible, setIsVisible]     = useState(false);
  const dotIdRef = useRef(0);

  /* ── Cor reativa ao agente focado ── */
  const accentColor = focusedAgent ? (AGENT_COLORS[focusedAgent] ?? DEFAULT_COLOR) : DEFAULT_COLOR;

  /* ── Smooth-follow com lerp via rAF ── */
  const animate = useCallback(() => {
    const lerpFactor = cursorState === 'hover' ? 0.14 : 0.10;
    posRef.current.x += (targetRef.current.x - posRef.current.x) * lerpFactor;
    posRef.current.y += (targetRef.current.y - posRef.current.y) * lerpFactor;

    const { x, y } = posRef.current;
    const translate = `translate(${x}px, ${y}px)`;

    if (outerRef.current)   outerRef.current.style.transform  = translate;
    if (innerRef.current)   innerRef.current.style.transform  = translate;
    if (glowRef.current)    glowRef.current.style.transform   = translate;
    if (reticleRef.current) reticleRef.current.style.transform = translate;

    rafRef.current = requestAnimationFrame(animate);
  }, [cursorState]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  /* ── Trail de partículas ── */
  const spawnTrail = useCallback(() => {
    const { x, y } = targetRef.current;
    const id = ++dotIdRef.current;
    setTrailDots(prev => [
      ...prev.slice(-12),
      { id, x, y, opacity: 0.55, scale: 0.45 },
    ]);
    setTimeout(() => {
      setTrailDots(prev => prev.filter(d => d.id !== id));
    }, 380);
  }, []);

  /* ── Event handlers ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (el) {
        const isClickable = el.closest('button, a, [role="button"], [data-cursor="pointer"], label, select, input, textarea, [tabindex]');
        const isDragging  = e.buttons === 1;
        if (isDragging)          setCursorState('drag');
        else if (isClickable)    setCursorState('hover');
        else                     setCursorState('default');
      }
    };

    const onDown = () => setCursorState('click');
    const onUp   = () => setCursorState(prev => prev === 'click' ? 'default' : prev);
    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener('mousemove',  onMove,  { passive: true });
    window.addEventListener('mousedown',  onDown);
    window.addEventListener('mouseup',    onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [isVisible]);

  /* ── Trail timer ── */
  useEffect(() => {
    if (trailTimer.current) clearInterval(trailTimer.current);
    if (cursorState === 'drag' || cursorState === 'hover') {
      trailTimer.current = setInterval(spawnTrail, 35);
    }
    return () => { if (trailTimer.current) clearInterval(trailTimer.current); };
  }, [cursorState, spawnTrail]);

  /* ── Esconde cursor nativo ── */
  useEffect(() => {
    document.documentElement.style.cursor = 'none';
    return () => { document.documentElement.style.cursor = ''; };
  }, []);

  /* ── Dimensões por estado ── */
  const outerSize  = cursorState === 'hover' ? 44 : cursorState === 'click' ? 28 : 36;
  const innerSize  = cursorState === 'click' ? 5  : 4;
  const glowSize   = cursorState === 'hover' ? 90 : cursorState === 'click' ? 50 : 70;
  const showReticle = cursorState === 'hover';

  /* ── Opacidade global ── */
  const globalOpacity = isVisible ? 1 : 0;

  return (
    <>
      {/* ── Estilo global para suprimir cursor nativo ── */}
      <style>{`
        *, *::before, *::after { cursor: none !important; }

        @media (prefers-reduced-motion: reduce) {
          .cursor-outer, .cursor-inner, .cursor-glow, .cursor-reticle {
            transition: none !important;
          }
        }
      `}</style>

      {/* ── Trail Dots ── */}
      {trailDots.map((dot, i) => (
        <div
          key={dot.id}
          style={{
            position:     'fixed',
            top:           0,
            left:          0,
            width:         6,
            height:        6,
            borderRadius:  '50%',
            background:    accentColor,
            opacity:       dot.opacity * ((i + 1) / trailDots.length),
            transform:     `translate(${dot.x - 3}px, ${dot.y - 3}px) scale(${dot.scale})`,
            pointerEvents: 'none',
            zIndex:        99996,
            transition:    'opacity 0.38s ease, transform 0.38s ease',
            boxShadow:     `0 0 6px ${accentColor}`,
            willChange:    'transform, opacity',
          }}
        />
      ))}

      {/* ── Glow halo (camada mais externa, deslocada) ── */}
      <div
        ref={glowRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         glowSize,
          height:        glowSize,
          marginLeft:   -(glowSize / 2),
          marginTop:    -(glowSize / 2),
          borderRadius:  '50%',
          background:    `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex:        99997,
          opacity:       globalOpacity * 0.8,
          transition:    `width 0.35s cubic-bezier(.4,0,.2,1),
                          height 0.35s cubic-bezier(.4,0,.2,1),
                          margin 0.35s cubic-bezier(.4,0,.2,1),
                          background 0.5s ease,
                          opacity 0.3s ease`,
          willChange:    'transform',
        }}
      />

      {/* ── Anel externo (HUD ring) ── */}
      <div
        ref={outerRef}
        className="cursor-outer"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         outerSize,
          height:        outerSize,
          marginLeft:   -(outerSize / 2),
          marginTop:    -(outerSize / 2),
          borderRadius:  '50%',
          border:        `1.5px solid ${accentColor}`,
          boxShadow:     `0 0 10px ${accentColor}88, inset 0 0 6px ${accentColor}22`,
          pointerEvents: 'none',
          zIndex:        99998,
          opacity:       globalOpacity,
          transition:    `width 0.25s cubic-bezier(.4,0,.2,1),
                          height 0.25s cubic-bezier(.4,0,.2,1),
                          margin 0.25s cubic-bezier(.4,0,.2,1),
                          border-color 0.5s ease,
                          box-shadow 0.5s ease,
                          opacity 0.3s ease`,
          willChange:    'transform',
        }}
      >
        {/* Marcadores de canto estilo HUD (crosshair corners) */}
        {['topLeft','topRight','bottomLeft','bottomRight'].map(corner => (
          <div
            key={corner}
            style={{
              position:   'absolute',
              width:      7,
              height:     7,
              borderColor: accentColor,
              borderStyle: 'solid',
              opacity:     cursorState === 'hover' ? 1 : 0,
              transition:  'opacity 0.2s ease, border-color 0.5s ease',
              ...(corner === 'topLeft'     && { top: -1, left: -1,  borderWidth: '1.5px 0 0 1.5px', borderRadius: '2px 0 0 0' }),
              ...(corner === 'topRight'    && { top: -1, right: -1, borderWidth: '1.5px 1.5px 0 0', borderRadius: '0 2px 0 0' }),
              ...(corner === 'bottomLeft'  && { bottom: -1, left: -1,  borderWidth: '0 0 1.5px 1.5px', borderRadius: '0 0 0 2px' }),
              ...(corner === 'bottomRight' && { bottom: -1, right: -1, borderWidth: '0 1.5px 1.5px 0', borderRadius: '0 0 2px 0' }),
            }}
          />
        ))}
      </div>

      {/* ── Ponto interno (dot central) ── */}
      <div
        ref={innerRef}
        className="cursor-inner"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         innerSize,
          height:        innerSize,
          marginLeft:   -(innerSize / 2),
          marginTop:    -(innerSize / 2),
          borderRadius:  '50%',
          background:    accentColor,
          boxShadow:     `0 0 8px ${accentColor}, 0 0 16px ${accentColor}66`,
          pointerEvents: 'none',
          zIndex:        99999,
          opacity:       globalOpacity,
          transition:    `width 0.2s ease,
                          height 0.2s ease,
                          margin 0.2s ease,
                          background 0.5s ease,
                          box-shadow 0.5s ease,
                          opacity 0.3s ease`,
          willChange:    'transform',
        }}
      />

      {/* ── Reticle: cruz de scan estilo HUD (visível no hover) ── */}
      <div
        ref={reticleRef}
        className="cursor-reticle"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         20,
          height:        20,
          marginLeft:    -10,
          marginTop:     -10,
          pointerEvents: 'none',
          zIndex:        99998,
          opacity:       showReticle ? globalOpacity * 0.6 : 0,
          transition:    'opacity 0.2s ease',
          willChange:    'transform',
        }}
      >
        {/* Linha horizontal */}
        <div style={{
          position:   'absolute',
          top:        '50%',
          left:       '50%',
          width:      18,
          height:     1,
          marginLeft: -9,
          marginTop:  -0.5,
          background: accentColor,
        }} />
        {/* Linha vertical */}
        <div style={{
          position:   'absolute',
          top:        '50%',
          left:       '50%',
          width:      1,
          height:     18,
          marginLeft: -0.5,
          marginTop:  -9,
          background: accentColor,
        }} />
      </div>
    </>
  );
}
