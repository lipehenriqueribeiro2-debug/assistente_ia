import { motion } from 'framer-motion';

export function EstAgentPanel({ activeColor }: { activeColor: string }) {
  return (
    <>
      {/* Bloco 1: LaTeX Preview */}
      <motion.div 
        whileHover={{ scale: 1.01, borderColor: 'var(--border-card)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'var(--item-bg)',
          border: '1px solid var(--item-border)',
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          cursor: 'default',
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[MODELO_MATEMÁTICO]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ borderLeft: `2px solid ${activeColor}`, paddingLeft: 8 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>FATOR DE POTÊNCIA (MIT)</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontStyle: 'italic', fontWeight: 500, color: 'var(--text-white)' }}>cos φ = 0.20 <span style={{ fontSize: 9, color: '#ef4444', fontStyle: 'normal' }}>(Corretor)</span></div>
          </div>
          <div style={{ borderLeft: '2px solid var(--border-card)', paddingLeft: 8 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>IMPEDÂNCIA TRANS.</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontStyle: 'italic', fontWeight: 500, color: 'var(--text-white)' }}>Z_m = 0.45 + j 2.18 Ω</div>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 2: Atividades/Tasks */}
      <motion.div 
        whileHover={{ scale: 1.01, borderColor: 'var(--border-card)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'var(--item-bg)',
          border: '1px solid var(--item-border)',
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          cursor: 'default',
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>[TAREFAS_UFBA]</span>
        <div style={{ 
          fontFamily: "'IBM Plex Mono', monospace", 
          fontSize: 11, 
          color: 'var(--text-primary)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 5,
          marginTop: 4
        }}>
          <div style={{ color: 'var(--text-muted)' }}>[x] SIM: Partida de MIT</div>
          <div style={{ color: 'var(--text-muted)' }}>[x] CALC: Transmissão Finch</div>
          <div style={{ color: activeColor }}>[/] REL: Padrões ANEEL</div>
          <div>[ ] PROJ: Subestação UFBA</div>
        </div>
      </motion.div>
 
      {/* Bloco 3: Rendimento & TCC */}
      <motion.div 
        whileHover={{ scale: 1.01, borderColor: 'var(--border-card)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'var(--item-bg)',
          border: '1px solid var(--item-border)',
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          cursor: 'default',
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[PROGRESSO_ACADÊMICO]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>C.H. Concluída</span>
            <span style={{ fontWeight: 600 }}>82.7% (2400h)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Média Global (CR)</span>
            <span style={{ color: activeColor, fontWeight: 600 }}>8.82</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 9 }}>TCC ORIENTADOR</span>
            <span style={{ fontWeight: 500, fontSize: 10, color: 'var(--text-white)' }}>Dr. Marcos Silva</span>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 4: Disciplinas Correntes */}
      <motion.div 
        whileHover={{ scale: 1.01, borderColor: 'var(--border-card)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'var(--item-bg)',
          border: '1px solid var(--item-border)',
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          cursor: 'default',
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[DADOS_MÁTERIAS]</span>
        <div style={{ 
          fontFamily: "'IBM Plex Mono', monospace", 
          fontSize: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          marginTop: 4 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Circuitos Elét. II</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>8.5 / 10</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Conversão Energia</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>9.0 / 10</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sist. Potência I</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>8.2 / 10</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Controle Linear</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>9.1 / 10</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
