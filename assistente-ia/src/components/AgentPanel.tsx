import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OrqAgentPanel } from './OrqAgentPanel';
import { EstAgentPanel } from './EstAgentPanel';
import { RpgAgentPanel } from './RpgAgentPanel';
import { HwAgentPanel } from './HwAgentPanel';
import { PowAgentPanel } from './PowAgentPanel';

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

export function AgentPanel({ id, onClose, theme = 'dark' }: { id: string; onClose: () => void; theme?: 'dark' | 'light' }) {
  const activeColor = AGENT_COLORS[id] || '#25ced1';
  const [scanLine, setScanLine] = useState(0);

  /* scan-line animada a cada 75ms */
  useEffect(() => {
    const id = setInterval(() => setScanLine(p => (p + 1) % 100), 75);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      key={id}
      variants={parentVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
        width: '100%',
        maxWidth: '46rem', // Otimizado de 66rem para 46rem para liberar a área central da aplicação
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
        padding: '1.5rem 1.75rem',
        zIndex: 10,
        color: 'var(--text-primary)',
        boxShadow: `
          0 0 0 1px ${activeColor}${theme === 'light' ? '08' : '0f'},
          0 0 40px ${activeColor}${theme === 'light' ? '06' : '12'},
          var(--shadow-card),
          inset 0 1px 0 ${theme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.05)'}
        `,
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
          transition: 'top 0.075s linear, background 0.25s ease',
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
            width:       12,
            height:      12,
            pointerEvents: 'none',
            zIndex:      2,
            borderColor: `${activeColor}${theme === 'light' ? '90' : 'aa'}`,
            borderStyle: 'solid',
            transition:  'border-color 0.25s ease',
            ...(c === 'tl' && { top: 6, left: 6,   borderWidth: '1.5px 0 0 1.5px', borderRadius: '3px 0 0 0' }),
            ...(c === 'tr' && { top: 6, right: 6,  borderWidth: '1.5px 1.5px 0 0', borderRadius: '0 3px 0 0' }),
            ...(c === 'bl' && { bottom: 6, left: 6,  borderWidth: '0 0 1.5px 1.5px', borderRadius: '0 0 0 3px' }),
            ...(c === 'br' && { bottom: 6, right: 6, borderWidth: '0 1.5px 1.5px 0', borderRadius: '0 0 3px 0' }),
          }}
        />
      ))}

      {/* Botão fechar no topo direito */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'color 0.2s',
          padding: '4px',
          zIndex: 20,
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = activeColor; }}
        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        ✕
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 2 }}>
        {/* Header do Card */}
        <div>
          <motion.div
            layout
            variants={itemVariant}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: id === 'orq' ? '#22c55e' : activeColor, display: 'inline-block', boxShadow: `0 0 8px ${id === 'orq' ? '#22c55e' : activeColor}`, animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              STATUS: {id === 'orq' ? 'SINCRONIZADO' : 'ONLINE'}
            </span>
          </motion.div>
   
          <motion.h2
            layout
            variants={itemVariant}
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: 24, 
              fontWeight: 600, 
              color: 'var(--text-white)', 
              letterSpacing: '-1px', 
              lineHeight: 1.1, 
              marginBottom: 4 
            }}
          >
            {id === 'orq' && 'ORQUESTRAÇÃO GLOBAL'}
            {id === 'est' && 'ESTUDOS UFBA'}
            {id === 'rpg' && 'LORE & RPG MANAGEMENT'}
            {id === 'hw' && 'TELEMETRIA DE HARDWARE'}
            {id === 'pow' && 'SISTEMAS DE POTÊNCIA'}
          </motion.h2>
   
          <motion.span
            layout
            variants={itemVariant}
            style={{ 
              display: 'block', 
              fontFamily: '"Share Tech Mono", monospace', 
              fontSize: 10.5, 
              color: activeColor, 
              letterSpacing: '1px',
              fontWeight: 500,
              transition: 'color 0.25s ease'
            }}
          >
            {id === 'orq' && 'INFRA & AUTOMAÇÃO // AI_ORCHESTRATOR'}
            {id === 'est' && 'ENGENHARIA ELÉTRICA // AI_ENGINEER'}
            {id === 'rpg' && 'WORLD-BUILDING & LORE // AI_DUNGEONMASTER'}
            {id === 'hw' && 'CONTROLE DE SISTEMA // AI_HARDWARE'}
            {id === 'pow' && 'GERAÇÃO & TRANSMISSÃO // AI_POWER_GRID'}
          </motion.span>
        </div>
   
        {/* Bento Grid Customizado por Agente - Otimizado para 2 Colunas (Layout 2x2) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginTop: '0.25rem',
        }}>
          {id === 'orq' && <OrqAgentPanel activeColor={activeColor} />}
          {id === 'est' && <EstAgentPanel activeColor={activeColor} />}
          {id === 'rpg' && <RpgAgentPanel activeColor={activeColor} />}
          {id === 'hw'  && <HwAgentPanel activeColor={activeColor} />}
          {id === 'pow' && <PowAgentPanel activeColor={activeColor} />}
        </div>
   
        {/* Botão de Ação Acessar Módulo */}
        <motion.button
          layout
          variants={itemVariant}
          onClick={onClose}
          whileHover={{ backgroundColor: `${activeColor}1a`, color: 'var(--text-white)', borderColor: activeColor, boxShadow: `0 0 15px ${activeColor}33`, y: -2 }}
          whileTap={{ y: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            width: '100%',
            marginTop: '0.25rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            background: 'var(--item-bg)',
            border: `1px solid ${activeColor}55`,
            color: activeColor,
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'uppercase',
            transition: 'color 0.25s ease, border-color 0.25s ease, background-color 0.25s ease',
          }}
        >
          Acessar Módulo
        </motion.button>
      </div>
    </motion.div>
  );
}
