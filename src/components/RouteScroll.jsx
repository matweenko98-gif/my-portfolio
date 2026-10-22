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
    let frame;
    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      observer?.disconnect();
      return true;
    };
    // Lazy homepage sections can mount after the route itself.
    if (scrollToTarget()) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scrollToTarget);
    });
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    const deadline = setTimeout(() => observer.disconnect(), 5000);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(deadline);
    };
  }, [pathname, search, hash, key]);

  return null;
}
