import { motion } from 'framer-motion';

export function OrqAgentPanel({ activeColor }: { activeColor: string }) {
  return (
    <>
      {/* Bloco 1: Console Feed */}
      <motion.div 
        whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.15)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: '#080d19',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          cursor: 'default',
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[CONSOLE_FEED]</span>
        <div style={{ 
          fontFamily: "'IBM Plex Mono', monospace", 
          fontSize: 11, 
          color: 'rgba(255,255,255,0.6)', 
          lineHeight: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          <div style={{ color: '#22c55e' }}>&gt; [SYS] Sincronização Prefect ativa.</div>
          <div>&gt; [OK] Backup local completado.</div>
          <div>&gt; [DB] Conexão ativa postgres://127.0.0.1</div>
          <div style={{ color: activeColor }}>&gt; [RUN] Executando script de telemetria...</div>
          <div style={{ opacity: 0.5 }}>&gt; [INFO] CPU fan speed regularized.</div>
        </div>
      </motion.div>

      {/* Bloco 2: Métricas Docker */}
      <motion.div 
        whileHover={{ scale: 1.01, borderColor: 'var(--border-card)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'var(--item-bg)',
          border: '1px solid var(--item-border)',
          borderRadius: 12,
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          cursor: 'default',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>DOCKER CONT.</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: 'var(--text-white)' }}>12 / 12</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>CPU ORQ</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: activeColor }}>24.5%</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>BANDA REDE</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: 'var(--text-white)' }}>998 Mbps</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>LATÊNCIA</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: '#22c55e' }}>3 ms</span>
        </div>
      </motion.div>
 
      {/* Bloco 3: Prefect Pipelines */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[PREFECT_PIPELINES]</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 4, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pipelines Ativas</span>
            <span style={{ fontWeight: 600 }}>4 / 5</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Fluxo de Dados</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>1.2 GB/s</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>API Prefect</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>ONLINE</span>
          </div>
        </div>
      </motion.div>
 
      {/* Bloco 4: Infraestrutura & Serviços */}
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
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: activeColor, letterSpacing: '0.5px' }}>[SERVIÇOS_INFRA]</span>
        <div style={{ 
          fontFamily: "'IBM Plex Mono', monospace", 
          fontSize: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          marginTop: 4 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>PostgreSQL (5432)</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>ONLINE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Redis Cache (6379)</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>ONLINE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Nginx Gateway (80)</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>ONLINE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>MinIO Object (9000)</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>ONLINE</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
