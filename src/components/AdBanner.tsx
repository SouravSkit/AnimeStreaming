'use client';

import { useEffect, useRef } from 'react';

type AdBannerProps = {
  /** Which ad slot to render */
  slot: 'banner-1' | 'banner-2' | 'banner-3';
  /** Optional explicit width override */
  width?: number;
  /** Optional explicit height override */
  height?: number;
  /** CSS class for the wrapper */
  className?: string;
};

/**
 * AdBanner — renders Adsterra ad scripts in a safe, isolated container.
 *
 * IMPORTANT:
 * - Always rendered inside a [data-ad-container] so AdGuard allows it.
 * - Never placed inside the video player DOM hierarchy.
 * - Scripts are loaded only once per slot to prevent duplicates.
 * - Scripts are appended inside the container ref (not document.body)
 *   so AdGuard can recognize them as part of the ad container.
 */

export default function AdBanner({ slot, width, height, className = '' }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const cleanup: (() => void)[] = [];

    if (slot === 'banner-1') {
      // Adsterra banner — profitableratecpmnetwork
      const invokeId = `ad-invoke-${slot}`;
      if (!container.querySelector(`#${CSS.escape(invokeId)}`)) {
        const script = document.createElement('script');
        script.id = invokeId;
        script.src =
          'https://pl30958888.profitableratecpmnetwork.com/3090e4446e031cebfd63070480886bf7/invoke.js';
        script.async = true;
        container.appendChild(script);
        cleanup.push(() => {
          script.remove();
        });
      }
    } else if (slot === 'banner-2') {
      // Adsterra secondary script
      const scriptId = `ad-secondary-${slot}`;
      if (!container.querySelector(`#${CSS.escape(scriptId)}`)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src =
          'https://pl30958889.profitableratecpmnetwork.com/1f/00/a9/1f00a9b59ac8d3fba6729cdc753a0ed4.js';
        script.async = true;
        container.appendChild(script);
        cleanup.push(() => {
          script.remove();
        });
      }
    } else if (slot === 'banner-3') {
      // HighRevenueFormat banner
      const invokeId = `ad-invoke-${slot}`;
      if (!container.querySelector(`#${CSS.escape(invokeId)}`)) {
        // Set atOptions config first
        const optId = `ad-options-${slot}`;
        if (!container.querySelector(`#${CSS.escape(optId)}`)) {
          const optScript = document.createElement('script');
          optScript.id = optId;
          optScript.textContent = `
            if (typeof window !== 'undefined') {
              window.atOptions = window.atOptions || {};
              window.atOptions['key'] = 'd6834deede2274762e409241db603406';
              window.atOptions['format'] = 'iframe';
              window.atOptions['height'] = ${height || 300};
              window.atOptions['width'] = ${width || 160};
              window.atOptions['params'] = {};
            }
          `;
          container.appendChild(optScript);
          cleanup.push(() => {
            optScript.remove();
          });
        }

        // Then load the invoke script
        const script = document.createElement('script');
        script.id = invokeId;
        script.src =
          'https://www.highrevenueformat.com/d6834deede2274762e409241db603406/invoke.js';
        script.async = true;
        container.appendChild(script);
        cleanup.push(() => {
          script.remove();
        });
      }
    }

    return () => {
      cleanup.forEach((fn) => fn());
    };
  }, [slot, width, height]);

  const slotConfig = {
    'banner-1': { id: 'container-3090e4446e031cebfd63070480886bf7', w: width || 728, h: height || 90 },
    'banner-2': { id: `container-secondary-${slot}`, w: width || 468, h: height || 60 },
    'banner-3': { id: 'container-hrf-d6834deede2274762e409241db603406', w: width || 160, h: height || 300 },
  };

  const config = slotConfig[slot];

  return (
    <div
      ref={containerRef}
      data-ad-container="true"
      data-ad-slot={slot}
      className={`ad-banner ${className}`}
      style={{
        width: '100%',
        maxWidth: config.w,
        minHeight: config.h,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <div id={config.id} style={{ width: config.w, height: config.h }} />
    </div>
  );
}
