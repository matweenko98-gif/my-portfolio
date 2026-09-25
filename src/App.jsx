import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
const BlogPage        = lazy(() => import('./components/BlogPage'));
const ArticlePage     = lazy(() => import('./components/ArticlePage'));
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

import ScrollToTopButton from './components/ScrollToTopButton';

const SITE_ORIGIN = 'https://www.ksenweb.com';
const PRIMARY_CONTACT_EMAIL = 'matweenko98@gmail.com';
const LEGACY_CONTACT_EMAIL = 'verameeva77@mail.ru';

function normalizeContactEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return !normalized || normalized === LEGACY_CONTACT_EMAIL
    ? PRIMARY_CONTACT_EMAIL
    : email;
}

const STATIC_ROUTE_SEO = {
  '/': {
    title: 'Ксения Матвеенко — Разработка сайтов и веб-приложений',
    description: 'Создание сайтов на Tilda под ключ и веб-приложений/интерфейсов под задачи бизнеса.',
  },
  '/cases': {
    title: 'Все кейсы — Ксения Матвеенко',
    description: 'Архив и полный список выполненных проектов: от адаптивных сайтов на Tilda до кастомных интерактивных веб-приложений.',
    schemaType: 'CollectionPage',
  },
  '/blog': {
    title: 'Блог о веб-дизайне, разработке сайтов и ИИ | KSENWEB',
    description: 'Полезные статьи для владельцев бизнеса о дизайне, разработке сайтов и системных продажах в интернете.',
    schemaType: 'CollectionPage',
  },
  '/brief': {
    title: 'Интерактивный бриф | Матвеенко Ксения',
    description: 'Пошаговый бриф на разработку сайта, UX/UI-дизайна или веб-приложения.',
  },
  '/privacy-policy': {
    title: 'Политика конфиденциальности | Матвеенко Ксения Александровна',
    description: 'Политика обработки и защиты персональных данных на сайте KSENWEB.',
  },
  '/terms': {
    title: 'Пользовательское соглашение | Правила использования сайта',
    description: 'Пользовательское соглашение и правила использования сайта KSENWEB.',
  },
};

function setMeta(selector, attribute, value) {
  let node = document.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
    if (match) node.setAttribute(match[1], match[2]);
    document.head.appendChild(node);
  }
  node.setAttribute(attribute, value);
}

let cachedStaticHomeGraph = null;

function consumeStaticHomeGraph() {
  const staticScript = document.getElementById('jsonld-static-site');
  if (!staticScript) return cachedStaticHomeGraph;

  try {
    const parsed = JSON.parse(staticScript.textContent || '{}');
    if (Array.isArray(parsed['@graph'])) cachedStaticHomeGraph = parsed['@graph'];
  } catch (error) {
    console.warn('Unable to parse the static homepage schema.', error);
  }

  staticScript.remove();
  return cachedStaticHomeGraph;
}

