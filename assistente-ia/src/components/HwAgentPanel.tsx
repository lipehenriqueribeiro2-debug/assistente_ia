import { motion } from 'framer-motion';

export function HwAgentPanel({ activeColor }: { activeColor: string }) {
  return (
    <>
      {/* Bloco 1: Monitoramento Térmico */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[MONITORAMENTO_TÉRMICO]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-primary)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: 'var(--text-secondary)' }}>CPU Temp</span>
              <span style={{ fontWeight: 600, color: activeColor }}>64°C</span>
            </div>
            <svg width="100%" height="15" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,15 Q10,12 20,18 T40,8 T60,15 T80,10 T100,5" fill="none" stroke={activeColor} strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: 'var(--text-secondary)' }}>RAM Usage</span>
              <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>14.2 GB</span>
            </div>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 2: Dispositivos */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>[ECOSSISTEMA_LINKS]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Apple Watch</span>
            <span style={{ color: '#22c55e', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600 }}>SYNC OK</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Poco X8 Pro</span>
            <span style={{ color: '#22c55e', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600 }}>ONLINE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ticket RMA Corsair</span>
              <span style={{ fontWeight: 500, color: activeColor }}>75%</span>
            </div>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 3: Integridade Geral */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[INTEGRIDADE_HARDWARE]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>NVMe SSD Health</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>98%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Consumo Total</span>
            <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>420 W</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Temp WC Liquido</span>
            <span style={{ color: activeColor, fontWeight: 600 }}>34.5°C</span>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 4: Controle de Coolers & Resfriamento */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[COOLERS_ROTATION]</span>
        <div style={{ 
          fontFamily: "'IBM Plex Mono', monospace", 
          fontSize: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          marginTop: 4 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Bomba AIO (Pump)</span>
            <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>2400 RPM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Coolers Radiador</span>
            <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>1100 RPM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Fans de Entrada</span>
            <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>950 RPM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Fluxo Dinâmico</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>ESTÁVEL</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
