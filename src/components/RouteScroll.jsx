import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Mount inside the route Suspense boundary so scrolling happens after the
// destination page has loaded, rather than against the outgoing page.
export default function RouteScroll() {
  const { pathname, search, hash, key } = useLocation();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { id = hash.slice(1); }
    let observer;
    let resizeObserver;
    let frame;
    let deadline;
    let stopped = false;
    const scrollToTarget = () => {
      if (stopped) return;
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return true;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scrollToTarget);
    };
    const stop = () => {
      stopped = true;
      observer?.disconnect();
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(deadline);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('keydown', stop);
    };
    // Async portfolio cards and images can change layout above an existing
    // target. Keep the anchor aligned during initial loading, until the user
    // takes control of scrolling (or the bounded settling period ends).
    if (!scrollToTarget()) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const root = document.getElementById('root');
    if (root) {
      observer = new MutationObserver(schedule);
      observer.observe(root, { childList: true, subtree: true });
      resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(root);
    }
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('pointerdown', stop, { passive: true });
    window.addEventListener('keydown', stop);
    deadline = setTimeout(stop, 5000);
    return stop;
  }, [pathname, search, hash, key]);

  return null;
}
