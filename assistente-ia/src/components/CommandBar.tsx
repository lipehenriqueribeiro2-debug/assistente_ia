import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconOrq, IconEst, IconRpg, IconHw, IconPow } from './AnimatedIcons';
import { AGENT_COLORS } from './OrbitalCarousel';

/* ─── tipos ─── */
export interface ModuleEntry {
  key:   string;
  title: string;
  aura:  string;
}

interface CommandBarProps {
  isOpen:           boolean;
  onClose:          () => void;
  modules:          ModuleEntry[];
  onSelect:         (key: string) => void;
  onSendCommand?:   (command: string) => void;
  theme?:           'dark' | 'light';
}

/* ─── constantes de animação ─── */
const SPRING_MODAL     = { type: 'spring' as const, mass: 0.9, stiffness: 220, damping: 22 };
const SPRING_HIGHLIGHT = { type: 'spring' as const, stiffness: 480, damping: 30 };

/* ─── mapeamento de chaves externas para chaves internas de agente ─── */
const KEY_TO_AGENT: Record<string, string> = {
  infra: 'orq',
  estudos: 'est',
  rpg: 'rpg',
  hardware: 'hw',
  potencia: 'pow',
};

/* ─── descrições estilo terminal cyberpunk ─── */
const AGENT_DESCRIPTIONS: Record<string, string> = {
  orq: 'SYS_CORE // ORQUESTRADOR & AUTOMAÇÃO DE FLUXOS',
  est: 'ACADEMIC_GRID // GESTÃO DE ESTUDOS E HORÁRIOS UFBA',
  rpg: 'SANDBOX_ENV // CONFIGURADOR DE CAMPANHAS & DIALÉTICA D&D',
  hw:  'SYS_MONITOR // DIAGNÓSTICO DE SISTEMAS E PERFORMANCE',
  pow: 'GRID_OPTIMIZER // ANÁLISE DE REDES E FLUXOS DE POTÊNCIA',
};

/* ─── ícone animado por agente (usa o sistema AnimatedIcons centralizado) ─── */
function AgentIcon({ agentKey, isFocused, color }: { agentKey: string; isFocused: boolean; color: string }) {
  const props = { isFocused, size: 16, color, strokeWidth: 1.6 };
  switch (agentKey) {
    case 'orq': return <IconOrq {...props} />;
    case 'est': return <IconEst {...props} />;
    case 'rpg': return <IconRpg {...props} />;
    case 'hw':  return <IconHw  {...props} />;
    case 'pow': return <IconPow {...props} />;
    default:    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    );
  }
}

/* ─── mapa de labels descritivos ─── */
const AGENT_LABELS: Record<string, string> = {
  orq: 'ORQUESTRADOR',
  est: 'ESTUDOS',
  rpg: 'RPG & CAMPANHAS',
  hw:  'HARDWARE',
  pow: 'POTÊNCIA',
};

