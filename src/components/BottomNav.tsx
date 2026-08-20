'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, User } from 'lucide-react';

const tabs = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Browse', href: '/browse', icon: Compass },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Profile', href: '/profile', icon: User },
];

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glow line at top */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />

      <div className="glass-strong">
        <div className="mx-auto flex max-w-lg items-center justify-around py-3">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== '/' && pathname.startsWith(tab.href));
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`group relative flex flex-col items-center gap-1 px-3 py-1 transition-all duration-300 ${
                  isActive ? 'scale-110' : 'opacity-50 hover:opacity-80'
                }`}
              >
                {/* Active glow background */}
                {isActive && (
                  <div className="absolute -inset-2 rounded-xl bg-gradient-to-b from-neon-purple/20 to-transparent blur-sm" />
                )}

                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`transition-colors duration-300 ${
                      isActive ? 'text-neon-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'text-gray-400'
                    }`}
                  />
                </div>

                {isActive && (
                  <span className="relative text-[10px] font-medium text-white">
                    {tab.name}
                  </span>
                )}

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-neon-purple shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
