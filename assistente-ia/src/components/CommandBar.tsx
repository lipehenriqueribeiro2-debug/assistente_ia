import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ModuleEntry {
  key: string;
  title: string;
  aura: string;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleEntry[];
  onSelect: (key: string) => void;
  onSendCommand?: (command: string) => void;
}

const SPRING_MODAL = { type: 'spring' as const, mass: 1, stiffness: 120, damping: 14 };
const SPRING_HIGHLIGHT = { type: 'spring' as const, stiffness: 400, damping: 30 };

export function CommandBar({ isOpen, onClose, modules, onSelect, onSendCommand }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = modules.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setHighlightIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  const commit = (key: string) => {
    onClose();
    onSelect(key);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        commit(filtered[highlightIndex].key);
      } else if (onSendCommand && query.trim()) {
        onClose();
        onSendCommand(query.trim());
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={SPRING_MODAL}
          style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            width: 520,
            maxWidth: '90vw',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 22px',
              borderBottom: '1px solid var(--hairline)',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: '#64748b',
                letterSpacing: '-0.15px',
              }}
            >
              ▶
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte qualquer coisa..."
              spellCheck={false}
              autoComplete="off"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: '-0.2px',
                color: '#fcfdff',
              }}
            />
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '4px 8px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Esc
            </span>
          </div>

          {filtered.length > 0 && (
            <div
              style={{
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((mod, i) => (
                  <motion.button
                    key={mod.key}
                    layout
                    onClick={() => commit(mod.key)}
                    onMouseEnter={() => setHighlightIndex(i)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    {i === highlightIndex && (
                      <motion.div
                        layoutId="command-highlight"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.06)',
                        }}
                        transition={SPRING_HIGHLIGHT}
                      />
                    )}
                    <span
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: mod.aura,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: '-0.15px',
                        color: i === highlightIndex ? '#fcfdff' : '#94a3b8',
                      }}
                    >
                      {mod.title}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
