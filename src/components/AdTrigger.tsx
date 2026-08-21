'use client';

import { useEffect } from 'react';

const AD_SCRIPT_URL =
  'https://pl30949711.effectivecpmnetwork.com/d7/84/b2/d784b2ee8074e08748cc8abe7c921eb6.js';

/**
 * AdTrigger - Simply loads the Terra Ads popunder script.
 *
 * The script handles ALL popunder logic internally:
 * - Binds its own click handlers to the document
 * - Fires popunders on user clicks automatically
 * - Manages frequency capping via cookies/localStorage
 * - Handles domain verification
 *
 * NOTE: Popunder ad networks block localhost. The script will only
 * fire on the actual deployed domain. This is expected behavior.
 */
export default function AdTrigger() {
  useEffect(() => {
    // Prevent double-loading
    if (document.querySelector(`script[src="${AD_SCRIPT_URL}"]`)) return;

    const timer = setTimeout(() => {
      try {
        const script = document.createElement('script');
        script.src = AD_SCRIPT_URL;
        script.async = true;
        document.head.appendChild(script);
      } catch {
        // Script load failed — silent
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

/**
 * Helper: trigger ad from any component (no-op — the script handles this itself).
 * Kept for backward compatibility but the Terra Ads script manages its own triggers.
 */
export function triggerAd() {
  // The popunder script binds its own click handlers.
  // No manual triggering needed.
}
