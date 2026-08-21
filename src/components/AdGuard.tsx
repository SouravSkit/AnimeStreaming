'use client';

import { useEffect } from 'react';

/**
 * AdGuard - Monitors DOM mutations and prevents ads from appearing
 * in protected areas (video player, content overlays, etc.).
 *
 * How it works:
 * 1. Watches for new DOM elements being added anywhere in the page
 * 2. Checks if the new element is inside a designated [data-ad-container]
 * 3. If NOT inside an ad container, checks if it's in a protected zone
 * 4. Removes or neutralizes any ad element found in protected zones
 * 5. Also strips fixed/absolute positioned overlays that could cover the video
 */
export default function AdGuard() {
  useEffect(() => {
    // Selectors for elements that should be protected from ads
    // NOTE: Video player selectors removed — ads no longer run on video pages.
    // This prevents AdGuard from hiding legitimate iframes/videos.
    const PROTECTED_SELECTORS: string[] = [];

    // Selectors for ad elements that are explicitly allowed (our own ad containers)
    const ALLOWED_AD_SELECTORS = [
      '[data-ad-container]',
      '[data-ad-slot]',
      '.ad-banner',
      '#container-3090e4446e031cebfd63070480886bf7',
      '[id*="container-3090e4446e031cebfd63070480886bf7"]',
      '#container-hrf-d6834deede2274762e409241db603406',
      '[id*="container-hrf-"]',
      '[id*="container-secondary-"]',
      '[id^="ad-invoke-"]',
      '[id^="ad-secondary-"]',
      '[id^="ad-options-"]',
    ];

    // Selectors for elements that are likely ad injections
    const AD_LIKE_SELECTORS = [
      '[id*="ad-"]',
      '[id*="adsbygoogle"]',
      '[class*="ad-"]',
      '[class*="adsbygoogle"]',
      '[data-ad]',
      '[id*="google_ads"]',
      '[class*="google_ads"]',
      '[id*="effectivecpm"]',
      '[class*="effectivecpm"]',
      '[id*="pl30949711"]',
    ];

    /**
     * Check if an element is inside a designated ad container
     */
    const isInsideAdContainer = (el: Element): boolean => {
      return !!el.closest('[data-ad-container]');
    };

    /**
     * Check if an element matches one of our explicitly allowed ad selectors
     */
    const isAllowedAdElement = (el: Element): boolean => {
      for (const selector of ALLOWED_AD_SELECTORS) {
        if (el.matches?.(selector) || el.closest?.(selector)) {
          return true;
        }
      }
      return false;
    };

    /**
     * Check if an element is inside a protected video area
     */
    const isInsideProtectedZone = (el: Element): boolean => {
      for (const selector of PROTECTED_SELECTORS) {
        if (el.closest(selector)) {
          return true;
        }
      }
      return false;
    };

    /**
     * Check if an element looks like an ad injection
     */
    const isAdLikeElement = (el: Element): boolean => {
      // <script>, <link>, and <noscript> elements are never ads by themselves
      const tagName = el.tagName?.toLowerCase();
      if (tagName === 'script' || tagName === 'link' || tagName === 'noscript' || tagName === 'style') {
        return false;
      }

      // <iframe> elements inside ad containers are allowed (they are the ads themselves)
      if (tagName === 'iframe' && isInsideAdContainer(el)) {
        return false;
      }

      // Check by selectors
      for (const selector of AD_LIKE_SELECTORS) {
        if (el.matches?.(selector) || el.closest?.(selector)) {
          return true;
        }
      }

      // Check for fixed/absolute positioned overlays that could cover content
      const style = window.getComputedStyle(el);
      const position = style.position;
      const zIndex = parseInt(style.zIndex, 10) || 0;

      if ((position === 'fixed' || position === 'absolute') && zIndex > 100) {
        const rect = el.getBoundingClientRect();
        // If it covers a significant portion of the viewport, it's likely an overlay ad
        if (rect.width > 200 && rect.height > 100) {
          return true;
        }
      }

      return false;
    };

    /**
     * Safely remove a DOM node, guarding against React race conditions
     * where the node may already have been unmounted.
     */
    const safeRemove = (el: Element) => {
      try {
        if (el.parentNode && el.parentNode.contains(el)) {
          el.parentNode.removeChild(el);
        }
      } catch {
        // Node already removed by React or another observer — ignore
      }
    };

    /**
     * Handle newly added nodes
     */
    const handleNewNodes = (nodes: Node[]) => {
      for (const node of nodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const el = node as Element;

        // If it's inside a designated ad container, allow it
        if (isInsideAdContainer(el)) {
          return;
        }

        // If it matches an allowed ad selector, allow it
        if (isAllowedAdElement(el)) {
          return;
        }

        // If it's in a protected zone, hide it (don't remove — React owns the tree)
        if (isInsideProtectedZone(el)) {
          console.warn('[AdGuard] Hiding ad element from protected zone:', el);
          (el as HTMLElement).style.cssText =
            'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; left: -9999px !important; width: 0 !important; height: 0 !important; overflow: hidden !important;';
          continue;
        }

        // If it looks like an ad outside a container, neutralize it
        if (isAdLikeElement(el)) {
          console.warn('[AdGuard] Neutralizing ad element outside container:', el);
          (el as HTMLElement).style.cssText =
            'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; left: -9999px !important; width: 0 !important; height: 0 !important; overflow: hidden !important;';
        }
      }
    };

    /**
     * Handle attribute changes that could turn a safe element into an ad
     */
    const handleAttributeChange = (attr: MutationRecord) => {
      try {
        const el = attr.target as Element;
        if (!el || !el.parentNode) return;

        if (isInsideAdContainer(el)) return;

        if (isInsideProtectedZone(el)) {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || parseInt(style.zIndex, 10) > 100) {
            (el as HTMLElement).style.removeProperty('position');
            (el as HTMLElement).style.removeProperty('z-index');
          }
        }
      } catch {
        // Element may have been removed — ignore
      }
    };

    // Set up MutationObserver
    const observer = new MutationObserver((mutations) => {
      try {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            handleNewNodes(Array.from(mutation.addedNodes));
          } else if (mutation.type === 'attributes') {
            handleAttributeChange(mutation);
          }
        }
      } catch {
        // Silently ignore — prevents observer errors from breaking React
      }
    });

    // Start observing the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'id'],
    });

    // Also run an initial scan for any existing ad elements
    try {
      const existingAds = document.querySelectorAll(
        AD_LIKE_SELECTORS.join(', ')
      );
      existingAds.forEach((el) => {
        try {
          if (!isInsideAdContainer(el) && isAdLikeElement(el)) {
            (el as HTMLElement).style.cssText =
              'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
          }
        } catch {
          // Element may have been removed — ignore
        }
      });
    } catch {
      // Initial scan failed — ignore
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component only runs side effects
}
