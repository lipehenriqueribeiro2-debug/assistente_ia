import { motion, AnimatePresence } from 'framer-motion';
import { ChatInterface } from './ChatInterface';
import { SystemMonitorPanel } from './SystemMonitorPanel';
import { BackendStatusPanel } from './BackendStatusPanel';
import { HomeOverview } from './HomeOverview';
import { AgentPanel } from './AgentPanel';
import { SearchIndicator } from './SearchIndicator';

export function OverlayUI({ focusedAgent, onSelectAgent, onClose, activeView, theme }: { focusedAgent: string | null; onSelectAgent: (id: string | null) => void; onClose: () => void; activeView: 'orbital' | 'chat'; theme: 'dark' | 'light' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none', padding: '4rem', paddingTop: '6rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <div />

        <AnimatePresence mode="wait">
          {activeView === 'orbital' && (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', position: 'relative' }}>
              <AnimatePresence mode="wait">
                {focusedAgent ? (
                  <motion.div
                    key={focusedAgent}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40, filter: 'blur(4px)', transition: { duration: 0.4 } }}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '65vw' }}
                  >
                    <AgentPanel id={focusedAgent} onClose={onClose} theme={theme} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="home-left-wrapper"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '65vw' }}
                  >
                    <HomeOverview theme={theme} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Painéis da direita permanentes (contextuais via focusedAgent prop) */}
              <motion.div
                key="system-monitor-wrapper"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ position: 'absolute', top: '2.5rem', right: '-2.2rem', zIndex: 10, pointerEvents: 'auto' }}
              >
                <SystemMonitorPanel focusedAgent={focusedAgent} theme={theme} />
              </motion.div>

              <motion.div
                key="backend-status-wrapper"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ position: 'absolute', bottom: '-1.8rem', right: '-2.2rem', zIndex: 10, pointerEvents: 'auto' }}
              >
                <BackendStatusPanel focusedAgent={focusedAgent} theme={theme} />
              </motion.div>
            </div>
          )}

          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5 } }}
              exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
              style={{
                flex: 1, display: 'flex', justifyContent: 'center',
                alignItems: 'center', pointerEvents: 'auto',
              }}
            >
              <div style={{
                width: '100%', maxWidth: '85vw',
                background: 'var(--chat-bg)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid var(--chat-border)',
                borderRadius: '1.25rem',
                boxShadow: 'var(--chat-shadow, 0 30px 70px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05))',
                overflow: 'hidden',
              }}>
                <ChatInterface focusedAgent={focusedAgent} onSelectAgent={onSelectAgent} theme={theme} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeView === 'orbital' && (
          <div style={{ pointerEvents: 'auto' }}>
            <SearchIndicator theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}
