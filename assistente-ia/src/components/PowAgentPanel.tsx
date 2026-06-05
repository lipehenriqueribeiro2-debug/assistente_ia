import { motion } from 'framer-motion';

export function PowAgentPanel({ activeColor }: { activeColor: string }) {
  return (
    <>
      {/* Bloco 1: Telemetria de Carga */}
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
          gap: 12,
          cursor: 'default',
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[MONITORAMENTO_TENSÃO]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-primary)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Potência Ativa</span>
              <span style={{ fontWeight: 600, color: activeColor }}>125 kW</span>
            </div>
            <svg width="100%" height="15" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q12.5,0 25,10 T50,10 T75,10 T100,10" fill="none" stroke={activeColor} strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fator Potência</span>
              <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>0.99</span>
            </div>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 2: Geração & Contingência */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>[SISTEMA_DISTRIBUÍDO]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Gerador Síncrono</span>
            <span style={{ color: '#22c55e', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600 }}>50Hz OK</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Banco Conting.</span>
            <span style={{ color: '#22c55e', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600 }}>100%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Eficiência Term.</span>
              <span style={{ fontWeight: 500, color: activeColor }}>94%</span>
            </div>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 3: Dados de Subestação */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[DADOS_SUBESTAÇÃO]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tensão Barra</span>
            <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>13.8 kV</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Demanda Pico</span>
            <span style={{ color: activeColor, fontWeight: 600 }}>150 kW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Fluxo Carga</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>ESTÁVEL</span>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 4: Análise Harmônica */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[ANÁLISE_HARMÔNICA]</span>
        <div style={{ 
          fontFamily: "'IBM Plex Mono', monospace", 
          fontSize: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          marginTop: 4 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>DHT Tensão (V)</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>1.8% (Ok)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>DHT Corrente (I)</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>3.2% (Ok)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Frequência Fina</span>
            <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>50.02 Hz</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Distorção Total</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>CONFORME</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
