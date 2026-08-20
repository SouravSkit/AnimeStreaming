'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, User } from 'lucide-react';

const tabs = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Browse', href: '/browse', icon: Compass },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Profile', href: '/profile', icon: User },
];

function DesktopHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 hidden lg:block">
      <div className="glass-strong">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-3 xl:px-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 212, 255, 0.15))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <span className="text-lg">⚡</span>
            </div>
            <span
              className="text-lg font-black tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #ffffff, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ZENKAI
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                (tab.href !== '/' && pathname.startsWith(tab.href));
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Glow line at bottom */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
    </header>
  );
}

export default DesktopHeader;
