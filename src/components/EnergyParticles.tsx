'use client';

import React, { useMemo } from 'react';

type Props = {
  count?: number;
  color?: string;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
};

function EnergyParticles({ count = 30, color = '#a855f7', className = '', speed = 'normal' }: Props) {
  const speedMap = { slow: 12, normal: 8, fast: 5 };

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      duration: Math.random() * speedMap[speed] + speedMap[speed],
      delay: Math.random() * 10,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, [count, speed]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${color}, transparent)`,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
            animation: `particle-float ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

export default EnergyParticles;