function setRouteSchema(pathname, canonicalUrl, seo, isArticle, isCase) {
  const staticHomeGraph = consumeStaticHomeGraph();
  let script = document.getElementById('jsonld-route');
  if (!script) {
    script = document.createElement('script');
    script.id = 'jsonld-route';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const graph = [];
  if (pathname === '/') {
    if (staticHomeGraph?.length) {
      graph.push(...staticHomeGraph);
    } else {
      graph.push(
        {
          '@type': 'WebSite',
          '@id': `${SITE_ORIGIN}/#website`,
          url: `${SITE_ORIGIN}/`,
          name: 'KSENWEB — Ксения Матвеенко',
          inLanguage: 'ru',
          publisher: { '@id': `${SITE_ORIGIN}/#person` },
        },
        {
          '@type': 'WebPage',
          '@id': `${SITE_ORIGIN}/#webpage`,
          url: `${SITE_ORIGIN}/`,
          name: seo?.title,
          description: seo?.description,
          inLanguage: 'ru',
          isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
          about: { '@id': `${SITE_ORIGIN}/#person` },
        },
      );
    }
  } else {
    const pageName = seo?.title || (isArticle ? 'Статья блога' : isCase ? 'Кейс' : document.title);
    graph.push({
      '@type': seo?.schemaType || 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: pageName,
      ...(seo?.description ? { description: seo.description } : {}),
      inLanguage: 'ru',
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    });

    const parent = isArticle
      ? { name: 'Блог', url: `${SITE_ORIGIN}/blog` }
      : isCase
        ? { name: 'Кейсы', url: `${SITE_ORIGIN}/cases` }
        : null;
    const breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_ORIGIN}/` },
      ...(parent ? [{ '@type': 'ListItem', position: 2, name: parent.name, item: parent.url }] : []),
      {
        '@type': 'ListItem',
        position: parent ? 3 : 2,
        name: pageName,
        item: canonicalUrl,
      },
    ];
    graph.push({ '@type': 'BreadcrumbList', itemListElement: breadcrumbItems });
  }

  script.text = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function RouteSeo() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const normalizedPath = pathname !== '/' ? pathname.replace(/\/$/, '') : '/';
    const isArticle = normalizedPath.startsWith('/blog/');
    const isCase = normalizedPath.startsWith('/case/');
    const isAdmin = normalizedPath === '/admin' || normalizedPath === '/admin-keis';
    const isKnown = Boolean(STATIC_ROUTE_SEO[normalizedPath]) || isArticle || isCase || isAdmin;
    const seo = STATIC_ROUTE_SEO[normalizedPath];
    const canonicalUrl = `${SITE_ORIGIN}${normalizedPath === '/' ? '/' : normalizedPath}`;

    if (seo) {
      document.title = seo.title;
      setMeta('meta[name="description"]', 'content', seo.description);
      setMeta('meta[property="og:title"]', 'content', seo.title);
      setMeta('meta[property="og:description"]', 'content', seo.description);
      setMeta('meta[name="twitter:title"]', 'content', seo.title);
      setMeta('meta[name="twitter:description"]', 'content', seo.description);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const robots = isAdmin || !isKnown
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMeta('meta[name="robots"]', 'content', robots);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    if (isKnown && !isAdmin) {
      setRouteSchema(normalizedPath, canonicalUrl, seo, isArticle, isCase);
    } else {
      document.getElementById('jsonld-route')?.remove();
    }

    if (!isArticle) document.getElementById('jsonld-blog-posting')?.remove();
    if (!isCase) document.getElementById('jsonld-case')?.remove();
  }, [pathname]);

  return null;
}

export default function App() {
  React.useEffect(() => {
    // Sync contact settings from local cache
    const cached = localStorage.getItem('site_contacts_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.phone) contentData.contacts.phone = parsed.phone;
        contentData.contacts.email = normalizeContactEmail(parsed.email);
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
        // The database SDK is not needed to render the first screen.
        const { supabase } = await import('./lib/supabaseClient');
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'contacts').single();
        if (data && data.data) {
          const settings = data.data;
          if (settings.phone) contentData.contacts.phone = settings.phone;
          settings.email = normalizeContactEmail(settings.email);
          contentData.contacts.email = settings.email;
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
      <RouteSeo />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/cases"             element={<AllCases />} />
          <Route path="/case/:id"          element={<CaseTemplate />} />
          <Route path="/brief"              element={<BriefPage />} />
          <Route path="/blog"               element={<BlogPage />} />
          <Route path="/blog/:slug"         element={<ArticlePage />} />
          <Route path="/admin"             element={<AdminWorkspace />} />
          <Route path="/admin-keis"        element={<AdminWorkspace />} />
          <Route path="/privacy-policy"    element={<LegalPage type="privacy" />} />
          <Route path="/terms"             element={<LegalPage type="terms" />} />
          <Route path="*"                  element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Analytics />
      <CookieBanner />
      <ScrollToTopButton />
    </>
  );
}
