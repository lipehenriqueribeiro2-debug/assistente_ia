import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMic, IconSettings, IconClose, IconChat, IconBack, IconMaximize,
  useIconHover,
} from './AnimatedIcons';

interface HeaderProps {
  activeView: 'orbital' | 'chat';
  onToggleView: () => void;
  isListening: boolean;
  onToggleMic: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  focusedAgent: string | null;
}

const AGENT_COLORS: Record<string, string> = {
  orq: '#a92727', // Crimson
  est: '#0066ff', // Cobalto
  rpg: '#b829ff', // Magenta
  hw: '#25ced1',  // Ciano
  pow: '#ffaa00', // Ouro
};

export function Header({ activeView, onToggleView, isListening, onToggleMic, theme, onToggleTheme, focusedAgent }: HeaderProps) {
  const activeColor = focusedAgent ? (AGENT_COLORS[focusedAgent] ?? '#25ced1') : (theme === 'dark' ? '#00ffff' : '#0066ff');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeHover = useIconHover();
  const maxHover = useIconHover();

  const handleExit = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (err) {
      console.log('Sair executado fora do Tauri ou erro:', err);
      window.close();
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
    } catch (err) {
      console.log('Maximizar executado fora do Tauri ou erro:', err);
    }
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1.5rem',
        right: '1.5rem',
        height: '64px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50,
        pointerEvents: 'auto',
        borderRadius: '16px',
        border: `1px solid ${focusedAgent ? activeColor + (theme === 'light' ? '60' : '40') : 'var(--border-header)'}`,
        background: `
          repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
          var(--bg-header)
        `,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '0 1.5rem',
        boxShadow: theme === 'dark'
          ? `0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 15px ${focusedAgent ? activeColor + '15' : 'transparent'}, inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)`
          : `0 8px 32px 0 rgba(15, 23, 42, 0.08), 0 0 10px ${focusedAgent ? activeColor + '08' : 'transparent'}, inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)`,
      }}
    >
      {/* Marcadores de canto dinâmicos do Header (HUD corners) */}
      {(['tl','tr','bl','br'] as const).map(c => (
        <div
          key={c}
          aria-hidden="true"
          style={{
            position:    'absolute',
            width:       8,
            height:      8,
            pointerEvents: 'none',
            zIndex:      52,
            borderColor: `${activeColor}${theme === 'light' ? '80' : '99'}`,
            borderStyle: 'solid',
            transition:  'border-color 0.25s ease',
            ...(c === 'tl' && { top: 4, left: 4,   borderWidth: '1.2px 0 0 1.2px', borderRadius: '2px 0 0 0' }),
            ...(c === 'tr' && { top: 4, right: 4,  borderWidth: '1.2px 1.2px 0 0', borderRadius: '0 2px 0 0' }),
            ...(c === 'bl' && { bottom: 4, left: 4,  borderWidth: '0 0 1.2px 1.2px', borderRadius: '0 0 0 2px' }),
            ...(c === 'br' && { bottom: 4, right: 4, borderWidth: '0 1.2px 1.2px 0', borderRadius: '0 0 2px 0' }),
          }}
        />
      ))}
      {/* Esquerda: Logo & Status LED */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', userSelect: 'none' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: '-1px', color: 'var(--text-white)', margin: 0 }}>
          AURA<span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>_OS</span>
        </h1>
        {/* LED Pulsante de Status do Sistema */}
        <motion.span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: activeColor,
            display: 'inline-block',
          }}
          animate={{
            boxShadow: [
              `0 0 8px ${activeColor}, 0 0 16px ${activeColor}50`,
              `0 0 3px ${activeColor}, 0 0 6px ${activeColor}20`,
              `0 0 8px ${activeColor}, 0 0 16px ${activeColor}50`
            ],
            scale: [1, 0.85, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Direita: Controles de Áudio, Chat, Configurações & Janela */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Alternador de Visualização */}
        <AnimatePresence mode="wait">
          {activeView === 'orbital' ? (
            <motion.button
              key="chat-btn"
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={onToggleView}
              whileHover={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
              whileTap={{ scale: 0.94 }}
              style={{
                height: 38, display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 1.25rem', borderRadius: '9999px',
                border: '1px solid var(--border-header)', background: 'var(--item-bg)',
                backdropFilter: 'blur(4px)', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                color: 'var(--text-primary)', letterSpacing: '-0.2px',
                transition: 'all 200ms ease',
              }}
            >
              <IconChat size={14} color="currentColor" />
              Aura AI
            </motion.button>
          ) : (
            <motion.button
              key="back-btn"
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={onToggleView}
              whileHover={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
              whileTap={{ scale: 0.94 }}
              style={{
                height: 38, display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 1.25rem', borderRadius: '9999px',
                border: '1px solid var(--border-header)', background: 'var(--item-bg)',
                backdropFilter: 'blur(4px)', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                color: 'var(--text-primary)', letterSpacing: '-0.2px',
                transition: 'all 200ms ease',
              }}
            >
              <IconBack size={14} color="currentColor" />
              Voltar
            </motion.button>
          )}
        </AnimatePresence>

        {/* Botão de Microfone */}
        <motion.button
          onClick={onToggleMic}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          style={{
            height: 38, width: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
            border: `1px solid ${isListening ? 'rgba(239,68,68,0.4)' : 'var(--border-header)'}`,
            background: isListening ? 'rgba(239,68,68,0.15)' : 'var(--item-bg)',
            backdropFilter: 'blur(4px)', cursor: 'pointer',
            color: isListening ? '#ef4444' : 'var(--text-secondary)',
            transition: 'all 200ms ease',
            position: 'relative',
          }}
          animate={{
            boxShadow: isListening ? ['0 0 12px rgba(239,68,68,0.25)', '0 0 22px rgba(239,68,68,0.4)', '0 0 12px rgba(239,68,68,0.25)'] : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={isListening ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
        >
          <IconMic isActive={isListening} size={14} />
          {isListening && (
            <motion.span
              style={{
                position: 'absolute', top: -1, right: -1,
                width: 8, height: 8, borderRadius: '50%',
                background: '#ef4444',
              }}
              animate={{
                scale: [1, 1.4, 1],
                boxShadow: ['0 0 4px rgba(239,68,68,0.4)', '0 0 10px rgba(239,68,68,0.7)', '0 0 4px rgba(239,68,68,0.4)'],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.button>

        {/* Botão de Configurações de Tema */}
        <div style={{ position: 'relative' }}>
          <motion.button
            onClick={() => setSettingsOpen(prev => !prev)}
            whileHover={{ scale: 1.05, background: 'var(--bg-card)' }}
            whileTap={{ scale: 0.93 }}
            style={{
              height: 38, width: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', border: '1px solid var(--border-header)',
              background: settingsOpen ? 'var(--bg-card)' : 'var(--item-bg)',
              backdropFilter: 'blur(4px)', cursor: 'pointer',
              color: settingsOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 200ms ease',
            }}
            title="Configurações de Tema"
          >
            <IconSettings isOpen={settingsOpen} size={15} />
          </motion.button>

          <AnimatePresence>
            {settingsOpen && (
              <>
                {/* Backdrop invisível para fechar ao clicar fora */}
                <div
                  onClick={() => setSettingsOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 90, cursor: 'default' }}
                />

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '46px', right: 0, width: '165px',
                    background: `
                      repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                      repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                      var(--bg-card-solid)
                    `,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${focusedAgent ? activeColor + '40' : 'var(--border-card)'}`,
                    borderRadius: '12px', padding: '6px',
                    boxShadow: theme === 'dark'
                      ? `0 10px 25px rgba(0,0,0,0.35), 0 0 15px ${focusedAgent ? activeColor + '20' : 'transparent'}`
                      : `0 10px 25px rgba(15, 23, 42, 0.12), 0 0 10px ${focusedAgent ? activeColor + '08' : 'transparent'}`,
                    zIndex: 100, display: 'flex', flexDirection: 'column', gap: '4px',
                  }}
                >
                  {/* Cantoneiras HUD no Dropdown de Configurações do Header */}
                  {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
                    <div
                      key={c}
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        pointerEvents: 'none',
                        zIndex: 101,
                        borderColor: `${activeColor}${theme === 'light' ? '80' : '99'}`,
                        borderStyle: 'solid',
                        ...(c === 'tl' && { top: 4, left: 4, borderWidth: '1.2px 0 0 1.2px', borderRadius: '1.5px 0 0 0' }),
                        ...(c === 'tr' && { top: 4, right: 4, borderWidth: '1.2px 1.2px 0 0', borderRadius: '0 1.5px 0 0' }),
                        ...(c === 'bl' && { bottom: 4, left: 4, borderWidth: '0 0 1.2px 1.2px', borderRadius: '0 0 0 1.5px' }),
                        ...(c === 'br' && { bottom: 4, right: 4, borderWidth: '0 1.2px 1.2px 0', borderRadius: '0 0 1.5px 0' }),
                      }}
                    />
                  ))}
                  <div style={{ padding: '6px 8px', fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                    [CONFIG_APARÊNCIA]
                  </div>
                  <button
                    onClick={() => { if (theme === 'light') onToggleTheme(); setSettingsOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '8px', border: 'none',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: 'var(--text-primary)', fontSize: 11.5, fontFamily: 'Inter, sans-serif',
                      fontWeight: theme === 'dark' ? 600 : 400, cursor: 'pointer',
                      width: '100%', textAlign: 'left', transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => { if (theme !== 'dark') e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                    onMouseOut={(e) => { if (theme !== 'dark') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>Tema Escuro</span>
                    {theme === 'dark' && <span style={{ color: '#00ffff', fontSize: 10 }}>●</span>}
                  </button>
                  <button
                    onClick={() => { if (theme === 'dark') onToggleTheme(); setSettingsOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '8px', border: 'none',
                      background: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'transparent',
                      color: 'var(--text-primary)', fontSize: 11.5, fontFamily: 'Inter, sans-serif',
                      fontWeight: theme === 'light' ? 600 : 400, cursor: 'pointer',
                      width: '100%', textAlign: 'left', transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => { if (theme !== 'light') e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                    onMouseOut={(e) => { if (theme !== 'light') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>Tema Claro</span>
                    {theme === 'light' && <span style={{ color: 'var(--primary)', fontSize: 10 }}>●</span>}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Divisor Vertical */}
        <div style={{ width: 1, height: 18, background: 'var(--border-header)', margin: '0 0.25rem' }} />

        {/* Controles de Janela */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Maximizar */}
          <motion.button
            onClick={handleMaximize}
            whileHover={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            whileTap={{ scale: 0.93 }}
            {...maxHover.hoverProps}
            style={{
              height: 38, width: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', border: '1px solid var(--border-header)',
              background: 'var(--item-bg)', color: 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 200ms ease',
            }}
            title="Maximizar"
          >
            <IconMaximize isHovered={maxHover.isHovered} size={13} />
          </motion.button>

          {/* Fechar */}
          <motion.button
            onClick={handleExit}
            whileHover={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
            whileTap={{ scale: 0.93 }}
            {...closeHover.hoverProps}
            style={{
              height: 38, width: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', border: '1px solid var(--border-header)',
              background: 'var(--item-bg)', color: 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 200ms ease',
            }}
            title="Fechar"
          >
            <IconClose isHovered={closeHover.isHovered} size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