/* ────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
──────────────────────────────────────────────────── */
export function CommandBar({ isOpen, onClose, modules, onSelect, onSendCommand, theme = 'dark' }: CommandBarProps) {
  const [query, setQuery]               = useState('');
  const [highlightIndex, setHighlight]  = useState(0);
  const [scanLine, setScanLine]         = useState(0);
  const inputRef                        = useRef<HTMLInputElement>(null);

  const filtered = modules.filter(m => {
    const agentKey = KEY_TO_AGENT[m.key] ?? m.key;
    const label = AGENT_LABELS[agentKey] ?? m.key.toUpperCase();
    return m.title.toLowerCase().includes(query.toLowerCase()) ||
           label.toLowerCase().includes(query.toLowerCase());
  });

  /* foco e reset */
  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 80); }
    else        { setQuery(''); setHighlight(0); }
  }, [isOpen]);

  useEffect(() => { setHighlight(0); }, [query]);

  /* scan-line animada a cada 60ms */
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setScanLine(p => (p + 1) % 100), 60);
    return () => clearInterval(id);
  }, [isOpen]);

  const commit = useCallback((key: string) => {
    onClose();
    onSelect(key);
  }, [onClose, onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':    onClose(); break;
      case 'Enter':
        e.preventDefault();
        if (filtered.length > 0)            commit(filtered[highlightIndex].key);
        else if (onSendCommand && query.trim()) { onClose(); onSendCommand(query.trim()); }
        break;
      case 'ArrowDown': e.preventDefault(); setHighlight(p => Math.min(p + 1, filtered.length - 1)); break;
      case 'ArrowUp':   e.preventDefault(); setHighlight(p => Math.max(p - 1, 0)); break;
    }
  };

  // Obter cores dinâmicas com base no agente atualmente em foco/destaque
  const activeItem = filtered[highlightIndex];
  const activeAgentKey = activeItem ? (KEY_TO_AGENT[activeItem.key] ?? activeItem.key) : 'hw';
  const activeColor = AGENT_COLORS[activeAgentKey] ?? '#25ced1';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Injeção de Estilos CSS customizados para Scrollbar e Efeitos HUD */}
          <style>{`
            .command-bar-scroll::-webkit-scrollbar {
              width: 5px;
            }
            .command-bar-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .command-bar-scroll::-webkit-scrollbar-thumb {
              background: var(--border-card);
              border-radius: 4px;
              transition: background 0.2s ease;
            }
            .command-bar-scroll::-webkit-scrollbar-thumb:hover {
              background: ${activeColor}80;
            }
            @keyframes hudPulse {
              0% { opacity: 0.25; }
              50% { opacity: 0.55; }
              100% { opacity: 0.25; }
            }
            .hud-status-pulse {
              animation: hudPulse 2s infinite ease-in-out;
            }
          `}</style>

          {/* ── Backdrop escuro com blur ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position:       'fixed',
              inset:          0,
              zIndex:         99980,
              background:     theme === 'light' ? 'rgba(241, 245, 249, 0.72)' : 'rgba(1, 3, 12, 0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              pointerEvents:  'auto',
            }}
          />

          {/* ── Modal Principal ── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Painel de Comando"
            initial={{ y: -28, opacity: 0, scale: 0.96 }}
            animate={{ y: 0,   opacity: 1, scale: 1    }}
            exit={{    y: -20, opacity: 0, scale: 0.96 }}
            transition={SPRING_MODAL}
            style={{
              position:   'fixed',
              top:        '22%',
              left:       '50%',
              x:          '-50%',
              zIndex:     99990,
              width:      600,
              maxWidth:   '92vw',
              pointerEvents: 'auto',
              /* HUD/CRT Glass layer & Dotted grid matrix responsivo */
              background: `
                repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                radial-gradient(circle at 50% 50%, var(--bg-card) 0%, var(--bg-card-solid) 100%)
              `,
              backdropFilter: 'blur(36px)',
              WebkitBackdropFilter: 'blur(36px)',
              borderRadius: 16,
              /* Borda HUD dinâmica + Glow */
              border:     `1px solid ${activeColor}${theme === 'light' ? '40' : '33'}`,
              boxShadow:  `
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
                background: `linear-gradient(90deg, transparent, ${activeColor}${theme === 'light' ? '0f' : '30'}, transparent)`,
                pointerEvents: 'none',
                transition: 'top 0.06s linear, background 0.25s ease',
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

            {/* ── Header com label HUD responsivo ── */}
            <div style={{
              display:       'flex',
              alignItems:    'center',
              gap:           8,
              padding:       '10px 18px 8px',
              borderBottom:  '1px solid var(--border-header)',
              background:    'var(--item-bg)',
            }}>
              {/* Pulsing indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="hud-status-pulse" style={{
                  width:        6,
                  height:       6,
                  borderRadius: '50%',
                  background:   activeColor,
                  boxShadow:    `0 0 8px ${activeColor}`,
                  transition:   'background 0.25s ease, box-shadow 0.25s ease',
                }} />
                <span style={{
                  fontFamily:    '"Share Tech Mono", "Fira Code", monospace',
                  fontSize:      9.5,
                  letterSpacing: '2.5px',
                  color:         `${activeColor}b0`,
                  textTransform: 'uppercase',
                  transition:    'color 0.25s ease',
                }}>
                  SYS://PORTAL_COGNITIVO
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <KbdHint>↑↓</KbdHint>
                <span style={{ color: 'var(--text-muted)', fontSize: 9.5, fontFamily: '"Share Tech Mono", monospace' }}>NAVEGAR</span>
                <span style={{ color: 'var(--border-header)', margin: '0 2px' }}>|</span>
                <KbdHint>↵</KbdHint>
                <span style={{ color: 'var(--text-muted)', fontSize: 9.5, fontFamily: '"Share Tech Mono", monospace' }}>EXECUTAR</span>
              </div>
            </div>

            {/* ── Input de busca ── */}
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        14,
              padding:    '18px 24px',
              background: 'var(--item-bg)',
              borderBottom: '1px solid var(--border-header)',
            }}>
              {/* ícone de busca dinâmico */}
              <div style={{ color: activeColor, transition: 'color 0.25s ease', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>

              <input
                ref={inputRef}
                id="command-bar-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Identificar agente ou sub-sistema..."
                spellCheck={false}
                autoComplete="off"
                aria-label="Buscar agente ou comando"
                aria-autocomplete="list"
                aria-controls="command-bar-list"
                aria-activedescendant={filtered[highlightIndex] ? `cmd-item-${filtered[highlightIndex].key}` : undefined}
                style={{
                  flex:        1,
                  background:  'transparent',
                  border:      'none',
                  outline:     'none',
                  fontFamily:  '"Share Tech Mono", "Fira Code", monospace',
                  fontSize:    15,
                  fontWeight:  400,
                  letterSpacing: '0.5px',
                  color:       'var(--text-white)',
                  caretColor:  activeColor,
                  transition:  'caret-color 0.25s ease',
                }}
              />

              {/* badge Esc */}
              <KbdHint theme={theme}>Esc</KbdHint>
            </div>

            {/* ── Linha divisória com glow dinâmico ── */}
            <div style={{
              height:     1,
              background: `linear-gradient(90deg, transparent, ${activeColor}33 30%, ${activeColor}33 70%, transparent)`,
              margin:     '0 24px',
              transition: 'background 0.25s ease',
            }} />

            {/* ── Lista de resultados ── */}
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <motion.ul
                  id="command-bar-list"
                  role="listbox"
                  aria-label="Agentes disponíveis"
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="command-bar-scroll"
                  style={{
                    listStyle: 'none',
                    padding:   '12px',
                    display:   'flex',
                    flexDirection: 'column',
                    gap:       4,
                    maxHeight: 310,
                    overflowY: 'auto',
                  }}
                >
                  {filtered.map((mod, i) => {
                    const isActive    = i === highlightIndex;
                    const agentKey    = KEY_TO_AGENT[mod.key] ?? mod.key;
                    const agentColor  = AGENT_COLORS[agentKey] ?? '#25ced1';
                    const label       = AGENT_LABELS[agentKey] ?? mod.key.toUpperCase();

                    return (
                      <motion.li
                        key={mod.key}
                        id={`cmd-item-${mod.key}`}
                        role="option"
                        aria-selected={isActive}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, delay: i * 0.02 }}
                      >
                        <button
                          onClick={() => commit(mod.key)}
                          onMouseEnter={() => setHighlight(i)}
                          data-cursor="pointer"
                          style={{
                            position:   'relative',
                            display:    'flex',
                            alignItems: 'center',
                            gap:        14,
                            width:      '100%',
                            padding:    '12px 16px',
                            borderRadius: 10,
                            border:     'none',
                            background: 'transparent',
                            cursor:     'pointer',
                            textAlign:  'left',
                            overflow:   'hidden',
                            transition: 'background 0.2s ease',
                          }}
                        >
                          {/* highlight com spring responsivo */}
                          {isActive && (
                            <motion.div
                              layoutId="command-highlight"
                              style={{
                                position:     'absolute',
                                inset:        0,
                                borderRadius: 10,
                                background:   `linear-gradient(90deg, ${agentColor}${theme === 'light' ? '0d' : '18'} 0%, var(--bg-card) 100%)`,
                                border:       `1px solid ${agentColor}33`,
                                borderLeft:   `3.5px solid ${agentColor}`,
                                boxShadow:    `inset 0 0 20px ${agentColor}05`,
                              }}
                              transition={SPRING_HIGHLIGHT}
                            />
                          )}

                          {/* ícone animado */}
                          <div style={{
                            position:       'relative',
                            zIndex:         1,
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            width:          34,
                            height:         34,
                            borderRadius:   8,
                            background:     isActive ? `${agentColor}22` : 'var(--item-bg)',
                            border:         `1px solid ${isActive ? agentColor + '44' : 'var(--item-border)'}`,
                            transition:     'background 0.2s, border 0.2s',
                            flexShrink:     0,
                          }}>
                            <AgentIcon agentKey={agentKey} isFocused={isActive} color={isActive ? agentColor : 'var(--text-muted)'} />
                          </div>

                          {/* textos formatados estilo terminal HUD responsivo */}
                          <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily:    '"Share Tech Mono", "Fira Code", monospace',
                              fontSize:      13.5,
                              fontWeight:    600,
                              letterSpacing: '1px',
                              color:         isActive ? 'var(--text-white)' : 'var(--text-secondary)',
                              transition:    'color 0.2s',
                              textTransform: 'uppercase',
                              whiteSpace:    'nowrap',
                              overflow:      'hidden',
                              textOverflow:  'ellipsis',
                            }}>
                              {mod.title}
                            </div>
                            <div style={{
                              fontFamily:    '"Share Tech Mono", "Fira Code", monospace',
                              fontSize:      9.5,
                              letterSpacing: '1.2px',
                              color:         isActive ? agentColor : 'var(--text-muted)',
                              transition:    'color 0.2s',
                              marginTop:     3,
                              textTransform: 'uppercase',
                              whiteSpace:    'nowrap',
                              overflow:      'hidden',
                              textOverflow:  'ellipsis',
                            }}>
                              {AGENT_DESCRIPTIONS[agentKey] ?? `SYS_AGENT // ${label}`}
                            </div>
                          </div>

                          {/* badge de atalho à direita com micro-interação */}
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, x: 6 }}
                              animate={{ opacity: 1, x: 0 }}
                              style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
                            >
                              <KbdHint accent={agentColor}>↵</KbdHint>
                            </motion.div>
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              ) : (
                /* estado vazio */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding:       '36px 24px',
                    textAlign:     'center',
                    fontFamily:    '"Share Tech Mono", "Fira Code", monospace',
                    fontSize:      12.5,
                    letterSpacing: '1.5px',
                    color:         'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  <div style={{ marginBottom: 8, color: `${activeColor}40`, fontSize: 24, transition: 'color 0.25s ease' }}>◇</div>
                  CONEXÃO PERDIDA :: SEM RESULTADOS PARA &quot;{query}&quot;
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Footer status bar responsivo ── */}
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '10px 24px',
              borderTop:    '1px solid var(--border-header)',
              background:   'var(--item-bg)',
            }}>
              {/* indicador pulsante */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width:        5,
                    height:       5,
                    borderRadius: '50%',
                    background:   activeColor,
                    boxShadow:    `0 0 8px ${activeColor}`,
                    transition:   'background 0.25s ease, box-shadow 0.25s ease',
                  }}
                />
                <span style={{
                  fontFamily:    '"Share Tech Mono", monospace',
                  fontSize:      9.5,
                  letterSpacing: '1.5px',
                  color:         `${activeColor}b0`,
                  textTransform: 'uppercase',
                  transition:    'color 0.25s ease',
                }}>
                  SUB_LINK // INTEGRADO
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <span style={{
                fontFamily:    '"Share Tech Mono", monospace',
                fontSize:      9.5,
                letterSpacing: '1.2px',
                color:         'var(--text-muted)',
                textTransform: 'uppercase',
              }}>
                {filtered.length} NODE{filtered.length !== 1 ? 'S' : ''} DETECTADO{filtered.length !== 1 ? 'S' : ''}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── KbdHint: chip estilo tecla mecânica HUD responsivo ─── */
function KbdHint({ children, accent, theme = 'dark' }: { children: React.ReactNode; accent?: string; theme?: 'dark' | 'light' }) {
  const isLight = theme === 'light';
  return (
    <kbd style={{
      fontFamily:    '"Share Tech Mono", "Fira Code", monospace',
      fontSize:      9,
      fontWeight:    600,
      fontStyle:     'normal',
      letterSpacing: '0.5px',
      color:         accent ?? 'var(--text-secondary)',
      padding:       '2px 6px',
      borderRadius:  4,
      background:    accent ? `${accent}15` : 'var(--item-bg)',
      border:        `1px solid ${accent ? accent + '40' : 'var(--border-card)'}`,
      borderBottom:  `2.5px solid ${accent ? accent + '60' : isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.25)'}`,
      lineHeight:    1,
      display:       'inline-flex',
      alignItems:    'center',
      userSelect:    'none',
      boxShadow:     `0 1px 2px ${isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(0,0,0,0.4)'}`,
    }}>
      {children}
    </kbd>
  );
}
