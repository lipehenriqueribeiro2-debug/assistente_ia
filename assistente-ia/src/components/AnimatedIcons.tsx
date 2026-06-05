/**
 * AnimatedIcons.tsx
 * ─────────────────────────────────────────────────────────────────
 * Sistema centralizado de ícones com micro-animações para o Aura OS.
 *
 * Padrões de animação implementados (referência: animações-ícones.mp4):
 *  • Stroke draw-on  — paths SVG animam seu comprimento (pathLength 0→1)
 *  • Spring bounce   — scale com mola física ao pressionar / ativar
 *  • Morph state     — ícone muda forma entre dois estados (mic on/off, etc.)
 *  • Continuous spin — ícone gira continuamente enquanto ativo (settings, loading)
 *  • Shake trigger   — vibração rápida de uma execução ao ativar (send)
 *  • Pulse ring      — expansão de anel de glow ao redor de ícones ativos
 *
 * Uso:
 *   <IconMic isActive={isListening} size={14} />
 *   <IconSend onClick={handleSend} size={14} />
 *   <IconSettings isOpen={open} size={15} />
 * ─────────────────────────────────────────────────────────────────
 */

import { motion, AnimatePresence, useAnimation, type Variants } from 'framer-motion';
import { useEffect, useRef } from 'react';

// ─── Constantes de timing ────────────────────────────────────────
const SPRING_SNAPPY  = { type: 'spring', stiffness: 400, damping: 18 } as const;
const SPRING_BOUNCY  = { type: 'spring', stiffness: 260, damping: 12 } as const;
const EASE_SMOOTH    = { duration: 0.25, ease: [0.4, 0, 0.2, 1] } as const;
const DRAW_SLOW      = { duration: 0.5, ease: 'easeOut' } as const;

// ─── Variantes de shake (enviar mensagem) ────────────────────────
const shakeVariants: Variants = {
  idle:  { x: 0, rotate: 0 },
  shake: {
    x: [0, -4, 5, -3, 3, -1, 0],
    rotate: [0, -8, 8, -5, 5, 0],
    transition: { duration: 0.4, ease: 'easeInOut' }
  },
};

// ─── Props comuns ────────────────────────────────────────────────
interface BaseIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ═══════════════════════════════════════════════════════════════
// 1. MICROFONE — morph entre ativo/inativo + anel pulsante
// ═══════════════════════════════════════════════════════════════
interface IconMicProps extends BaseIconProps {
  isActive?: boolean;
  onClick?: () => void;
}

