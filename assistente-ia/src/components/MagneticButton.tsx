import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

const SPRING_SLINGSHOT = { stiffness: 400, damping: 25 };

export function MagneticButton({ children, onClick }: MagneticButtonProps) {
  const hitboxRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);

  const springX = useSpring(x, SPRING_SLINGSHOT);
  const springY = useSpring(y, SPRING_SLINGSHOT);
  const springInnerX = useSpring(innerX, SPRING_SLINGSHOT);
  const springInnerY = useSpring(innerY, SPRING_SLINGSHOT);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const maxDist = 20;
    const angle = Math.atan2(distY, distX);
    const distance = Math.min(Math.hypot(distX, distY), maxDist);
    const pullX = Math.cos(angle) * distance;
    const pullY = Math.sin(angle) * distance;
    x.set(pullX);
    y.set(pullY);
    innerX.set(pullX * 0.25);
    innerY.set(pullY * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    innerX.set(0);
    innerY.set(0);
  };

  return (
    <div
      ref={hitboxRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        margin: -14,
        cursor: 'pointer',
      }}
    >
      <motion.button
        ref={btnRef}
        onClick={onClick}
        style={{ x: springX, y: springY }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span style={{ x: springInnerX, y: springInnerY, display: 'block' }}>
          {children}
        </motion.span>
      </motion.button>
    </div>
  );
}
