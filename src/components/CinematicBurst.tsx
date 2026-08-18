'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  active: boolean;
  color?: string;
  onComplete?: () => void;
};

function CinematicBurst({ active, color = '#a855f7', onComplete }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Central burst */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${color}44, transparent 60%)`,
          animation: 'energy-pulse 0.7s ease-out forwards',
        }}
      />
      {/* Horizontal light streak */}
      <div
        className="absolute top-1/2 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}88, transparent)`,
          transform: 'translateY(-50%)',
          animation: 'cinematic-reveal 0.5s ease-out forwards',
          filter: `blur(1px) drop-shadow(0 0 10px ${color})`,
        }}
      />
      {/* Screen edge flash */}
      <div
        className="absolute inset-0 border-2 rounded-none"
        style={{
          borderColor: `${color}33`,
          animation: 'energy-pulse 0.6s ease-out forwards',
        }}
      />
    </div>
  );
}

export default CinematicBurst;
