import { useEffect } from 'react';

/**
 * useScrollLock
 * ─────────────────────────────────────────────────────────────
 * Locks the background page scroll while a modal is open.
 * Works on iOS Safari, Chrome (mobile + desktop), and Firefox.
 *
 * iOS Safari IGNORES `overflow:hidden` on body — the reliable
 * technique is to set `position:fixed` + `top:-scrollY` while
 * preserving the current scroll position, then restore on cleanup.
 */
export function useScrollLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const scrollY = window.scrollY;
    const body    = document.body;
    const html    = document.documentElement;

    // Save existing inline styles
    const prevBodyPos    = body.style.position;
    const prevBodyTop    = body.style.top;
    const prevBodyLeft   = body.style.left;
    const prevBodyRight  = body.style.right;
    const prevBodyOvf    = body.style.overflow;
    const prevHtmlOvf    = html.style.overflow;

    // Apply the iOS-safe scroll lock
    body.style.position = 'fixed';
    body.style.top      = `-${scrollY}px`;
    body.style.left     = '0';
    body.style.right    = '0';
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    // Add CSS class for any stylesheet-level rules
    body.classList.add('modal-open');

    return () => {
      // Restore
      body.style.position = prevBodyPos;
      body.style.top      = prevBodyTop;
      body.style.left     = prevBodyLeft;
      body.style.right    = prevBodyRight;
      body.style.overflow = prevBodyOvf;
      html.style.overflow = prevHtmlOvf;
      body.classList.remove('modal-open');

      // Jump back to where the user was before the modal opened
      window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
    };
  }, [enabled]);
}
