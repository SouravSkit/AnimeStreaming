'use client';

import React from 'react';

function ShimmerCard() {
  return (
    <div>
      <div className="shimmer aspect-[2/3] rounded-2xl" />
      <div className="mx-auto mt-3 h-3 w-3/4 rounded-full shimmer" />
      <div className="mx-auto mt-2 h-2 w-1/2 rounded-full shimmer" />
    </div>
  );
}

export function ShimmerGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerCard key={i} />
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
