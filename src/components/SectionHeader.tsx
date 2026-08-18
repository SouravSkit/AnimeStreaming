'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  accentColor?: string;
  viewAllHref?: string;
  className?: string;
};

function SectionHeader({ title, subtitle, accentColor = '#a855f7', viewAllHref, className = '' }: Props) {
  return (
    <div className={`mb-5 flex items-end justify-between ${className}`}>
      <div>
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-1 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${accentColor}, transparent)`,
              boxShadow: `0 0 8px ${accentColor}44`,
            }}
          />
          <h2
            className="text-xl font-bold tracking-wide"
            style={{
              textShadow: `0 0 20px ${accentColor}33`,
            }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="mt-1 ml-3.5 text-xs text-white/40">{subtitle}</p>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs font-medium text-white/50 transition-colors hover:text-white"
        >
          View All
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default SectionHeader;
