import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTauriBackend } from '../hooks/useTauriBackend';

const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727', // Crimson
  est: '#0066ff', // Cobalto
  rpg: '#b829ff', // Magenta
  hw: '#25ced1',  // Ciano
  pow: '#ffaa00', // Ouro
};

export function BackendStatusPanel({ focusedAgent, theme = 'dark' }: { focusedAgent: string | null; theme?: 'dark' | 'light' }) {
  const { logs, connected } = useTauriBackend();
  const [scanLine, setScanLine] = useState(0);

  const recentLogs = useMemo(() => {
    const allLines: string[] = [];
    Object.entries(logs).forEach(([module, lines]) => {
      lines.forEach((line) => {
        allLines.push(`[${module.substring(0, 3).toUpperCase()}] ${line}`);
      });
    });

    if (allLines.length === 0) {
      return [
        "> [SYS] Kernel v2.11 carregado.",
        "> [OK] Conexão IPC estabelecida.",
        "> [DB] Sincronismo local ativo."
      ];
    }

    return allLines.slice(-3);
  }, [logs]);

  /* scan-line animada a cada 85ms */
  useEffect(() => {
    const id = setInterval(() => setScanLine(p => (p + 1) % 100), 85);
    return () => clearInterval(id);
  }, []);

  const activeColor = focusedAgent ? (AGENT_COLORS[focusedAgent] ?? '#25ced1') : '#25ced1';

  return (
    <div
      style={{
        width: '22rem',
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
        gap: '0.85rem',
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
          transition: 'top 0.085s linear, background 0.25s ease',
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
          /* Renderização padrão da Home */
          <motion.div
            key="back-default"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', position: 'relative', zIndex: 2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                [TAURI_BACKEND]
              </span>
              <span style={{ 
                fontFamily: '"Share Tech Mono", monospace', 
                fontSize: 9.5, 
                color: connected ? '#22c55e' : '#ffaa00', 
                fontWeight: 600 
              }}>
                {connected ? 'TAURI_OK' : 'OFFLINE_MODE'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: '"Share Tech Mono", monospace', fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>LATÊNCIA IPC</span>
                <span style={{ color: 'var(--text-white)' }}>4.1 ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>PORTA DEV</span>
                <span style={{ color: 'var(--text-white)' }}>5173</span>
              </div>
            </div>

            <div style={{
              background: 'var(--item-bg)',
              border: '1px solid var(--border-card)',
              borderRadius: 8,
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minHeight: '4.8rem',
            }}>
              <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 8, color: 'rgba(37, 206, 209, 0.65)', marginBottom: 2 }}>[LOG_FEED]</span>
              {recentLogs.map((log, index) => (
                <div 
                  key={index} 
                  style={{ 
                    fontFamily: '"Share Tech Mono", monospace', 
                    fontSize: 9.5, 
                    color: log.includes('ERR') || log.includes('WARN') ? '#ef4444' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Renderização contextual por agente */
          <motion.div
            key={`back-${focusedAgent}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', position: 'relative', zIndex: 2 }}
          >
            {focusedAgent === 'orq' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    [PREFECT_PIPELINE_LOGS]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#a92727', fontWeight: 600 }}>
                    LOGS
                  </span>
                </div>
                <div style={{
                  background: 'var(--item-bg)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  minHeight: '8rem',
                }}>
                  <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: 'var(--text-secondary)' }}>&gt; [11:24:02] Flow run 'epic-ape' started.</div>
                  <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#22c55e' }}>&gt; [11:24:05] Task 'db_backup' success.</div>
                  <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: 'var(--text-secondary)' }}>&gt; [11:24:08] Syncing storage bucket S3...</div>
                  <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#22c55e' }}>&gt; [11:24:12] Flow run finished successfully.</div>
                </div>
              </>
            )}

            {focusedAgent === 'est' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    [LEMBRETES_ACADÊMICOS]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#0066ff', fontWeight: 600 }}>
                    ANOTAÇÕES
                  </span>
                </div>
                <div style={{
                  background: 'var(--item-bg)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minHeight: '8rem',
                  fontSize: 10,
                  fontFamily: '"Share Tech Mono", monospace',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ borderLeft: '2.5px solid #0066ff', paddingLeft: 8 }}>
                    <div style={{ color: '#0066ff', fontSize: 8.5, fontWeight: 600 }}>TCC DATA LIMITE</div>
                    <div style={{ color: 'var(--text-white)' }}>Entregar revisão até 15/06.</div>
                  </div>
                  <div style={{ borderLeft: '2.5px solid #ffaa00', paddingLeft: 8 }}>
                    <div style={{ color: '#ffaa00', fontSize: 8.5, fontWeight: 600 }}>EXAME CONVERSÃO</div>
                    <div style={{ color: 'var(--text-white)' }}>Partida de MIT reator (Prova 2).</div>
                  </div>
                </div>
              </>
            )}

            {focusedAgent === 'rpg' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    [LOGS_DE_AÇÕES_RPG]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#b829ff', fontWeight: 600 }}>
                    LOGS
                  </span>
                </div>
                <div style={{
                  background: 'var(--item-bg)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  minHeight: '8rem',
                  fontSize: 9.5,
                  fontFamily: '"Share Tech Mono", monospace',
                  color: 'var(--text-secondary)'
                }}>
                  <div>&gt; Marcelo ataca Xanathar com Espada Grande.</div>
                  <div style={{ color: '#22c55e' }}>&gt; Acerto Crítico! Dano: 24 (Corte).</div>
                  <div>&gt; Xanathar ativa Raio Ocular de Charme.</div>
                  <div style={{ color: '#ef4444' }}>&gt; Marcelo falha no teste de Vontade.</div>
                </div>
              </>
            )}

            {focusedAgent === 'hw' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    [EVENTOS_SMART_HARDWARE]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#25ced1', fontWeight: 600 }}>
                    LOGS
                  </span>
                </div>
                <div style={{
                  background: 'var(--item-bg)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  minHeight: '8rem',
                  fontSize: 9.5,
                  fontFamily: '"Share Tech Mono", monospace',
                  color: 'var(--text-secondary)'
                }}>
                  <div>&gt; [09:12:00] SSD SMART Status: Saudável.</div>
                  <div>&gt; [09:12:05] PCI Express link speed regularized.</div>
                  <div style={{ color: '#ffaa00' }}>&gt; [09:15:33] Alerta: Alta carga no barramento USB.</div>
                  <div>&gt; [09:15:35] Drivers de Áudio sincronizados.</div>
                </div>
              </>
            )}

            {focusedAgent === 'pow' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    [EVENTOS_DE_REDE_POW]
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: '#ffaa00', fontWeight: 600 }}>
                    LOGS
                  </span>
                </div>
                <div style={{
                  background: 'var(--item-bg)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  minHeight: '8rem',
                  fontSize: 9.5,
                  fontFamily: '"Share Tech Mono", monospace',
                  color: 'var(--text-secondary)'
                }}>
                  <div>&gt; Religador R-12 acionado (Subestação UFBA).</div>
                  <div style={{ color: '#22c55e' }}>&gt; Fluxo reconfigurado sem interrupções.</div>
                  <div>&gt; Disjuntor principal D-3: Status Fechado.</div>
                  <div>&gt; Monitor de oscilação harmônica: Conforme.</div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
