import React, { useMemo } from 'react';

interface HeartParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  symbol: string;
  opacity: number;
}

export const FloatingHearts: React.FC = () => {
  const symbols = ['💖', '💕', '💗', '💓', '✨', '🌸', '🌷', '💝'];

  const particles: HeartParticle[] = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.floor(Math.random() * 95) + 2,
      size: Math.floor(Math.random() * 16) + 16,
      duration: Math.floor(Math.random() * 6) + 6,
      delay: Math.floor(Math.random() * 8),
      symbol: symbols[i % symbols.length],
      opacity: Math.random() * 0.4 + 0.3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-[-50px] animate-float-heart"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
};
