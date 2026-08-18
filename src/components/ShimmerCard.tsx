'use client';

import React from 'react';

function ShimmerCard({ type = 'medium' }: { type?: 'large' | 'medium' | 'small' }) {
  const sizeClasses = {
    large: 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4',
    medium: 'w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5',
    small: 'w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6',
  };

  return (
    <div className={`${sizeClasses[type]} p-2`}>
      <div className="shimmer aspect-[2/3] rounded-2xl" />
      <div className="mx-auto mt-3 h-3 w-3/4 rounded-full shimmer" />
      <div className="mx-auto mt-2 h-2 w-1/2 rounded-full shimmer" />
    </div>
  );
}

export function ShimmerGrid({ count = 8, type = 'medium' }: { count?: number; type?: 'large' | 'medium' | 'small' }) {
  return (
    <div className="flex flex-wrap">
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerCard key={i} type={type} />
      ))}
    </div>
  );
}

export function ShimmerHero() {
  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-deep">
      <div className="absolute inset-0 shimmer" />
      <div className="absolute bottom-28 left-6 sm:left-12 md:left-16 lg:left-24">
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-20 rounded-full shimmer" />
          ))}
        </div>
        <div className="mb-3 h-14 w-96 max-w-full rounded shimmer" />
        <div className="mb-4 h-4 w-64 rounded shimmer" />
        <div className="mb-6 h-3 w-80 max-w-full rounded shimmer" />
        <div className="flex gap-4">
          <div className="h-12 w-36 rounded-2xl shimmer" />
          <div className="h-12 w-36 rounded-2xl shimmer" />
        </div>
      </div>
    </div>
  );
}

export default ShimmerCard;
