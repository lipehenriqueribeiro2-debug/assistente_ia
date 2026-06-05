import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727', // Crimson
  est: '#0066ff', // Cobalto
  rpg: '#b829ff', // Magenta
  hw: '#25ced1',  // Ciano
  pow: '#ffaa00', // Ouro
};

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ width: '100%', height: 5, background: 'var(--item-bg)', border: '1px solid var(--item-border)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{ height: '100%', background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}` }}
    />
  </div>
);

export function SystemMonitorPanel({ focusedAgent, theme = 'dark' }: { focusedAgent: string | null; theme?: 'dark' | 'light' }) {
  const [cpu, setCpu] = useState(24);
  const [gpu, setGpu] = useState(38);
  const [mem, setMem] = useState(4.25);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((prev) => Math.max(15, Math.min(85, +(prev + (Math.random() - 0.5) * 8).toFixed(1))));
      setGpu((prev) => Math.max(20, Math.min(90, +(prev + (Math.random() - 0.5) * 6).toFixed(1))));
      setMem((prev) => Math.max(3.8, Math.min(5.5, +(prev + (Math.random() - 0.5) * 0.1).toFixed(2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /* scan-line animada a cada 80ms */
  useEffect(() => {
    const id = setInterval(() => setScanLine(p => (p + 1) % 100), 80);
    return () => clearInterval(id);
  }, []);

  const activeColor = focusedAgent ? (AGENT_COLORS[focusedAgent] ?? '#25ced1') : '#25ced1';

  return (
    <div
      style={{
        width: '20rem',
        position: 'relative',
        /* HUD/CRT Glass layer & Dotted grid matrix responsivo */
        background: `
          repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
          radial-gradient(circle at 50% 50%, var(--bg-card) 0%, var(--bg-card-solid) 100%)
        `,
        backdropFilter: 'blur(36px)',
        WebkitBackdropFilter: 'blur(36px)',
        border: `1px solid ${activeColor}${theme === 'light' ? '40' : '33'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        color: 'var(--text-primary)',
        boxShadow: `
          0 0 0 1px ${activeColor}${theme === 'light' ? '08' : '0f'},
          0 0 40px ${activeColor}${theme === 'light' ? '06' : '10'},
          var(--shadow-card),
          inset 0 1px 0 ${theme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.05)'}
        `,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* ── Linha de scan dinâmica e decorativa responsiva ── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        `${scanLine}%`,
          left:       0,
          right:      0,
          height:     1,
          background: `linear-gradient(90deg, transparent, ${activeColor}${theme === 'light' ? '0f' : '20'}, transparent)`,
          pointerEvents: 'none',
          transition: 'top 0.08s linear, background 0.25s ease',
          zIndex:     1,
        }}
      />

      {/* ── Marcadores de canto dinâmicos (HUD corners) ── */}
      {(['tl','tr','bl','br'] as const).map(c => (
        <div
          key={c}
          aria-hidden="true"
          style={{
            position:    'absolute',
            width:       10,
            height:      10,
            pointerEvents: 'none',
            zIndex:      2,
            borderColor: `${activeColor}${theme === 'light' ? '90' : 'aa'}`,
            borderStyle: 'solid',
            transition:  'border-color 0.25s ease',
            ...(c === 'tl' && { top: 5, left: 5,   borderWidth: '1.5px 0 0 1.5px', borderRadius: '2px 0 0 0' }),
            ...(c === 'tr' && { top: 5, right: 5,  borderWidth: '1.5px 1.5px 0 0', borderRadius: '0 2px 0 0' }),
            ...(c === 'bl' && { bottom: 5, left: 5,  borderWidth: '0 0 1.5px 1.5px', borderRadius: '0 0 0 2px' }),
            ...(c === 'br' && { bottom: 5, right: 5, borderWidth: '0 1.5px 1.5px 0', borderRadius: '0 0 2px 0' }),
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {!focusedAgent ? (
          /* Renderização padrão da Home: CPU, GPU, MEM */
          <motion.div
            key="sys-default"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', position: 'relative', zIndex: 2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                [TELEMETRIA_CORE]
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#22c55e' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e', animation: 'pulse 1.5s infinite' }} />
                LIVE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Share Tech Mono", monospace', fontSize: 11 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>CPU LOAD</span>
                  <span style={{ color: '#25ced1', fontWeight: 600 }}>{cpu}%</span>
                </div>
                <ProgressBar value={cpu} color="#25ced1" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Share Tech Mono", monospace', fontSize: 11 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>MEM USAGE</span>
                  <span style={{ color: '#b829ff', fontWeight: 600 }}>{mem} GB / 16 GB</span>
                </div>
                <ProgressBar value={(mem / 16) * 100} color="#b829ff" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Share Tech Mono", monospace', fontSize: 11 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GPU ENGINE</span>
                  <span style={{ color: '#ffaa00', fontWeight: 600 }}>{gpu}%</span>
                </div>
                <ProgressBar value={gpu} color="#ffaa00" />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-header)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5 }}>
              <span style={{ color: 'var(--text-muted)' }}>RENDER_RATE</span>
              <span style={{ color: 'var(--text-white)' }}>60.0 FPS</span>
            </div>
          </motion.div>
        ) : (
          /* Renderizações contextuais dos subagentes */
          <motion.div
            key={`sys-${focusedAgent}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', position: 'relative', zIndex: 2 }}
          >
            {focusedAgent === 'orq' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                    [INFRA_HEALTH]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#a92727', fontWeight: 600 }}>
                    ORQ_TELEMETRIA
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 11, fontFamily: '"Share Tech Mono", monospace' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>PostgreSQL Carga</span>
                      <span style={{ color: '#a92727', fontWeight: 600 }}>14.2%</span>
                    </div>
                    <ProgressBar value={14.2} color="#a92727" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Redis Hit Rate</span>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>99.4%</span>
                    </div>
                    <ProgressBar value={99.4} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Nginx Load</span>
                      <span style={{ color: '#25ced1', fontWeight: 600 }}>8.5%</span>
                    </div>
                    <ProgressBar value={8.5} color="#25ced1" />
                  </div>
                </div>
              </>
            )}

            {focusedAgent === 'est' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                    [GRADE_ESTUDOS]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#0066ff', fontWeight: 600 }}>
                    EST_TELEMETRIA
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 11, fontFamily: '"Share Tech Mono", monospace' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Créditos Semanais</span>
                      <span style={{ color: '#0066ff', fontWeight: 600 }}>24 / 28 CR</span>
                    </div>
                    <ProgressBar value={(24 / 28) * 100} color="#0066ff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Presença Média</span>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>94.1%</span>
                    </div>
                    <ProgressBar value={94.1} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Tempo Dedicação</span>
                      <span style={{ color: '#b829ff', fontWeight: 600 }}>18.5h/sem</span>
                    </div>
                    <ProgressBar value={(18.5 / 25) * 100} color="#b829ff" />
                  </div>
                </div>
              </>
            )}

            {focusedAgent === 'rpg' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                    [PARTY_RESOURCES]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#b829ff', fontWeight: 600 }}>
                    RPG_TELEMETRIA
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 11, fontFamily: '"Share Tech Mono", monospace' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Marcelo (Guerreiro) HP</span>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>74 / 82</span>
                    </div>
                    <ProgressBar value={(74 / 82) * 100} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Ana (Maga) Spell Slots</span>
                      <span style={{ color: '#b829ff', fontWeight: 600 }}>3 / 4 (Nv.2)</span>
                    </div>
                    <ProgressBar value={(3 / 4) * 100} color="#b829ff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Carlos (Ladino) HP</span>
                      <span style={{ color: '#ffaa00', fontWeight: 600 }}>32 / 51</span>
                    </div>
                    <ProgressBar value={(32 / 51) * 100} color="#ffaa00" />
                  </div>
                </div>
              </>
            )}

            {focusedAgent === 'hw' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                    [CPU_CORES_TEMP]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#25ced1', fontWeight: 600 }}>
                    HW_TELEMETRIA
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 11, fontFamily: '"Share Tech Mono", monospace' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Core 0-3 (P-Cores)</span>
                      <span style={{ color: '#25ced1', fontWeight: 600 }}>67°C</span>
                    </div>
                    <ProgressBar value={67} color="#25ced1" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Core 4-7 (P-Cores)</span>
                      <span style={{ color: '#25ced1', fontWeight: 600 }}>65°C</span>
                    </div>
                    <ProgressBar value={65} color="#25ced1" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Core 8-15 (E-Cores)</span>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>48°C</span>
                    </div>
                    <ProgressBar value={48} color="#22c55e" />
                  </div>
                </div>
              </>
            )}

            {focusedAgent === 'pow' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                    [FLUXO_DE_FASES]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#ffaa00', fontWeight: 600 }}>
                    POW_TELEMETRIA
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 11, fontFamily: '"Share Tech Mono", monospace' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Fase A (Tens./Corrente)</span>
                      <span style={{ color: '#ffaa00', fontWeight: 600 }}>7.97kV/52A</span>
                    </div>
                    <ProgressBar value={85} color="#ffaa00" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Fase B (Tens./Corrente)</span>
                      <span style={{ color: '#ffaa00', fontWeight: 600 }}>7.95kV/51A</span>
                    </div>
                    <ProgressBar value={84} color="#ffaa00" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Fase C (Tens./Corrente)</span>
                      <span style={{ color: '#ffaa00', fontWeight: 600 }}>7.98kV/53A</span>
                    </div>
                    <ProgressBar value={86} color="#ffaa00" />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
