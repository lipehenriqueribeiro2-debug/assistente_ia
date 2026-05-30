import { useState, useEffect, useRef } from 'react';

export function useSimulatedAudio() {
  const [bass, setBass] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    let lastKick = performance.now();
    let nextInterval = 1200 + Math.random() * 800;

    const loop = (now: number) => {
      const elapsed = now - lastKick;

      if (elapsed >= nextInterval) {
        lastKick = now;
        nextInterval = 1000 + Math.random() * 1200;
      }

      const sinceKick = now - lastKick;
      const kickEnv = Math.max(0, 1 - sinceKick / 350) * (0.6 + Math.random() * 0.4);
      const osc = Math.sin(now * 0.002) * 0.08 + Math.sin(now * 0.005) * 0.05;
      const value = Math.max(0, Math.min(1, kickEnv * 0.9 + osc * 0.3));

      setBass(value);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return bass;
}
