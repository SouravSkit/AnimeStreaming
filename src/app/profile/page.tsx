'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import EnergyParticles from '@/components/EnergyParticles';
import { LogOut, User, Settings, Heart, Clock, Download, ChevronRight, Shield, Sparkles } from 'lucide-react';
import AdContainer from '@/components/AdContainer';

function ProfilePage() {
  const router = useRouter();
  const { auth, name, email, image, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Authenticated view
  if (auth) {
    const menuItems = [
      { icon: Heart, label: 'My Favorites', desc: 'Anime you\'ve saved', color: '#ef4444' },
      { icon: Clock, label: 'Watch History', desc: 'Continue watching', color: '#a855f7' },
      { icon: Download, label: 'Downloads', desc: 'Offline content', color: '#22d3ee' },
      { icon: Settings, label: 'Settings', desc: 'App preferences', color: '#f59e0b' },
      { icon: Shield, label: 'Privacy', desc: 'Account security', color: '#10b981' },
    ];

    return (
      <div className="relative min-h-screen bg-deep">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 bg-gradient-radial from-neon-purple/8 to-transparent" />
          <EnergyParticles count={15} color="#a855f7" speed="slow" className="opacity-15" />
        </div>

        <div className="relative z-10 mx-auto max-w-lg lg:max-w-xl xl:max-w-2xl px-4 sm:px-6 lg:px-10 pb-32 pt-8 lg:pt-16">
          {/* Profile Card */}
          <div className="glass-strong rounded-3xl p-8 text-center">
            {/* Avatar */}
            <div className="relative mx-auto mb-5 w-fit">
              {/* Glow ring */}
              <div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #00d4ff, #a855f7)',
                  backgroundSize: '300% 300%',
                  animation: 'gradient-shift 4s ease infinite',
                  filter: 'blur(8px)',
                  opacity: 0.4,
                }}
              />
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/10 bg-deep-alt">
                {image ? (
                  <img src={image} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-blue/10">
                    <User size={40} className="text-neon-purple/60" />
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <p className="mt-1 text-sm text-white/40">{email}</p>

            {/* Stats */}
            <div className="mt-6 flex justify-center gap-8">
              {[
                { label: 'Watching', value: '12' },
                { label: 'Completed', value: '48' },
                { label: 'Favorites', value: '23' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold gradient-text">{stat.value}</p>
                  <p className="text-[11px] text-white/30">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="mt-6 space-y-2">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
                  style={{ animation: `slide-up 0.4s ease-out ${i * 0.05}s both` }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}22`,
                    }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-white/30">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-neon-crimson/20 bg-neon-crimson/5 p-4 text-sm font-medium text-neon-crimson transition-all duration-300 hover:border-neon-crimson/40 hover:bg-neon-crimson/10"
          >
            <LogOut size={16} />
            Sign Out
          </button>

          {/* Ad Container - Below Menu Items */}
          <div className="mt-6">
            <AdContainer id="profile-below-menu" position="below-video" />
          </div>

          {/* Version */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-white/15">Version 1.0.0 • © zenexcom</p>
          </div>
        </div>
      </div>
    );
  }

  // Guest view
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-deep">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-deep via-[#0a0520] to-deep" />
        <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-neon-purple/8 to-transparent" />
        <EnergyParticles count={25} color="#a855f7" speed="slow" />
      </div>

      <div className="relative z-10 text-center px-8 w-full max-w-sm lg:max-w-lg">
        <div
          className="mx-auto mb-6 flex h-20 w-20 lg:h-28 lg:w-28 items-center justify-center rounded-2xl lg:rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 212, 255, 0.1))',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          <Sparkles size={32} className="text-neon-purple lg:hidden" />
          <Sparkles size={48} className="text-neon-purple hidden lg:block" />
        </div>

        <h1 className="text-2xl lg:text-4xl font-bold text-white">Join Zenkai</h1>
        <p className="mt-2 text-sm lg:text-lg text-white/40">Sign in to track your anime journey</p>

        <div className="mt-8 lg:mt-12 flex flex-col gap-4 lg:gap-5">
          <Link href="/login" className="w-full">
            <button className="btn-cinematic w-full rounded-2xl py-4 lg:py-5 lg:text-lg font-semibold text-white">
              Sign In
            </button>
          </Link>
          <Link href="/register" className="w-full">
            <button className="btn-outline-cinematic w-full rounded-2xl py-4 lg:py-5 lg:text-lg font-medium text-white">
              Create Account
            </button>
          </Link>
        </div>

        {/* Ad Container - Guest View */}
        <div className="mt-10 w-full">
          <AdContainer id="profile-guest" position="below-video" />
        </div>

        <p className="mt-8 text-[11px] text-white/15">Version 1.0.0 • © zenexcom</p>
      </div>
    </div>
  );
}

export default ProfilePage;
