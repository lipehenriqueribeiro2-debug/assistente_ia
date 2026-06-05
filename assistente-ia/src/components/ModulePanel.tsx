import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from './MagneticButton';

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

interface ModulePanelProps {
  title: string;
  auraColor: string;
  lines: string[];
  mono?: boolean;
  isOpen: boolean;
  onClose: () => void;
  delay?: number;
  mouseX?: number;
  mouseY?: number;
  bass?: number;
  reducedMotion?: boolean;
  theme?: 'dark' | 'light';
}

const FLIP_EASE = [0.85, 0, 0.15, 1] as const;
const FLIP_DURATION = 0.7;

const lineStyle = (mono?: boolean) => ({
  fontFamily: mono
    ? "'Share Tech Mono', 'IBM Plex Mono', monospace"
    : 'Inter, system-ui, sans-serif',
  fontSize: mono ? 11 : 12,
  lineHeight: '18px',
  letterSpacing: mono ? 'normal' : '-0.15px',
  fontVariantNumeric: mono ? 'tabular-nums' as const : 'normal' as const,
});

const textColor = (mono?: boolean) => mono ? 'var(--text-secondary)' : 'var(--text-primary)';

export function ModulePanel({ title, auraColor, lines, mono, isOpen, onClose, delay = 0, mouseX = 0, mouseY = 0, bass = 0, reducedMotion = false, theme = 'dark' }: ModulePanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scanLine, setScanLine] = useState(0);
  const [r, g, b] = hexToRgb(auraColor);
  const dist = reducedMotion ? 0 : Math.min(Math.hypot(mouseX, mouseY), 1);
  const pulse = reducedMotion ? 1 : 1 + bass * 2;

  const specX = reducedMotion ? 0 : mouseX * 6;
  const specY = reducedMotion ? 0 : mouseY * 6;
  const specBlur = reducedMotion ? 0 : 4 + dist * 10;

  const shadX = reducedMotion ? 0 : -mouseX * 5;
  const shadY = reducedMotion ? 0 : -mouseY * 5;
  const shadBlur = reducedMotion ? 0 : 8 + dist * 10;

  const boxShadow = reducedMotion ? 'none' : `
    ${specX * pulse}px ${specY * pulse}px ${specBlur * pulse}px rgba(${r},${g},${b},${0.06 + dist * 0.08 + bass * 0.12}),
    ${specX * 2 * pulse}px ${specY * 2 * pulse}px ${specBlur * 2 * pulse}px rgba(${r},${g},${b},${0.02 + dist * 0.04 + bass * 0.06}),
    inset ${shadX}px ${shadY}px ${shadBlur}px rgba(0,0,0,${0.2 + dist * 0.2})
  `;

  const lightSweep = reducedMotion ? 'none' : `radial-gradient(circle at ${50 + mouseX * 30}% ${50 + mouseY * 30}%, rgba(${r},${g},${b},${0.08 + bass * 0.2}) 0%, transparent 60%)`;

  /* scan-line animada a cada 90ms */
  useEffect(() => {
    const id = setInterval(() => setScanLine(p => (p + 1) % 100), 90);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Custom style for scrollbar thumb responsivo */}
          <style>{`
            .module-panel-scroll::-webkit-scrollbar {
              width: 5px;
            }
            .module-panel-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .module-panel-scroll::-webkit-scrollbar-thumb {
              background: var(--border-card);
              border-radius: 4px;
            }
            .module-panel-scroll::-webkit-scrollbar-thumb:hover {
              background: ${auraColor}80;
            }
          `}</style>

          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ type: 'spring', mass: 1, stiffness: 120, damping: 14, delay }}
            style={{
              position: 'relative',
              /* HUD/CRT Glass layer & Dotted grid matrix responsivo */
              background: `
                repeating-linear-gradient(0deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                repeating-linear-gradient(90deg, var(--item-border) 0px, var(--item-border) 1px, transparent 1px, transparent 4px),
                radial-gradient(circle at 50% 50%, var(--bg-card) 0%, var(--bg-card-solid) 100%)
              `,
              backdropFilter: 'blur(36px)',
              WebkitBackdropFilter: 'blur(36px)',
              border: `1px solid ${auraColor}${theme === 'light' ? '40' : '33'}`,
              borderRadius: '16px',
              width: 400,
              pointerEvents: 'auto',
              boxShadow: `
                0 0 0 1px ${auraColor}${theme === 'light' ? '08' : '0f'},
                0 0 40px ${auraColor}${theme === 'light' ? '06' : '12'},
                var(--shadow-card),
                inset 0 1px 0 ${theme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.05)'},
                ${boxShadow}
              `,
              overflow: 'hidden',
              transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            {/* ── Linha de scan dinâmica e decorativa ── */}
            <div
              aria-hidden="true"
              style={{
                position:   'absolute',
                top:        `${scanLine}%`,
                left:       0,
                right:      0,
                height:     1,
                background: `linear-gradient(90deg, transparent, ${auraColor}20, transparent)`,
                pointerEvents: 'none',
                transition: 'top 0.09s linear, background 0.25s ease',
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
                  width:       10,
                  height:      10,
                  pointerEvents: 'none',
                  zIndex:      2,
                  borderColor: `${auraColor}aa`,
                  borderStyle: 'solid',
                  transition:  'border-color 0.25s ease',
                  ...(c === 'tl' && { top: 5, left: 5,   borderWidth: '1.5px 0 0 1.5px', borderRadius: '2px 0 0 0' }),
                  ...(c === 'tr' && { top: 5, right: 5,  borderWidth: '1.5px 1.5px 0 0', borderRadius: '0 2px 0 0' }),
                  ...(c === 'bl' && { bottom: 5, left: 5,  borderWidth: '0 0 1.5px 1.5px', borderRadius: '0 0 0 2px' }),
                  ...(c === 'br' && { bottom: 5, right: 5, borderWidth: '0 1.5px 1.5px 0', borderRadius: '0 0 2px 0' }),
                }}
              />
            ))}

            {!reducedMotion && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: lightSweep,
                  borderRadius: '16px',
                  pointerEvents: 'none',
                }}
              />
            )}

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-header)',
                background: 'var(--item-bg)',
                zIndex: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedIndex !== null && (
                  <MagneticButton onClick={() => setSelectedIndex(null)}>
                    <span style={{ fontSize: 12, lineHeight: 1, color: 'var(--text-secondary)' }}>←</span>
                  </MagneticButton>
                )}
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: auraColor,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${auraColor}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                    color: 'var(--text-white)',
                    textTransform: 'uppercase',
                  }}
                >
                  {title}
                </span>
              </div>

              <MagneticButton onClick={onClose}>
                <span style={{ fontSize: 14, lineHeight: 1, color: 'var(--text-muted)' }}>✕</span>
              </MagneticButton>
            </div>

            <div
              className="module-panel-scroll"
              style={{
                position: 'relative',
                padding: '14px 20px',
                minHeight: lines.length * 26,
                zIndex: 2,
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              <AnimatePresence mode="popLayout">
                {selectedIndex === null
                  ? lines.map((line, i) => (
                      <motion.div
                        key={`item-${i}`}
                        layoutId={`item-${i}`}
                        layout="position"
                        onClick={() => setSelectedIndex(i)}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'tween', ease: FLIP_EASE, duration: FLIP_DURATION }}
                        style={{
                          ...lineStyle(mono),
                          color: textColor(mono),
                          borderRadius: 8,
                          padding: '10px 14px',
                          marginBottom: 8,
                          cursor: 'pointer',
                          backgroundColor: 'var(--item-bg)',
                          border: '1px solid var(--item-border)',
                          transition: 'border-color 0.2s, background-color 0.2s',
                        }}
                        whileHover={{
                          backgroundColor: `${auraColor}0c`,
                          borderColor: `${auraColor}44`,
                        }}
                      >
                        {line}
                      </motion.div>
                    ))
                  : (
                      <motion.div
                        key="detail"
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'tween', ease: FLIP_EASE, duration: FLIP_DURATION }}
                      >
                        <motion.div
                          layoutId={`item-${selectedIndex}`}
                          transition={{ type: 'tween', ease: FLIP_EASE, duration: FLIP_DURATION }}
                          style={{
                            ...lineStyle(mono),
                            color: textColor(mono),
                            borderRadius: 0,
                            padding: '16px 20px',
                            margin: '-14px -20px',
                            backgroundColor: 'var(--item-bg)',
                            borderBottom: '1px solid var(--border-header)',
                            fontSize: mono ? 12 : 13,
                            lineHeight: '22px',
                          }}
                        >
                          {lines[selectedIndex]}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.25 }}
                          style={{ marginTop: 16 }}
                        >
                          <div
                            style={{
                              fontFamily: 'Inter, system-ui, sans-serif',
                              fontSize: 11,
                              lineHeight: '18px',
                              color: '#64748b',
                              letterSpacing: '-0.1px',
                              marginBottom: 12,
                            }}
                          >
                            Detalhes adicionais e metadados do item selecionado apareceriam aqui.
                          </div>
                          <MagneticButton onClick={() => setSelectedIndex(null)}>
                            <span
                              style={{
                                fontFamily: '"Share Tech Mono", monospace',
                                fontSize: 11,
                                fontWeight: 500,
                                color: auraColor,
                                letterSpacing: '0.3px',
                                textTransform: 'uppercase',
                              }}
                            >
                              ← Voltar
                            </span>
                          </MagneticButton>
                        </motion.div>
                      </motion.div>
                    )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
