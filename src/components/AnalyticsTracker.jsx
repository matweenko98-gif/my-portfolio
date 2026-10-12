import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { hasAnalyticsConsent, trackConversion } from '../utils/analytics';

export default function AnalyticsTracker() {
  const { pathname } = useLocation();
  const [consent, setConsent] = useState(hasAnalyticsConsent);
  const isPrivate = /^\/admin(?:-keis)?(?:\/|$)/.test(pathname);
  useEffect(() => {
    const update = () => setConsent(hasAnalyticsConsent());
    window.addEventListener('ks:analytics-consent', update);
    return () => window.removeEventListener('ks:analytics-consent', update);
  }, []);
  useEffect(() => {
    if (!consent || isPrivate) return;
    let timer;
    const hit = () => {
      if (!window.ksMetrikaReady || window.ksLastMetrikaPath === pathname) return;
      window.ksLastMetrikaPath = pathname;
      window.ym?.(109905970, 'hit', `${location.origin}${pathname}`, { title: document.title });
    };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(hit, 350); };
    const observer = new MutationObserver(schedule);
    const title = document.querySelector('title');
    if (title) observer.observe(title, { childList: true, subtree: true, characterData: true });
    window.addEventListener('ks:metrika-ready', schedule);
    schedule();
    return () => { clearTimeout(timer); observer.disconnect(); window.removeEventListener('ks:metrika-ready', schedule); };
  }, [pathname, consent, isPrivate]);
  useEffect(() => {
    const click = event => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const method = href.startsWith('tel:') ? 'phone' : href.startsWith('mailto:') ? 'email' :
        /^https:\/\/(?:t\.me|telegram\.me)\//.test(href) ? 'telegram' : null;
      if (method) trackConversion('contact_clicked', { contact_method: method });
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);
  return consent && !isPrivate ? <Analytics /> : null;
}
