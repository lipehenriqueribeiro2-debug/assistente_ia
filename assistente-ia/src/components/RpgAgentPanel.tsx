import { motion } from 'framer-motion';

export function RpgAgentPanel({ activeColor }: { activeColor: string }) {
  return (
    <>
      {/* Bloco 1: World-State */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[ESTADO_DO_MUNDO]</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 4, color: 'var(--text-primary)' }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'var(--text-muted)' }}>LOCAL</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-white)' }}>Skullport</div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'var(--text-muted)' }}>TENSÃO</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: activeColor }}>8 / 10</div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'var(--text-muted)' }}>CLIMA</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Névoa</div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'var(--text-muted)' }}>CONFLITO</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Guilda</div>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 2: Party Tracker */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>[JOGADORES]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid var(--border-card)', paddingBottom: 2 }}>
            <span style={{ fontWeight: 500, color: activeColor }}>Marcelo</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9 }}>Guerreiro | TURNO</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid var(--border-card)', paddingBottom: 2 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Ana</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>Maga | ESPERA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Carlos</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>Ladino | OCULTO</span>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 3: Iniciativa e Combate */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[INICIATIVA_COMBATE]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Combate Ativo</span>
            <span style={{ fontWeight: 600, color: activeColor }}>Rodada 4</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--item-bg)', padding: 4, borderRadius: 4, border: '1px solid var(--item-border)' }}>
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>ÚLTIMA ROLAGEM</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#22c55e' }}>Marcelo: 1d20+7 = 19</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Próximo Turno</span>
            <span style={{ fontWeight: 500, color: 'var(--text-white)' }}>Ana (Maga)</span>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 4: Bestiário & Ameaças Local */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[AMEAÇAS_ATURAS]</span>
        <div style={{ 
          fontFamily: "'IBM Plex Mono', monospace", 
          fontSize: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          marginTop: 4 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Beholder (Xanathar)</span>
              <span style={{ color: activeColor, fontWeight: 600 }}>180 / 180 HP</span>
            </div>
            <div style={{ height: 3, width: '100%', background: 'var(--item-border)', borderRadius: 1.5 }}>
              <div style={{ height: '100%', width: '100%', background: activeColor }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Guild Thugs (x3)</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>12 / 32 HP</span>
            </div>
            <div style={{ height: 3, width: '100%', background: 'var(--item-border)', borderRadius: 1.5 }}>
              <div style={{ height: '100%', width: '37.5%', background: '#ef4444' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mind Flayer</span>
              <span style={{ color: '#ffaa00', fontWeight: 600 }}>45 / 71 HP</span>
            </div>
            <div style={{ height: 3, width: '100%', background: 'var(--item-border)', borderRadius: 1.5 }}>
              <div style={{ height: '100%', width: '63.3%', background: '#ffaa00' }} />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
