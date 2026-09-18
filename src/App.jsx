import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import CookieBanner from './components/CookieBanner';

// ─── Lazy-loaded route chunks ─────────────────────────────────────────────────
// Каждый маршрут вынесен в отдельный чанк через dynamic import.
// Они НЕ входят в главный bundle и подгружаются только при переходе на маршрут.
const HomePage        = lazy(() => import('./components/HomePage'));
const AllCases        = lazy(() => import('./components/AllCases'));
const CaseTemplate    = lazy(() => import('./components/CaseTemplate'));
const AdminWorkspace  = lazy(() => import('./components/AdminWorkspace'));
const LegalPage       = lazy(() => import('./components/LegalPage'));
const BriefPage       = lazy(() => import('./components/BriefPage'));
const NotFoundPage    = lazy(() => import('./components/NotFoundPage'));

// ─── Fallback-заглушка при загрузке чанка ────────────────────────────────────
function PageSkeleton() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}
      aria-label="Загрузка страницы"
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '2px solid #f0f0f0',
          borderTop: '2px solid #FF5B23',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import contentData from './contentData';
import { supabase } from './lib/supabaseClient';

export default function App() {
  React.useEffect(() => {
    // Sync contact settings from local cache
    const cached = localStorage.getItem('site_contacts_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.phone) contentData.contacts.phone = parsed.phone;
        if (parsed.email) contentData.contacts.email = parsed.email;
        if (parsed.telegramUrl) {
          if (contentData.contacts.messengers?.telegram) contentData.contacts.messengers.telegram.url = parsed.telegramUrl;
          if (contentData.sidebar?.socialLinks) contentData.sidebar.socialLinks.telegram = parsed.telegramUrl;
        }
        if (parsed.maxUrl) {
          if (contentData.contacts.messengers?.max) contentData.contacts.messengers.max.url = parsed.maxUrl;
          if (contentData.sidebar?.socialLinks) contentData.sidebar.socialLinks.max = parsed.maxUrl;
        }
      } catch (e) {}
    }

    // Fetch remote settings from Supabase
    const fetchRemoteSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'contacts').single();
        if (data && data.data) {
          const settings = data.data;
          if (settings.phone) contentData.contacts.phone = settings.phone;
          if (settings.email) contentData.contacts.email = settings.email;
          if (settings.telegramUrl) {
            if (contentData.contacts.messengers?.telegram) contentData.contacts.messengers.telegram.url = settings.telegramUrl;
            if (contentData.sidebar?.socialLinks) contentData.sidebar.socialLinks.telegram = settings.telegramUrl;
          }
          if (settings.maxUrl) {
            if (contentData.contacts.messengers?.max) contentData.contacts.messengers.max.url = settings.maxUrl;
            if (contentData.sidebar?.socialLinks) contentData.sidebar.socialLinks.max = settings.maxUrl;
          }
          localStorage.setItem('site_contacts_settings', JSON.stringify(settings));
        }
      } catch (e) {}
    };
    fetchRemoteSettings();
  }, []);
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/cases"             element={<AllCases />} />
          <Route path="/case/:id"          element={<CaseTemplate />} />
          <Route path="/brief"              element={<BriefPage />} />
          <Route path="/admin"             element={<AdminWorkspace />} />
          <Route path="/admin-keis"        element={<AdminWorkspace />} />
          <Route path="/privacy-policy"    element={<LegalPage type="privacy" />} />
          <Route path="/terms"             element={<LegalPage type="terms" />} />
          <Route path="*"                  element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Analytics />
      <CookieBanner />
    </>
  );
}
