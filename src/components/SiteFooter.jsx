import React from 'react';
import { useLocation } from 'react-router-dom';
import Contacts from './Contacts';
import ContactMethods from './ContactMethods';
import KineticMarquee from './ui/KineticMarquee';
import { servicePages } from '../content/serviceSeo';

export default function SiteFooter() {
  const { pathname } = useLocation();
  if (pathname === '/' || pathname.startsWith('/admin')) return null;
  const service = Boolean(servicePages[pathname]);
  const casePage = pathname.startsWith('/case/');
  const concept = ['/case/esthete-catering','/case/apex-detailing'].includes(pathname);
  const hasSidebar = service || (casePage && !concept) || ['/cases','/blog','/brief'].includes(pathname) || pathname.startsWith('/blog/');
  return <footer className={`site-footer-shell${hasSidebar ? ' site-footer-with-sidebar' : ''}`} aria-label="Контакты и информация о сайте">
    {((!service && !casePage) || concept) ? <Contacts/> : <ContactMethods/>}
    <KineticMarquee/>
  </footer>;
}
