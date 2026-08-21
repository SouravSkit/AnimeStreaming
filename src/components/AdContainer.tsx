'use client';

import React from 'react';

interface AdContainerProps {
  /** Unique identifier for this ad placement */
  id: string;
  /** Position label for styling/debugging */
  position?: 'below-video' | 'above-video' | 'sidebar' | 'footer';
  /** Optional className for additional styling */
  className?: string;
}

/**
 * AdContainer - Designated ad placement zone.
 *
 * This is the ONLY component where ads are allowed to render.
 * The AdGuard component monitors the DOM and will remove any ad-related
 * elements that appear outside of containers marked with data-ad-container.
 *
 * The video player area is completely protected and must never contain
 * or be covered by ad elements.
 */
export default function AdContainer({
  id,
  position = 'below-video',
  className = '',
}: AdContainerProps) {
  return (
    <div
      data-ad-container={id}
      data-ad-position={position}
      className={`ad-container ad-container--${position} ${className}`}
      style={{
        width: '100%',
        minHeight: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Inner wrapper that the ad script can target */}
      <div
        data-ad-slot={id}
        style={{
          width: '100%',
          maxWidth: '728px',
          minHeight: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </div>
  );
}
