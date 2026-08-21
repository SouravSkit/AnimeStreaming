'use client';

import { useEffect, useState } from 'react';

const AD_SCRIPT_URL =
  'https://pl30949711.effectivecpmnetwork.com/d7/84/b2/d784b2ee8074e08748cc8abe7c921eb6.js';

/**
 * AdScript - Safely loads the Terra Ads popunder script.
 *
 * Safety measures:
 * 1. Only loads the script once (singleton pattern)
 * 2. Loads after the page is fully interactive
 * 3. Wraps script loading in error handling
 * 4. The AdGuard component separately monitors DOM mutations
 *    to prevent the script from injecting ads in protected areas
 */
export default function AdScript() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Prevent double-loading
    if (loaded) return;

    // Check if script is already present in the DOM
    const existing = document.querySelector(
      `script[src="${AD_SCRIPT_URL}"]`
    );
    if (existing) {
      setLoaded(true);
      return;
    }

    // Load the script after a short delay to not block initial render
    const timer = setTimeout(() => {
      try {
        const script = document.createElement('script');
        script.src = AD_SCRIPT_URL;
        script.async = true;
        script.onload = () => setLoaded(true);
        script.onerror = () => {
          console.warn('[AdScript] Failed to load ad script');
        };
        document.head.appendChild(script);
      } catch (err) {
        console.warn('[AdScript] Error loading ad script:', err);
      }
    }, 1000); // 1 second delay to prioritize page load

    return () => clearTimeout(timer);
  }, [loaded]);

  return null; // This component only handles script loading
}