export function IconMic({ isActive = false, size = 14, color = 'currentColor', strokeWidth = 2, style }: IconMicProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={isActive ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : SPRING_SNAPPY}
    >
      <AnimatePresence mode="wait">
        {isActive ? (
          // Estado ativo: cápsula do microfone + ondas sonoras
          <motion.g
            key="active"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={SPRING_BOUNCY}
          >
            <motion.path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={DRAW_SLOW}
            />
            <motion.path
              d="M19 10v2a7 7 0 0 1-14 0v-2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ ...DRAW_SLOW, delay: 0.15 }}
            />
            <motion.line
              x1="12" y1="19" x2="12" y2="23"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ ...DRAW_SLOW, delay: 0.25 }}
            />
            <motion.line
              x1="8" y1="23" x2="16" y2="23"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ ...DRAW_SLOW, delay: 0.3 }}
            />
          </motion.g>
        ) : (
          // Estado inativo: desenha o ícone estático
          <motion.g
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={EASE_SMOOTH}
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. SETTINGS (GEAR) — rotação spring ao abrir + spin contínuo
// ═══════════════════════════════════════════════════════════════
interface IconSettingsProps extends BaseIconProps {
  isOpen?: boolean;
}

export function IconSettings({ isOpen = false, size = 15, color = 'currentColor', strokeWidth = 2, style }: IconSettingsProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      animate={{ rotate: isOpen ? 90 : 0 }}
      transition={SPRING_BOUNCY}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. FECHAR (X) — rotação 180° com spring ao hover
// ═══════════════════════════════════════════════════════════════
interface IconCloseProps extends BaseIconProps {
  isHovered?: boolean;
}

export function IconClose({ isHovered = false, size = 13, color = 'currentColor', strokeWidth = 2, style }: IconCloseProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      animate={{ rotate: isHovered ? 90 : 0, scale: isHovered ? 1.1 : 1 }}
      transition={SPRING_BOUNCY}
    >
      <motion.line
        x1="18" y1="6" x2="6" y2="18"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={DRAW_SLOW}
      />
      <motion.line
        x1="6" y1="6" x2="18" y2="18"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ ...DRAW_SLOW, delay: 0.1 }}
      />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. ENVIAR (PAPER PLANE) — shake ao disparar
// ═══════════════════════════════════════════════════════════════
interface IconSendProps extends BaseIconProps {
  onSend?: () => void;
  triggered?: boolean;
}

export function IconSend({ triggered = false, size = 14, color = 'currentColor', strokeWidth = 2, style }: IconSendProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      variants={shakeVariants}
      animate={triggered ? 'shake' : 'idle'}
    >
      <motion.line
        x1="22" y1="2" x2="11" y2="13"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={DRAW_SLOW}
      />
      <motion.polygon
        points="22 2 15 22 11 13 2 9 22 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ ...DRAW_SLOW, delay: 0.1 }}
      />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. CHEVRON (dropdown / voltar) — rotação suave de estado
// ═══════════════════════════════════════════════════════════════
interface IconChevronProps extends BaseIconProps {
  direction?: 'down' | 'up' | 'left' | 'right';
  isOpen?: boolean;
}

export function IconChevron({ direction = 'down', isOpen = false, size = 12, color = 'currentColor', strokeWidth = 2, style }: IconChevronProps) {
  const baseRotation = { down: 0, up: 180, left: 90, right: -90 }[direction];
  const openRotation = isOpen ? baseRotation + 180 : baseRotation;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      animate={{ rotate: openRotation }}
      transition={SPRING_SNAPPY}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. CHAT BUBBLE — draw-on ao entrar em cena
// ═══════════════════════════════════════════════════════════════
export function IconChat({ size = 14, color = 'currentColor', strokeWidth = 2, style }: BaseIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING_BOUNCY}
    >
      <motion.path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={DRAW_SLOW}
      />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. MAXIMIZE / EXPAND — escala com spring ao hover
// ═══════════════════════════════════════════════════════════════
interface IconMaximizeProps extends BaseIconProps {
  isHovered?: boolean;
}

export function IconMaximize({ isHovered = false, size = 13, color = 'currentColor', strokeWidth = 2, style }: IconMaximizeProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      animate={{ scale: isHovered ? 1.15 : 1 }}
      transition={SPRING_BOUNCY}
    >
      <motion.path d="M15 3h6v6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={DRAW_SLOW} />
      <motion.path d="M9 21H3v-6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...DRAW_SLOW, delay: 0.1 }} />
      <motion.path d="M21 3l-7 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...DRAW_SLOW, delay: 0.2 }} />
      <motion.path d="M3 21l7-7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...DRAW_SLOW, delay: 0.25 }} />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. VOLTAR (chevron esquerdo) — slide-in animado
// ═══════════════════════════════════════════════════════════════
export function IconBack({ size = 14, color = 'currentColor', strokeWidth = 2, style }: BaseIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      initial={{ x: 4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={SPRING_SNAPPY}
      whileHover={{ x: -2 }}
    >
      <motion.polyline
        points="15 18 9 12 15 6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={DRAW_SLOW}
      />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. ÍCONES DOS MODELOS DE AGENTE
//    Cada agente tem animação idiossincrática ao ser focado
// ═══════════════════════════════════════════════════════════════
interface IconAgentProps extends BaseIconProps {
  isFocused?: boolean;
}

// ORQ — Estrela (Orquestrador): rotação + pulsação
export function IconOrq({ isFocused = false, size = 14, color = 'currentColor', strokeWidth = 2, style }: IconAgentProps) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}
      animate={isFocused ? { rotate: [0, 20, -15, 10, 0], scale: [1, 1.2, 1] } : { rotate: 0, scale: 1 }}
      transition={isFocused ? { duration: 0.6, ease: 'easeOut' } : SPRING_SNAPPY}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </motion.svg>
  );
}

// EST — Livro (Estudos): abertura das páginas ao focar
export function IconEst({ isFocused = false, size = 14, color = 'currentColor', strokeWidth = 2, style }: IconAgentProps) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}
      animate={isFocused ? { scaleY: [1, 0.85, 1.1, 1] } : { scaleY: 1 }}
      transition={isFocused ? SPRING_BOUNCY : SPRING_SNAPPY}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </motion.svg>
  );
}

// RPG — Layers/Camadas (Mestre RPG): empilhamento 3D ao focar
export function IconRpg({ isFocused = false, size = 14, color = 'currentColor', strokeWidth = 2, style }: IconAgentProps) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}
      animate={isFocused ? { y: [0, -3, 1, 0] } : { y: 0 }}
      transition={isFocused ? SPRING_BOUNCY : SPRING_SNAPPY}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </motion.svg>
  );
}

// HW — Server (Hardware): piscar dos LEDs ao focar
export function IconHw({ isFocused = false, size = 14, color = 'currentColor', strokeWidth = 2, style }: IconAgentProps) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}
      animate={isFocused ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={isFocused ? { duration: 0.4 } : SPRING_SNAPPY}
    >
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <motion.line
        x1="6" y1="6" x2="6.01" y2="6"
        animate={isFocused ? { opacity: [1, 0, 1, 0, 1] } : { opacity: 1 }}
        transition={isFocused ? { duration: 0.5 } : {}}
      />
      <motion.line
        x1="6" y1="18" x2="6.01" y2="18"
        animate={isFocused ? { opacity: [1, 0, 1, 0, 1] } : { opacity: 1 }}
        transition={isFocused ? { duration: 0.5, delay: 0.1 } : {}}
      />
    </motion.svg>
  );
}

// POW — Bolt/Raio (Potência): flash de energia ao focar
export function IconPow({ isFocused = false, size = 14, color = 'currentColor', strokeWidth = 2, style }: IconAgentProps) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}
      animate={isFocused
        ? { scale: [1, 1.3, 0.9, 1.15, 1], rotate: [0, -5, 5, 0] }
        : { scale: 1, rotate: 0 }
      }
      transition={isFocused ? { duration: 0.5, ease: 'easeOut' } : SPRING_SNAPPY}
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. HOOK — useIconHover para ícones com isHovered controlado
// ═══════════════════════════════════════════════════════════════
export function useIconHover() {
  const [isHovered, setIsHovered] = React.useState(false);
  return {
    isHovered,
    hoverProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// 11. HOOK — useIconSend para animação de envio
// ═══════════════════════════════════════════════════════════════
export function useIconSend(onSend: () => void) {
  const [triggered, setTriggered] = React.useState(false);

  const handleSend = () => {
    setTriggered(true);
    onSend();
    setTimeout(() => setTriggered(false), 450);
  };

  return { triggered, handleSend };
}

// Importação necessária para os hooks acima
import React from 'react';
