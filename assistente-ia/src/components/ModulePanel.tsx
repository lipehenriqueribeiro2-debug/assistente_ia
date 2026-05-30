import { useState } from 'react';
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
}

const FLIP_EASE = [0.85, 0, 0.15, 1] as const;
const FLIP_DURATION = 0.7;

const lineStyle = (mono?: boolean) => ({
  fontFamily: mono
    ? "'IBM Plex Mono', monospace"
    : 'Inter, system-ui, sans-serif',
  fontSize: mono ? 11 : 12,
  lineHeight: '18px',
  letterSpacing: mono ? 'normal' : '-0.15px',
  fontVariantNumeric: mono ? 'tabular-nums' as const : 'normal' as const,
});

const textColor = (mono?: boolean) => mono ? '#cbd5e1' : '#e2e8f0';

export function ModulePanel({ title, auraColor, lines, mono, isOpen, onClose, delay = 0, mouseX = 0, mouseY = 0, bass = 0, reducedMotion = false }: ModulePanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100vh', opacity: 0 }}
          transition={{ type: 'spring', mass: 1, stiffness: 120, damping: 14, delay }}
          style={{
            position: 'relative',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            width: 400,
            pointerEvents: 'auto',
            boxShadow,
            overflow: 'hidden',
          }}
        >
          {!reducedMotion && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: lightSweep,
                borderRadius: '6px',
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
              borderBottom: '1px solid var(--hairline)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {selectedIndex !== null && (
                <MagneticButton onClick={() => setSelectedIndex(null)}>
                  <span style={{ fontSize: 12, lineHeight: 1, color: '#94a3b8' }}>←</span>
                </MagneticButton>
              )}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: auraColor,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '-0.3px',
                  color: '#fcfdff',
                }}
              >
                {title}
              </span>
            </div>

            <MagneticButton onClick={onClose}>
              <span style={{ fontSize: 14, lineHeight: 1, color: 'var(--hairline)' }}>✕</span>
            </MagneticButton>
          </div>

          <div
            style={{
              position: 'relative',
              padding: '14px 20px',
              minHeight: lines.length * 26,
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
                        borderRadius: 6,
                        padding: '10px 14px',
                        marginBottom: 8,
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                      whileHover={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderColor: `rgba(${r},${g},${b},0.2)`,
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
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
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
      )}
    </AnimatePresence>
  );
}
