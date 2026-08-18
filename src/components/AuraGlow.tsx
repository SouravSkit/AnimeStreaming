'use client';

import React from 'react';

type Props = {
  color?: string;
  size?: number;
  className?: string;
  animated?: boolean;
};

function AuraGlow({ color = '#a855f7', size = 200, className = '', animated = true }: Props) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Main glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}33, ${color}11, transparent 70%)`,
          filter: 'blur(30px)',
          animation: animated ? 'energy-pulse 3s ease-in-out infinite' : 'none',
        }}
      />
      {/* Inner ring */}
      <div
        className="absolute inset-[15%] rounded-full border opacity-40"
        style={{
          borderColor: `${color}66`,
          animation: animated ? 'aura-ring 2.5s ease-out infinite' : 'none',
        }}
      />
      {/* Outer ring */}
      <div
        className="absolute inset-[5%] rounded-full border opacity-20"
        style={{
          borderColor: `${color}33`,
          animation: animated ? 'aura-ring 3s ease-out 0.5s infinite' : 'none',
        }}
      />
    </div>
  );
}

export default AuraGlow;
