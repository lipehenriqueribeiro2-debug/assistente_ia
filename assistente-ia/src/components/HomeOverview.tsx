import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727', // Crimson
  est: '#0066ff', // Cobalto
  rpg: '#b829ff', // Magenta
  hw: '#25ced1',  // Ciano
  pow: '#ffaa00', // Ouro
};

const parentVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: 1 } },
};

const itemVariant = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  exit: { opacity: 0, y: -20, filter: 'blur(2px)', transition: { ease: 'easeInOut' as const, duration: 0.3 } },
};

const STATUS_ITEMS = [
  { label: 'NÓS ATIVOS', value: '5' },
  { label: 'ROTAÇÃO', value: 'INERCIAL' },
  { label: 'FREQUÊNCIA', value: '50 Hz' },
  { label: 'REDE', value: 'ESTÁVEL' },
];

export function HomeOverview({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [agentStats, setAgentStats] = useState({
    orq: { latency: 4.2, status: 'ATIVO' },
    est: { latency: 14.5, status: 'ONLINE' },
    rpg: { latency: 9.8, status: 'STANDBY' },
    hw: { latency: 5.1, status: 'ATIVO' },
    pow: { latency: 17.6, status: 'ONLINE' }
  });
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStats(prev => ({
        orq: { latency: +(3.5 + Math.random() * 1.5).toFixed(1), status: 'ATIVO' },
        est: { latency: +(12.0 + Math.random() * 4.0).toFixed(1), status: 'ONLINE' },
        rpg: { latency: +(8.0 + Math.random() * 3.0).toFixed(1), status: 'STANDBY' },
        hw: { latency: +(4.2 + Math.random() * 2.0).toFixed(1), status: 'ATIVO' },
        pow: { latency: +(15.0 + Math.random() * 5.0).toFixed(1), status: 'ONLINE' }
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  /* scan-line animada a cada 70ms */
  useEffect(() => {
    const id = setInterval(() => setScanLine(p => (p + 1) % 100), 70);
    return () => clearInterval(id);
  }, []);

  const themeColor = '#25ced1'; // Cor central do sistema (Ciano HUD)

  return (
    <motion.div
      key="home"
      variants={parentVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
        width: '100%',
        position: 'relative',
        // Aumenta a largura dinamicamente com base no viewport usando clamp()
        maxWidth: 'clamp(32rem, 40vw, 48rem)',
        /* HUD/CRT Glass layer & Dotted grid matrix responsivo */
        background: `
          repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
          radial-gradient(circle at 50% 50%, var(--bg-card) 0%, var(--bg-card-solid) 100%)
        `,
        backdropFilter: 'blur(36px)',
        WebkitBackdropFilter: 'blur(36px)',
        border: `1px solid rgba(37, 206, 209, ${theme === 'light' ? '0.22' : '0.25'})`,
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        color: 'var(--text-primary)',
        boxShadow: `
          0 0 0 1px rgba(37, 206, 209, ${theme === 'light' ? '0.04' : '0.06'}),
          0 0 32px rgba(37, 206, 209, ${theme === 'light' ? '0.04' : '0.08'}),
          var(--shadow-card),
          inset 0 1px 0 ${theme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.05)'}
        `,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        overflow: 'hidden',
        transition: 'max-width 0.3s ease-out, border-color 0.25s, box-shadow 0.25s',
      }}
    >
      {/* ── Linha de scan decorativa responsiva ── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        `${scanLine}%`,
          left:       0,
          right:      0,
          height:     1,
          background: `linear-gradient(90deg, transparent, rgba(37, 206, 209, ${theme === 'light' ? '0.08' : '0.15'}), transparent)`,
          pointerEvents: 'none',
          transition: 'top 0.07s linear',
          zIndex:     1,
        }}
      />

      {/* ── Marcadores de canto (HUD corners) ── */}
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
            borderColor: 'rgba(37, 206, 209, 0.45)',
            borderStyle: 'solid',
            ...(c === 'tl' && { top: 5, left: 5,   borderWidth: '1.5px 0 0 1.5px', borderRadius: '2px 0 0 0' }),
            ...(c === 'tr' && { top: 5, right: 5,  borderWidth: '1.5px 1.5px 0 0', borderRadius: '0 2px 0 0' }),
            ...(c === 'bl' && { bottom: 5, left: 5,  borderWidth: '0 0 1.5px 1.5px', borderRadius: '0 0 0 2px' }),
            ...(c === 'br' && { bottom: 5, right: 5, borderWidth: '0 1.5px 1.5px 0', borderRadius: '0 0 2px 0' }),
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <motion.span
          layout
          variants={itemVariant}
          style={{ 
            display: 'block', 
            fontFamily: '"Share Tech Mono", "Fira Code", monospace', 
            fontSize: 9.5, 
            color: 'rgba(37, 206, 209, 0.65)', 
            letterSpacing: '2px', 
            textTransform: 'uppercase' 
          }}
        >
          SYS://AURA_OS // VISÃO GERAL
        </motion.span>
 
        <motion.h1
          layout
          variants={itemVariant}
          style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: 32, 
            fontWeight: 600, 
            color: 'var(--text-white)', 
            letterSpacing: '-1.5px', 
            lineHeight: 1.15, 
            marginTop: '0.25rem' 
          }}
        >
          Sistemas Sincronizados
        </motion.h1>
      </div>
 
      <motion.p
        layout
        variants={itemVariant}
        style={{ 
          position: 'relative',
          zIndex: 2,
          fontFamily: 'Inter, sans-serif', 
          fontSize: 12.5, 
          color: 'var(--text-secondary)', 
          lineHeight: '18px', 
          letterSpacing: '-0.1px' 
        }}
      >
        Ecossistema de orquestração e gerenciamento de dados ativo. Utilize a rolagem do mouse para explorar a topologia orbital ou selecione um subagente para detalhar o respectivo módulo.
      </motion.p>
 
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: 'var(--item-bg)',
        border: '1px solid var(--border-card)',
        borderRadius: 10,
        padding: '0.8rem 1.1rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px 12px',
      }}>
        {STATUS_ITEMS.map((item) => (
          <motion.div
            key={item.label}
            layout
            variants={itemVariant}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9, color: 'rgba(37, 206, 209, 0.65)', letterSpacing: '0.5px' }}>{item.label}</span>
            <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 13, color: 'var(--text-white)', fontWeight: 500 }}>{item.value}</span>
          </motion.div>
        ))}
      </div>
 
      {/* Painel: Integridade dos Agentes Orbitais */}
      <motion.div
        layout
        variants={itemVariant}
        style={{
          position: 'relative',
          zIndex: 2,
          borderTop: '1px solid var(--border-header)',
          paddingTop: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: 'var(--text-muted)', letterSpacing: '1px' }}>
            [INTEGRIDADE_ORBITAL]
          </span>
          <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
            SYNC OK
          </span>
        </div>
 
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {Object.entries(agentStats).map(([key, data]) => {
            const label = key.toUpperCase();
            const color = AGENT_COLORS[key] || 'var(--text-white)';
            const name = key === 'orq' ? 'AI_ORCHESTRATOR'
                       : key === 'est' ? 'AI_ENGINEER'
                       : key === 'rpg' ? 'AI_DUNGEONMASTER'
                       : key === 'hw'  ? 'AI_HARDWARE'
                       : 'AI_POWER_GRID';
            
            return (
              <div 
                key={key} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '5px 10px',
                  borderRadius: 8,
                  background: 'var(--item-bg)',
                  border: '1px solid var(--item-border)',
                  transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = `${color}44`;
                  e.currentTarget.style.backgroundColor = `${color}${theme === 'light' ? '05' : '0b'}`;
                  e.currentTarget.style.boxShadow = `inset 0 0 8px ${color}05`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--item-border)';
                  e.currentTarget.style.backgroundColor = 'var(--item-bg)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: color, 
                    boxShadow: `0 0 6px ${color}`,
                    display: 'inline-block'
                  }} />
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10.5, color: 'var(--text-white)', fontWeight: 500 }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 8.5, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                    {name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ 
                    fontFamily: '"Share Tech Mono", monospace', 
                    fontSize: 8, 
                    padding: '2px 6px', 
                    borderRadius: 4, 
                    background: data.status === 'STANDBY' ? 'var(--item-bg)' : 'rgba(34, 197, 94, 0.08)',
                    color: data.status === 'STANDBY' ? 'var(--text-muted)' : '#22c55e',
                    border: data.status === 'STANDBY' ? '1px solid var(--item-border)' : '1px solid rgba(34,197,94,0.15)',
                    fontWeight: 600
                  }}>
                    {data.status}
                  </span>
                  <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9.5, color: 'var(--text-secondary)', width: '3.5rem', textAlign: 'right' }}>
                    {data.latency} ms
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
