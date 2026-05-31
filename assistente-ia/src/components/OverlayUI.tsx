import { motion, AnimatePresence } from 'framer-motion';

const panelVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2, type: 'spring' as const, stiffness: 100, damping: 20 } },
  exit: { opacity: 0, x: -50, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const textVariants = {
  hidden: { y: '120%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 } },
  exit: { y: '120%', opacity: 0 },
};

const AGENT_DATA: Record<string, {
  title: string;
  subtitle: string;
  terminal: string;
  tags: string[];
  activities: string[];
}> = {
  orq: {
    title: 'ORQUESTRAÇÃO',
    subtitle: 'INFRA & AUTOMAÇÃO',
    terminal: '[SYS] Monitorando fluxos locais... Resolvendo crashes no ambiente. Sincronização de banco de dados ativa.',
    tags: ['Python', 'SQL', 'Prefect'],
    activities: ['Restarting local flow', 'Validating schemas'],
  },
  est: {
    title: 'ESTUDOS UFBA',
    subtitle: 'SISTEMAS DE POTÊNCIA',
    terminal: '[CALC] Simulação de linha de transmissão (Condutor Finch, 50 Hz). Análise de partida de MIT com resistor/reator adicionados ao rotor concluída.',
    tags: ['LaTeX', 'Matlab', 'ANEEL'],
    activities: ['Correção de Fator de Potência (0.2)', 'Otimização de estrutura'],
  },
  rpg: {
    title: 'RPG & CAMPANHAS',
    subtitle: 'WORLD-BUILDING & LORE',
    terminal: '[LORE] Renderizando blocos de estatísticas para grupo de 8 jogadores. Gerenciando side quests em Skullport e Saint\'s Bay.',
    tags: ['Campanha', 'NPCs', 'World-building'],
    activities: ['Atualizando status: Marcelo', 'Revisão de atributos mecânicos'],
  },
  hw: {
    title: 'HARDWARE & SISTEMA',
    subtitle: 'CONTROLE DE MÍDIA',
    terminal: '[HW] Monitorando telemetria de componentes. Status de RMA Corsair em andamento. Sincronização com dispositivos móveis concluída.',
    tags: ['Poco X8 Pro Max', 'Apple Watch', 'Setup'],
    activities: ['Atualização de firmware', 'Rastreamento de hardware'],
  },
};

function MaskedText({ variants, style, children }: { variants: typeof textVariants; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div variants={variants} style={style}>
        {children}
      </motion.div>
    </div>
  );
}

function HomeOverview() {
  return (
    <motion.div
      key="home"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'absolute',
        top: '28%',
        left: 48,
        width: '35vw',
        maxWidth: 480,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <MaskedText variants={textVariants}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#9ca3af', letterSpacing: '2px' }}>
          AURA OS // VISÃO GERAL DO SISTEMA
        </span>
      </MaskedText>

      <div style={{ height: 16 }} />

      <MaskedText variants={textVariants}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 60, fontWeight: 600, color: '#111827', letterSpacing: '-2px', lineHeight: 1 }}>
          Sistemas<br />Sincronizados
        </h1>
      </MaskedText>

      <div style={{ height: 20 }} />

      <MaskedText variants={textVariants}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#6b7280', lineHeight: '24px', maxWidth: 360, letterSpacing: '-0.2px' }}>
          Ecossistema de orquestração e gerenciamento de dados ativo. Utilize a rolagem do mouse para explorar a topologia orbital, ou selecione um artefato para acessar sua base de dados.
        </p>
      </MaskedText>

      <div style={{ height: 24 }} />

      <MaskedText variants={textVariants}>
        <div style={{
          pointerEvents: 'none',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 12,
          padding: 20,
          maxWidth: 400,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 24px',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: '#6b7280',
          letterSpacing: '-0.1px',
        }}>
          <span>[NÓS ATIVOS]: 4</span>
          <span>[ROTAÇÃO]: INERCIAL</span>
          <span>[FREQUÊNCIA]: 50 Hz</span>
          <span>[REDE]: ESTÁVEL</span>
        </div>
      </MaskedText>

      <div style={{ height: 24 }} />

      <MaskedText variants={textVariants}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#9ca3af', letterSpacing: '0.3px' }}>
          Pressione [Ctrl + K] para busca global.
        </span>
      </MaskedText>
    </motion.div>
  );
}

function AgentPanel({ data, id, onClose }: { data: typeof AGENT_DATA[string]; id: string; onClose: () => void }) {
  return (
    <motion.div
      key={id}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'absolute',
        top: '22%',
        left: 48,
        width: '45vw',
        maxWidth: 640,
        pointerEvents: 'auto',
        borderLeft: '4px solid rgba(0,0,0,0.08)',
        paddingLeft: 28,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <MaskedText variants={textVariants}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b7280', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            </MaskedText>
            <MaskedText variants={textVariants}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b7280', letterSpacing: '0.5px' }}>
                STATUS: ONLINE
              </span>
            </MaskedText>
          </div>
          <MaskedText variants={textVariants}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 44, fontWeight: 600, color: '#111827', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 4 }}>
              {data.title}
            </h2>
          </MaskedText>
          <MaskedText variants={textVariants}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#9ca3af', letterSpacing: '1px' }}>
              {data.subtitle}
            </span>
          </MaskedText>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <MaskedText variants={textVariants}>
            <div style={{
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 8,
              padding: '14px 16px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: '#4b5563',
              lineHeight: '20px',
              letterSpacing: '-0.1px',
            }}>
              {data.terminal}
            </div>
          </MaskedText>
        </div>

        <div>
          <MaskedText variants={textVariants}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.tags.map((tag) => (
                <span key={tag} style={{
                  display: 'inline-block',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: '#6b7280',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 100,
                  padding: '4px 12px',
                  letterSpacing: '0.3px',
                  width: 'fit-content',
                }}>
                  [{tag}]
                </span>
              ))}
            </div>
          </MaskedText>
        </div>

        <div>
          <MaskedText variants={textVariants}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.activities.map((act) => (
                <div key={act} style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: '#6b7280',
                  lineHeight: '18px',
                  letterSpacing: '-0.1px',
                }}>
                  {'> '}{act}
                </div>
              ))}
            </div>
          </MaskedText>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <MaskedText variants={textVariants}>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#555555' }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#111827',
                border: 'none',
                borderRadius: 100,
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
              }}
            >
              Acessar Módulo
            </motion.button>
          </MaskedText>
        </div>
      </div>
    </motion.div>
  );
}

export function OverlayUI({ focusedAgent, onClose }: { focusedAgent: string | null; onClose: () => void }) {
  const data = focusedAgent ? AGENT_DATA[focusedAgent] : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 40, left: 48, zIndex: 50, pointerEvents: 'auto', userSelect: 'none' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-1px', color: '#111827' }}>
          AURA<span style={{ fontWeight: 300, color: '#6b7280' }}>_OS</span>
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {focusedAgent && data ? (
          <AgentPanel key={focusedAgent} data={data} id={focusedAgent} onClose={onClose} />
        ) : (
          <HomeOverview key="home" />
        )}
      </AnimatePresence>
    </div>
  );
}
