'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import EnergyParticles from '@/components/EnergyParticles';
import AuraGlow from '@/components/AuraGlow';

function LandingPage() {
  const { skipAuth } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-deep">
      {/* === Background Layers === */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep via-[#0a0520] to-deep" />

        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-neon-purple/10 via-transparent to-transparent" />

        {/* Ambient mesh */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 h-full w-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.05)_60deg,transparent_120deg,rgba(0,212,255,0.03)_180deg,transparent_240deg,rgba(168,85,247,0.05)_300deg,transparent_360deg)]" />
        </div>

        {/* Particles */}
        <EnergyParticles count={40} color="#a855f7" speed="slow" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,0,20,0.5)_70%,rgba(3,0,20,0.95)_100%)]" />
      </div>

      {/* === Main Aura === */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
        style={{ animation: mounted ? 'scale-in 2s ease-out forwards' : 'none' }}
      >
        <AuraGlow color="#a855f7" size={400} />
      </div>

      {/* === Content === */}
      <div
        className="relative z-10 text-center"
        style={{ animation: mounted ? 'slide-up 1s ease-out 0.3s both' : 'none' }}
      >
        {/* Logo Mark */}
        <div className="mb-6">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 212, 255, 0.1))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 0 40px rgba(168, 85, 247, 0.2), 0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span className="text-3xl">⚡</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="mb-3 text-6xl font-black tracking-wider sm:text-8xl"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #a855f7, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.3))',
          }}
        >
          ZENKAI
        </h1>

        <p
          className="mb-2 text-lg font-light tracking-widest text-white/50"
          style={{ animation: mounted ? 'slide-up 1s ease-out 0.5s both' : 'none' }}
        >
          PREMIUM ANIME STREAMING
        </p>

        <div
          className="mx-auto mb-10 h-[1px] w-40"
          style={{
            background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
          }}
        />

        <p
          className="mx-auto mb-10 max-w-md px-4 text-sm leading-relaxed text-white/40"
          style={{ animation: mounted ? 'slide-up 1s ease-out 0.7s both' : 'none' }}
        >
          Enter a universe of legendary anime. Stream thousands of titles in stunning quality with an immersive cinematic experience.
        </p>
      </div>

      {/* === Skip Button === */}
      <div
        className="absolute right-6 top-6 z-20 sm:right-10 sm:top-10"
        style={{ animation: mounted ? 'slide-up 0.6s ease-out 0.4s both' : 'none' }}
      >
        <button
          onClick={skipAuth}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-light text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Skip →
        </button>
      </div>

      {/* === Action Buttons === */}
      <div
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 px-8"
        style={{ animation: mounted ? 'slide-up 1s ease-out 0.9s both' : 'none' }}
      >
        <Link href="/login" className="w-full">
          <button className="btn-cinematic w-full rounded-2xl py-4 font-poppins text-base font-semibold text-white">
            Login
          </button>
        </Link>
        <Link href="/register" className="w-full">
          <button className="btn-outline-cinematic w-full rounded-2xl py-4 font-poppins text-base font-medium text-white">
            Create Account
          </button>
        </Link>
      </div>

      {/* === Bottom decorative line === */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ animation: mounted ? 'slide-up 1s ease-out 1.2s both' : 'none' }}
      >
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{
                width: i === 2 ? 24 : 8,
                background:
                  i === 2
                    ? 'linear-gradient(90deg, #a855f7, #00d4ff)'
                    : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
