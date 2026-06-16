import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

// ─── Lazy-loaded route chunks ─────────────────────────────────────────────────
// Каждый маршрут вынесен в отдельный чанк через dynamic import.
// Они НЕ входят в главный bundle и подгружаются только при переходе на маршрут.
const HomePage        = lazy(() => import('./components/HomePage'));
const CaseTemplate    = lazy(() => import('./components/CaseTemplate'));
const AdminWorkspace  = lazy(() => import('./components/AdminWorkspace'));
const LegalPage       = lazy(() => import('./components/LegalPage'));

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

export default function App() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/case/:id"          element={<CaseTemplate />} />
          <Route path="/admin-keis"        element={<AdminWorkspace />} />
          <Route path="/privacy-policy"    element={<LegalPage type="privacy" />} />
          <Route path="/terms"             element={<LegalPage type="terms" />} />
        </Routes>
      </Suspense>
      <Analytics />
    </>
  );
}
