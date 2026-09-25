const markdownContent = `# Ksenia Matveenko — UI/UX Designer, Frontend Developer & AI Prompt Engineer / Веб-дизайнер и разработчик интерфейсов

Welcome to the LLM-friendly version of my portfolio. / Добро пожаловать в текстовую версию моего портфолио.

## Core Identity & Professional Overview / Общая информация
- **Full Name**: Матвеенко Ксения Александровна (Ksenia Alexandrovna Matveenko)
- **Location & Target Regions**: Based in Belarus (Минск). Serves clients across all of Belarus (РБ), Russia (РФ), CIS, and worldwide remotely.
- **Design Philosophy**: Minimalist, Apple-like aesthetic. Focuses on "optimization over decoration" and clean, functional, high-performing interfaces.

---

## Technical Stack & Competencies / Технологический стек
- **Design & UI/UX**: Figma, Bento-style grids, responsive interface architecture, premium layout prototyping.
- **Frontend & Web Development**: React, Next.js, Vite, Tailwind CSS, Semantic HTML, CSS-in-JS.
- **Backend & Cloud Integration**: Supabase, PostgreSQL database architecture, secure authentication, API integrations.
- **No-Code Platforms**: Tilda (expert level custom design, Zero Block modification).
- **AI & Vibe-Coding**: Advanced AI Prompt Engineering, integration of neural networks into web applications, development with AI agents (Cursor, Lovable, Google Stitch, Claude).

---

## Services & Solutions / Услуги и решения

1. **Сайт на Tilda (Маркетинговые инструменты) / Turnkey Tilda Websites**
   - Лендинги, многостраничные сайты компаний, каталоги услуг. Быстрый запуск для старта рекламы и удобное самостоятельное редактирование.
   - **Сроки / Timeline**: от 7 рабочих дней / from 7 business days.

2. **Проектирование и дизайн интерфейсов в Figma / UI/UX Design in Figma**
   - Архитектура проекта, интерактивные прототипы пользовательского поведения (UX) и уникальный кастомный дизайн (UI).
   - **Сроки / Timeline**: от 10 рабочих дней / from 10 business days.

3. **Интерактивные веб-приложения (AI-разработка) / Custom Web Apps**
   - Создание гибких, быстрых интерфейсов на чистом коде (React, Supabase, Tailwind).
   - **Сроки / Timeline**: Индивидуально / Custom.

4. **Редизайн и оптимизация / Redesign & Optimization**
   - Полное визуальное обновление, устранение критических ошибок юзабилити и улучшение конверсии текущего веб-ресурса.

---

## Work Process / Процесс работы
1. **Бриф и обсуждение (Brief & Discussion)**
2. **Анализ рынка (Market Analysis)**
3. **Проектирование и дизайн (UX/UI Prototyping & Design)**
4. **Сборка и код (Development & Coding)**
5. **Тестирование и сдача (Testing & Handover)**
6. **Поддержка (Ongoing Support)**

---

## Contacts / Контакты
- **Official Portfolio Website**: https://www.ksenweb.com
- **Telegram**: https://t.me/ksen_web
- **Phone**: +375259140959
- **Email**: matweenko98@gmail.com
`;

const apiCatalogJson = `{
  "linkset": [
    {
      "anchor": "https://www.ksenweb.com/api",
      "service-desc": [
        {
          "href": "https://www.ksenweb.com/api/openapi.yaml",
          "type": "application/yaml"
        }
      ],
      "service-doc": [
        {
          "href": "https://www.ksenweb.com/docs/api",
          "type": "text/html"
        }
      ],
      "status": [
        {
          "href": "https://www.ksenweb.com/api/status",
          "type": "application/json"
        }
      ]
    }
  ]
}`;

const openidConfigurationJson = `{
  "issuer": "https://www.ksenweb.com",
  "authorization_endpoint": "https://www.ksenweb.com/oauth/authorize",
  "token_endpoint": "https://www.ksenweb.com/oauth/token",
  "jwks_uri": "https://www.ksenweb.com/oauth/jwks",
  "grant_types_supported": [
    "authorization_code",
    "client_credentials"
  ],
  "response_types_supported": [
    "code"
  ],
  "subject_types_supported": [
    "public"
  ],
  "agent_auth": {
    "skill": "https://www.ksenweb.com/auth.md",
    "register_uri": "https://www.ksenweb.com/oauth/register",
    "claim_uri": "https://www.ksenweb.com/oauth/claim",
    "identity_types_supported": [
      "anonymous"
    ],
    "anonymous": {
      "credential_types_supported": [
        "api_key"
      ]
    }
  }
}`;

const oauthProtectedResourceJson = `{
  "resource": "https://www.ksenweb.com/api",
  "authorization_servers": [
    "https://www.ksenweb.com"
  ],
  "scopes_supported": [
    "read",
    "write"
  ],
  "bearer_methods_supported": [
    "header"
  ]
}`;

const authMdContent = `# Portfolio auth.md

This document explains how autonomous AI agents can register and authenticate with the portfolio's API.

## Discovery
The API and OAuth discovery documents are available at:
- **API Catalog**: \`/.well-known/api-catalog\`
- **Protected Resource Metadata**: \`/.well-known/oauth-protected-resource\`
- **Authorization Server Metadata**: \`/.well-known/oauth-authorization-server\` (and \`/openid-configuration\`)

## Agent Registration

We support **Anonymous** agent registration. AI agents can request an API key dynamically without requiring pre-existing user accounts.

### 1. Anonymous Registration Flow
To register an agent, make a \`POST\` request to the registration URI:
- **Endpoint**: \`https://www.ksenweb.com/oauth/register\`
- **Method**: \`POST\`
- **Content-Type**: \`application/json\`

**Request Payload:**
\`\`\`json
{
  "identity_type": "anonymous",
  "agent_name": "MyAutonomousAgent/1.0"
}
\`\`\`

**Response Payload:**
\`\`\`json
{
  "api_key": "sec_agent_xxxxxx",
  "expires_in": 31536000
}
\`\`\`

## Credential Usage
Include the obtained API key as a Bearer token in the \`Authorization\` header for all requests to protected API resources:
\`\`\`http
Authorization: Bearer sec_agent_xxxxxx
\`\`\`
`;

const mcpServerCardJson = `{
  "serverInfo": {
    "name": "ksenweb-portfolio-mcp",
    "version": "1.0.0"
  },
  "endpoint": "https://www.ksenweb.com/mcp",
  "capabilities": {
    "tools": {},
    "resources": {},
    "prompts": {}
  }
}`;

const agentSkillsJson = `{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "portfolio-query",
      "type": "skill-md",
      "description": "Querying portfolio information and contacts",
      "url": "https://www.ksenweb.com/skills/portfolio-query/SKILL.md",
      "digest": "sha256:5b717b9a0bd9ce5a74bc231150b3bc22532c3220e15a23c75099658005eeb1e0"
    }
  ]
}`;

const skillMdContent = `# portfolio-query Skill

Query the professional portfolio information of Ksenia Matveenko.

## Requirements
- Query homepage or read llms.txt to fetch contact info, tax UNP status, and service tiers.
`;

// Static Fallback Data for SSR
// Kept only as a migration record; live blog pages never read local article data.
const legacyFallbackArticles = [
  {
    id: "why-website-looks-cheap",
    slug: "why-website-looks-cheap",
    title: "9 ошибок, из-за которых сайт выглядит дешево — и как это исправить",
    excerpt: "Сайт может быть технически исправным, но при этом восприниматься слабее самого бизнеса. Разбираем 9 главных ошибок в иерархии, верстке, цветах и мобильной версии, из-за которых сайт теряет доверие.",
    content: `
<p>Сайт может быть технически исправным: страницы открываются, кнопки работают, информация о компании есть. Но при этом он всё равно воспринимается слабее самого бизнеса.</p>
<p>Обычно дело не в одном неудачном цвете или «не том» шрифте. Впечатление складывается из мелочей: перегруженного первого экрана, случайных фотографий, одинаковых блоков, слабой типографики, большого количества текста и мобильной версии, которую просто уменьшили с десктопа.</p>
<p>Именно эти вещи я проверяю в первую очередь, когда смотрю сайт перед редизайном.</p>

<h2>1. Первый экран пытается рассказать весь бизнес</h2>
<p>Первый экран часто превращают в мини-презентацию компании.</p>
<p>Название. Большой заголовок. Подзаголовок. Ещё один абзац. Три преимущества. Телефон. Мессенджеры. Две кнопки. Иногда сверху добавляется акция или бегущая строка.</p>
<p>В итоге человек ещё не начал знакомиться с сайтом, а уже должен решить, на что смотреть. Первому экрану не нужно отвечать на все возможные вопросы. Его задача проще: за несколько секунд дать понять:</p>
<ul>
  <li>Куда человек попал;</li>
  <li>Что здесь предлагают;</li>
  <li>Почему ему стоит продолжить;</li>
  <li>Какое действие можно сделать дальше.</li>
</ul>
<p>Если ради этого приходится читать пять абзацев, проблема уже не в количестве текста. Проблема в отсутствии приоритета.</p>

<div class="article-callout" style="background:#f4f4f5; border:1px solid #e4e4e7; border-radius:4px; padding:16px; margin:24px 0;">
  <div style="font-size:11px; font-family:monospace; font-weight:600; color:#FF5B23; text-transform:uppercase; margin-bottom:8px;">Что изменить</div>
  <p style="margin-bottom:8px;">Попробуйте оставить на первом экране <strong>одну основную мысль</strong>.</p>
  <p style="margin:0;">Не пять преимуществ, а главное обещание. Не три равнозначные кнопки, а одно основное действие. Остальные аргументы можно раскрыть ниже.</p>
</div>

<h2>2. Весь сайт собран из одинаковых карточек</h2>
<p>Через несколько экранов страница начинает выглядеть как набор прямоугольников с разным текстом внутри. Если визуально услуга, отзыв, преимущество и цифра оформлены одинаково, пользователь перестаёт чувствовать иерархию страницы.</p>

<div class="article-callout" style="background:#f4f4f5; border:1px solid #e4e4e7; border-radius:4px; padding:16px; margin:24px 0;">
  <div style="font-size:11px; font-family:monospace; font-weight:600; color:#FF5B23; text-transform:uppercase; margin-bottom:8px;">Что изменить</div>
  <p style="margin:0;">Меняйте способ подачи в зависимости от задачи блока: где-то крупная типографика, где-то полноэкранное фото, где-то простой список.</p>
</div>

<h2>3. Типографика не говорит, куда смотреть</h2>
<p>Сильная типографика делает работу за пользователя. Ещё до чтения текста должно быть понятно, где заголовок, где пояснение, а где ключевое действие.</p>

<h2>4. Фотографии могут принадлежать любому бизнесу</h2>
<p>Если фотографии из фотостоков можно одинаково поставить на сайт банка, IT-компании и онлайн-школы, они не передают уникальность вашего бизнеса.</p>

<h2>5. Слишком много цветов конкурируют за внимание</h2>
<p>Если на странице пять акцентных цветов, акцентного цвета фактически нет. Разделите цвета строго по ролям: фон, основной текст, второстепенный текст и один акцентный цвет.</p>

<h2>6. Человеку приходится читать слишком много до первого действия</h2>
<p>Расположите информацию в порядке пользовательских вопросов: Что вы предлагаете? Для кого? Что я получу? Почему можно доверять?</p>

<h2>7. Все элементы одинаково важны</h2>
<p>Хорошая страница строится на контрасте и визуальном ритме. После сильного первого экрана дайте спокойный текстовый блок.</p>

<h2>8. Мобильная версия — это уменьшенный desktop</h2>
<p>Responsive — это не просто width: 100%. На мобильном нужно пересобрать композицию, сократить тексты и приблизить CTA.</p>

<h2>9. Визуальный уровень сайта не соответствует цене продукта</h2>
<p>Дизайн формирует ожидания еще до разговора с менеджером. Визуальное ощущение стоимости создают качество материалов, воздух, акцентная типографика и аккуратность деталей.</p>
`,
    coverImage: "",
    coverAlt: "9 ошибок веб-дизайна",
    seoTitle: "9 ошибок, из-за которых сайт выглядит дешево — и как это исправить | KSENWEB",
    metaDescription: "Практический разбор 9 ошибок в UI/UX дизайне, типографике, цветах и мобильной верстке сайтов. Как сделать сайт визуально дорогим и повысить конверсию.",
    canonicalOverride: "",
    noindex: false,
    ogTitle: "9 ошибок, из-за которых сайт выглядит дешево — и как это исправить",
    ogDescription: "Практический разбор 9 ошибок в UI/UX дизайне, типографике, цветах и мобильной верстке сайтов.",
    ogImage: "",
    author: "Ксения Матвеенко",
    category: "Дизайн & UX",
    tags: ["UI/UX", "Редизайн", "Типографика"],
    status: "published",
    publishedAt: "2026-09-18T10:00:00.000Z",
    updatedAt: "2026-09-18T10:00:00.000Z",
    readingTime: "7 мин"
  }
];
const fallbackArticles = [];

const fallbackCases = [
  {
    slug: "esthete-catering",
    title: "ESTHÈTE CATERING — Haute Gastronomie & Event Design",
    description: "Интерактивный концепт премиального гастрономического кейтеринга. Авторская подача, монументальный дизайн и калькулятор мероприятий.",
    image: "https://www.ksenweb.com/demos/esthete-catering/images/hero_outdoor.jpg",
    tags: ["ИИ-Концепт", "Гастрономия", "Landing"]
  },
  {
    slug: "apex-detailing",
    title: "APEX DETAILING — Hydrophobic Precision Studio",
    description: "Интерактивный концепт студии премиального детейлинга. Защитные керамические покрытия, оклейка пленкой и калькулятор ухода.",
    image: "https://www.ksenweb.com/demos/apex-detailing/images/hero_car.jpg",
    tags: ["ИИ-Концепт", "Авто", "Landing"]
  }
];

// Keep every known public case discoverable even if the Supabase request used
// to enrich the sitemap is temporarily unavailable or its schema changes.
const fallbackSitemapCaseSlugs = [
  'esthete-catering',
  'apex-detailing',
  'elison-stroi',
  'plant-market-b2b',
  'oasis-camp-redesign',
  'stenografist-ai',
  'marketing-emsoft',
  'mir-tartaletok',
  'medical-center'
];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAboutText(about) {
  if (typeof about === 'string') {
    try {
      const parsed = JSON.parse(about);
      if (typeof parsed?.text === 'string') return parsed.text.trim();
    } catch {
      return about.trim();
    }
  }
  return typeof about?.text === 'string' ? about.text.trim() : '';
}

function ensureFormattedHtml(rawContent) {
  if (!rawContent) return '';
  let content = rawContent.trim();
  content = content.replace(/<div\s+class="article-cta-box[\s\S]*?<\/div>\s*<\/div>/gi, '');
  content = content.replace(/<div\s+class="article-cta-box[\s\S]*?<\/div>/gi, '');
  content = content.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (match) => match.replace(/\n\s*/g, ' '));

  if (!/<p\b[^>]*>/i.test(content)) {
    content = content.replace(/(^|\n)(\d+\.\s+[^\n]+)/g, '$1<h2>$2</h2>');
    const blocks = content.split(/\n\s*\n/);
    content = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<figure') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<a')
      ) {
        return trimmed;
      }
      return `<p style="margin-bottom:1.25rem;">${trimmed.replace(/\n/g, '<br />')}</p>`;
    }).filter(Boolean).join('\n\n');
  }
  return content;
}

function renderHtmlDocument({
  title,
  description,
  canonical,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  ogType = "website",
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage = "https://www.ksenweb.com/og-image.png",
  publishedTime,
  author = "Ксения Матвеенко",
  jsonLd,
  bodyHtml,
  statusCode = 200
}) {
  const finalOgTitle = ogTitle || title;
  const finalOgDesc = ogDescription || description;
  const finalOgUrl = ogUrl || canonical;

  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${escapeHtml(robots)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta property="og:site_name" content="Ксения Матвеенко | Веб-дизайн, сайты и веб-приложения" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:title" content="${escapeHtml(finalOgTitle)}" />
  <meta property="og:description" content="${escapeHtml(finalOgDesc)}" />
  <meta property="og:url" content="${escapeHtml(finalOgUrl)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  ${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />` : ''}
  ${author ? `<meta property="article:author" content="${escapeHtml(author)}" />` : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(finalOgTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(finalOgDesc)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <link rel="describedby" type="text/markdown" href="/llms.txt" />
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />

  ${jsonLdString ? `<script type="application/ld+json">\n${jsonLdString}\n</script>` : ''}
</head>
<body class="bg-white text-zinc-900 antialiased font-sans m-0 p-0">
  <div id="root">
    ${bodyHtml}
  </div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

  return new Response(html, {
    status: statusCode,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=3600',
      'Vary': 'User-Agent, Accept',
      ...(statusCode >= 400 ? { 'X-Robots-Tag': 'noindex, follow' } : {})
    }
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const accept = request.headers.get('accept') || '';
  const verificationFiles = new Set([
    '/google5262767274b3245d.html',
    '/yandex_762ce613be15bfd0.html'
  ]);

  // 1. Static asset bypass
  if (
    verificationFiles.has(pathname) ||
    (pathname !== '/sitemap.xml' && pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|json|txt|xml|map)$/i)) ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/demos/')
  ) {
    return;
  }

  // 2. Dynamic sitemap.xml
  if (pathname === '/sitemap.xml') {
    const today = new Date().toISOString().split('T')[0];
    let cases = fallbackSitemapCaseSlugs.map(slug => ({ slug, date: today }));
    let articles = [];

    try {
      const supabaseUrl = 'https://slyroiqjmgykgimxeytv.supabase.co';
      const anonKey = 'sb_publishable_dXbGCveDFU_j2biRt6qHJg_jKPwybdS';

      const casesRes = await fetch(`${supabaseUrl}/rest/v1/cases?select=slug,id,updated_at`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
      });
      if (casesRes.ok) {
        const fetchedCases = await casesRes.json();
        if (Array.isArray(fetchedCases) && fetchedCases.length > 0) {
          fetchedCases.forEach(c => {
            const slug = c.slug || c.id;
            if (slug && !cases.some(item => item.slug === String(slug))) {
              cases.push({
                slug: String(slug),
                date: c.updated_at ? c.updated_at.split('T')[0] : today
              });
            }
          });
        }
      }

      const articlesRes = await fetch(`${supabaseUrl}/rest/v1/articles?select=slug,updated_at&status=eq.published`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
      });
      if (articlesRes.ok) {
        const fetchedArticles = await articlesRes.json();
        if (Array.isArray(fetchedArticles) && fetchedArticles.length > 0) {
          fetchedArticles.forEach(a => {
            if (a.slug && !articles.some(item => item.slug === a.slug)) {
              articles.push({
                slug: a.slug,
                date: a.updated_at ? a.updated_at.split('T')[0] : today
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('Sitemap dynamic fetch error:', err);
    }

    const casesUrlsXml = cases.map(c => `
  <url>
    <loc>https://www.ksenweb.com/case/${c.slug}</loc>
    <lastmod>${c.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`).join('');

    const articleUrlsXml = articles.map(a => `
  <url>
    <loc>https://www.ksenweb.com/blog/${a.slug}</loc>
    <lastmod>${a.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.ksenweb.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://www.ksenweb.com/og-image.png</image:loc>
      <image:title>Ксения Матвеенко — Разработка сайтов и веб-приложений</image:title>
    </image:image>
  </url>
  <url>
    <loc>https://www.ksenweb.com/cases</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>${casesUrlsXml}
  <url>
    <loc>https://www.ksenweb.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${articleUrlsXml}
  <url>
    <loc>https://www.ksenweb.com/brief</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.ksenweb.com/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.ksenweb.com/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

    return new Response(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60'
      }
    });
  }

  // 3. Discovery endpoints
  const privateDiscoveryHeaders = {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Cache-Control': 'no-store'
  };
  const publicMachineReadableHeaders = {
    'X-Robots-Tag': 'noindex, follow, noarchive'
  };

  if (pathname === '/.well-known/api-catalog') {
    return new Response(apiCatalogJson, { status: 200, headers: { ...privateDiscoveryHeaders, 'Content-Type': 'application/linkset+json; charset=utf-8' } });
  }
  if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/oauth-authorization-server') {
    return new Response(openidConfigurationJson, { status: 200, headers: { ...privateDiscoveryHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
  }
  if (pathname === '/.well-known/oauth-protected-resource') {
    return new Response(oauthProtectedResourceJson, { status: 200, headers: { ...privateDiscoveryHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
  }
  if (pathname === '/.well-known/mcp/server-card.json') {
    return new Response(mcpServerCardJson, { status: 200, headers: { ...privateDiscoveryHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
  }
  if (pathname === '/.well-known/agent-skills/index.json') {
    return new Response(agentSkillsJson, { status: 200, headers: { ...privateDiscoveryHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
  }
  if (pathname === '/skills/portfolio-query/SKILL.md') {
    return new Response(skillMdContent, { status: 200, headers: { ...publicMachineReadableHeaders, 'Content-Type': 'text/markdown; charset=utf-8' } });
  }
  if (pathname === '/auth.md') {
    return new Response(authMdContent, { status: 200, headers: { ...privateDiscoveryHeaders, 'Content-Type': 'text/markdown; charset=utf-8' } });
  }

  // 4. LLM Markdown Content Negotiation
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isSearchCrawler = /googlebot|google-inspectiontool|google-extended|yandexbot|bingbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|telegrambot|linkedinbot|embedly|whatsapp|gptbot|chatgpt-user|perplexitybot|claudebot|anthropic-ai/i.test(userAgent);
  const wantsMarkdownOnly = (accept.startsWith('text/markdown') || accept.startsWith('application/x-markdown') || accept === 'text/markdown') && !accept.includes('text/html');

  if (!isSearchCrawler && wantsMarkdownOnly && (pathname === '/' || pathname === '/index.html')) {
    const tokensCount = Math.ceil(markdownContent.length / 4);
    return new Response(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(tokensCount),
        'Vary': 'User-Agent, Accept'
      }
    });
  }

  // The HTML below is a search/social crawler rendering layer. Regular visitors
  // must continue to the Vite SPA so the production asset manifest is used.
  // Returning this handcrafted document to browsers would reference /src/main.jsx,
  // which does not exist in a Vite production build.
  if (!isSearchCrawler) {
    return;
  }

  // 5. SSR / Server-Rendered HTML generation for pages

  // ─── Route A: Single Article (/blog/:slug) ─────────────────────────────────
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '').trim();
    if (slug) {
      let article = null;
      try {
        const supabaseUrl = 'https://slyroiqjmgykgimxeytv.supabase.co';
        const anonKey = 'sb_publishable_dXbGCveDFU_j2biRt6qHJg_jKPwybdS';
        const res = await fetch(`${supabaseUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published`, {
          headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const dbA = list[0];
            article = {
              title: dbA.title,
              excerpt: dbA.excerpt,
              content: dbA.content,
              coverImage: dbA.cover_image || dbA.coverImage,
              coverAlt: dbA.cover_alt || dbA.coverAlt,
              seoTitle: dbA.seo_title || dbA.seoTitle,
              metaDescription: dbA.meta_description || dbA.metaDescription,
              canonicalOverride: dbA.canonical_override || dbA.canonicalOverride,
              noindex: dbA.noindex || false,
              ogTitle: dbA.og_title || dbA.ogTitle,
              ogDescription: dbA.og_description || dbA.ogDescription,
              ogImage: dbA.og_image || dbA.ogImage,
              author: dbA.author || 'Ксения Матвеенко',
              category: dbA.category || 'Статья',
              publishedAt: dbA.published_at || dbA.publishedAt,
              updatedAt: dbA.updated_at || dbA.updatedAt,
              readingTime: dbA.reading_time || dbA.readingTime || '5 мин'
            };
          }
        }
      } catch (e) {}

      if (!article) {
        const localMatch = fallbackArticles.find(a => a.slug === slug);
        if (localMatch) article = localMatch;
      }

      if (article) {
        const canonical = article.canonicalOverride || `https://www.ksenweb.com/blog/${slug}`;
        const title = article.seoTitle || `${article.title} | KSENWEB`;
        const description = article.metaDescription || article.excerpt;
        const ogImage = article.ogImage || article.coverImage || "https://www.ksenweb.com/og-image.png";

        const formattedDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

        const jsonLd = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": article.title,
          "description": description,
          "image": [ogImage],
          "datePublished": article.publishedAt || new Date().toISOString(),
          "dateModified": article.updatedAt || article.publishedAt || new Date().toISOString(),
          "author": {
            "@type": "Person",
            "name": article.author || "Ксения Матвеенко",
            "url": "https://www.ksenweb.com"
          },
          "publisher": {
            "@type": "Person",
            "name": "Ксения Матвеенко",
            "url": "https://www.ksenweb.com"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonical
          }
        };

        const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 900px; margin: 0 auto; line-height: 1.6;">
  <nav style="margin-bottom: 24px; font-size: 14px; color: #71717a;">
    <a href="/" style="color: #71717a; text-decoration: none;">Главная</a> &gt; 
    <a href="/blog" style="color: #71717a; text-decoration: none;">Блог</a> &gt; 
    <span>${escapeHtml(article.title)}</span>
  </nav>

  <article>
    <header style="margin-bottom: 32px;">
      <div style="font-size: 12px; font-family: monospace; font-weight: 600; text-transform: uppercase; color: #FF5B23; margin-bottom: 8px;">
        ${escapeHtml(article.category)}
      </div>
      <h1 style="font-size: 2.25rem; font-weight: 700; line-height: 1.25; margin: 0 0 16px 0; color: #09090b;">
        ${escapeHtml(article.title)}
      </h1>
      <div style="font-size: 14px; color: #71717a; display: flex; gap: 16px; margin-bottom: 16px;">
        ${formattedDate ? `<span>📅 ${escapeHtml(formattedDate)}</span>` : ''}
        ${article.readingTime ? `<span>⏱ ${escapeHtml(article.readingTime)}</span>` : ''}
        <span>✍️ ${escapeHtml(article.author || 'Ксения Матвеенко')}</span>
      </div>
      ${article.excerpt ? `<p style="font-size: 1.1rem; color: #52525b; margin: 0; line-height: 1.6;">${escapeHtml(article.excerpt)}</p>` : ''}
    </header>

    ${article.coverImage ? `
    <div style="margin-bottom: 32px;">
      <img src="${escapeHtml(article.coverImage)}" alt="${escapeHtml(article.coverAlt || article.title)}" style="width:100%; height:auto; border-radius:4px; aspect-ratio:16/9; object-fit:cover;" />
    </div>` : ''}

    <div class="article-body" style="font-size: 1.05rem; color: #27272a;">
      ${ensureFormattedHtml(article.content)}
    </div>

    <footer style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
      <a href="/blog" style="display: inline-block; padding: 10px 20px; background: #18181b; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px;">
        ← Вернуться в блог
      </a>
    </footer>
  </article>
</div>`;

        return renderHtmlDocument({
          title,
          description,
          canonical,
          robots: article.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          ogType: "article",
          ogTitle: article.ogTitle || title,
          ogDescription: article.ogDescription || description,
          ogUrl: canonical,
          ogImage,
          publishedTime: article.publishedAt,
          author: article.author,
          jsonLd,
          bodyHtml
        });
      } else {
        // 404 for unknown article
        const title = "404 — Статья не найдена | KSENWEB";
        const description = "Запрошенная статья не существует или была перемещена.";
        const canonical = `https://www.ksenweb.com/blog/${slug}`;
        const bodyHtml = `
<div style="padding: 64px 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 600px; margin: 0 auto; text-align: center;">
  <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem; color: #18181b;">404</h1>
  <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Статья не найдена</h2>
  <p style="color: #71717a; margin-bottom: 2rem;">К сожалению, по данному адресу статья не найдена. Возможно, она была удалена или перенесена.</p>
  <a href="/blog" style="display: inline-block; padding: 12px 24px; background: #FF5B23; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500;">
    Перейти ко всем статьям
  </a>
</div>`;

        return renderHtmlDocument({
          title,
          description,
          canonical,
          robots: "noindex, follow",
          bodyHtml,
          statusCode: 404
        });
      }
    }
  }

  // ─── Route B: Blog Index (/blog) ───────────────────────────────────────────
  if (pathname === '/blog') {
    const title = "Блог о веб-дизайне, разработке сайтов и ИИ | KSENWEB";
    const description = "Полезные статьи и материалы для владельцев бизнеса: как сделать сайт эффективным, избежать ошибок в дизайне и выстроить системные продажи в сети.";
    const canonical = "https://www.ksenweb.com/blog";

    let articles = [...fallbackArticles];
    try {
      const supabaseUrl = 'https://slyroiqjmgykgimxeytv.supabase.co';
      const anonKey = 'sb_publishable_dXbGCveDFU_j2biRt6qHJg_jKPwybdS';
      const res = await fetch(`${supabaseUrl}/rest/v1/articles?status=eq.published&order=published_at.desc`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
      });
      if (res.ok) {
        const fetched = await res.json();
        if (Array.isArray(fetched) && fetched.length > 0) {
          fetched.forEach(item => {
            if (!articles.some(a => a.slug === item.slug)) {
              articles.push({
                slug: item.slug,
                title: item.title,
                excerpt: item.excerpt,
                category: item.category || 'Статья',
                publishedAt: item.published_at || item.publishedAt,
                readingTime: item.reading_time || item.readingTime || '5 мин'
              });
            }
          });
        }
      }
    } catch (e) {}

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${canonical}#webpage`,
          "name": "Блог о веб-дизайне и разработке сайтов",
          "url": canonical,
          "description": description,
          "inLanguage": "ru",
          "publisher": { "@id": "https://www.ksenweb.com/#person" },
          "isPartOf": { "@id": "https://www.ksenweb.com/#website" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://www.ksenweb.com/" },
            { "@type": "ListItem", "position": 2, "name": "Блог", "item": canonical }
          ]
        }
      ]
    };

    const articlesListHtml = articles.map(a => `
    <article style="border: 1px solid #e4e4e7; border-radius: 4px; padding: 24px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-family: monospace; font-weight: 600; text-transform: uppercase; color: #FF5B23; margin-bottom: 8px;">
        ${escapeHtml(a.category || 'Статья')}
      </div>
      <h2 style="font-size: 1.35rem; font-weight: 600; margin: 0 0 12px 0;">
        <a href="/blog/${escapeHtml(a.slug)}" style="color: #18181b; text-decoration: none;">${escapeHtml(a.title)}</a>
      </h2>
      <p style="color: #52525b; margin: 0 0 16px 0; font-size: 0.95rem;">${escapeHtml(a.excerpt)}</p>
      <a href="/blog/${escapeHtml(a.slug)}" style="color: #FF5B23; font-weight: 600; text-decoration: none; font-size: 14px;">
        Читать статью →
      </a>
    </article>`).join('');

    const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 900px; margin: 0 auto; line-height: 1.6;">
  <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 12px;">Блог & Гайды</h1>
  <p style="font-size: 1.1rem; color: #52525b; margin-bottom: 32px;">${escapeHtml(description)}</p>
  <div class="articles-grid">
    ${articlesListHtml}
  </div>
</div>`;

    return renderHtmlDocument({ title, description, canonical, jsonLd, bodyHtml });
  }

  // ─── Route C: Cases Index (/cases) & Case Page (/case/:id) ──────────────────
  if (pathname.startsWith('/case/')) {
    const slug = pathname.replace('/case/', '').trim();
    if (slug) {
      let caseItem = fallbackCases.find(c => c.slug === slug);

      try {
        const supabaseUrl = 'https://slyroiqjmgykgimxeytv.supabase.co';
        const anonKey = 'sb_publishable_dXbGCveDFU_j2biRt6qHJg_jKPwybdS';
        const res = await fetch(`${supabaseUrl}/rest/v1/cases?slug=eq.${encodeURIComponent(slug)}`, {
          headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const dbC = list[0];
            caseItem = {
              slug: dbC.slug,
              title: dbC.title || dbC.name,
              description: getAboutText(dbC.about) || dbC.subtitle || dbC.description || dbC.card_title,
              image: dbC.card_image || dbC.imageMain,
              tags: dbC.tags || []
            };
          }
        }
      } catch (e) {}

      if (caseItem) {
        const title = `${caseItem.title} | Ксения Матвеенко`;
        const description = caseItem.description;
        const canonical = `https://www.ksenweb.com/case/${slug}`;
        const ogImage = caseItem.image || "https://www.ksenweb.com/og-image.png";

        const jsonLd = {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": caseItem.title,
          "description": description,
          "image": ogImage,
          "url": canonical,
          "creator": {
            "@type": "Person",
            "name": "Ксения Матвеенко",
            "url": "https://www.ksenweb.com"
          }
        };

        const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 900px; margin: 0 auto; line-height: 1.6;">
  <nav style="margin-bottom: 24px; font-size: 14px; color: #71717a;">
    <a href="/" style="color: #71717a; text-decoration: none;">Главная</a> &gt; 
    <a href="/cases" style="color: #71717a; text-decoration: none;">Кейсы</a> &gt; 
    <span>${escapeHtml(caseItem.title)}</span>
  </nav>
  <article>
    <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 16px;">${escapeHtml(caseItem.title)}</h1>
    <p style="font-size: 1.1rem; color: #52525b; margin-bottom: 24px;">${escapeHtml(caseItem.description)}</p>
    ${caseItem.image ? `<img src="${escapeHtml(caseItem.image)}" alt="${escapeHtml(caseItem.title)}" style="width:100%; height:auto; border-radius:4px; margin-bottom:32px;" />` : ''}
    <p><a href="/cases" style="color: #FF5B23; text-decoration: none; font-weight: 500;">← Вернуться к списку проектов</a></p>
  </article>
</div>`;

        return renderHtmlDocument({ title, description, canonical, ogImage, jsonLd, bodyHtml });
      } else {
        const title = "404 — Проект не найден | KSENWEB";
        const description = "Запрошенный проект не найден.";
        const canonical = `https://www.ksenweb.com/case/${slug}`;
        const bodyHtml = `
<div style="padding: 64px 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 600px; margin: 0 auto; text-align: center;">
  <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem;">404</h1>
  <h2>Проект не найден</h2>
  <p style="color: #71717a; margin-bottom: 2rem;">К сожалению, данный кейс не существует.</p>
  <a href="/cases" style="display: inline-block; padding: 12px 24px; background: #FF5B23; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500;">
    Смотреть все проекты
  </a>
</div>`;

        return renderHtmlDocument({ title, description, canonical, robots: "noindex, follow", bodyHtml, statusCode: 404 });
      }
    }
  }

  if (pathname === '/cases') {
    const title = "Результаты и кейсы | Ксения Матвеенко";
    const description = "Примеры реализованных проектов и концептов: коммерческие сайты на Tilda, кастомные веб-приложения на React/Supabase, UI/UX дизайн в Figma.";
    const canonical = "https://www.ksenweb.com/cases";
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${canonical}#webpage`,
          "name": title,
          "description": description,
          "url": canonical,
          "inLanguage": "ru",
          "isPartOf": { "@id": "https://www.ksenweb.com/#website" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://www.ksenweb.com/" },
            { "@type": "ListItem", "position": 2, "name": "Кейсы", "item": canonical }
          ]
        }
      ]
    };

    const seoCases = [...fallbackCases];
    try {
      const supabaseUrl = 'https://slyroiqjmgykgimxeytv.supabase.co';
      const anonKey = 'sb_publishable_dXbGCveDFU_j2biRt6qHJg_jKPwybdS';
      const res = await fetch(`${supabaseUrl}/rest/v1/cases?select=*`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
      });
      if (res.ok) {
        const fetchedCases = await res.json();
        if (Array.isArray(fetchedCases)) {
          fetchedCases.forEach(dbC => {
            if (dbC.slug && !seoCases.some(c => c.slug === dbC.slug)) {
              seoCases.push({
                slug: dbC.slug,
                title: dbC.title || dbC.name || dbC.card_title,
                description: getAboutText(dbC.about) || dbC.subtitle || dbC.description || dbC.card_title,
                image: dbC.card_image || dbC.imageMain,
                tags: dbC.tags || []
              });
            }
          });
        }
      }
    } catch (e) {}

    const casesListHtml = seoCases.map(c => `
    <article style="border: 1px solid #e4e4e7; border-radius: 4px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 1.35rem; font-weight: 600; margin: 0 0 12px 0;">
        <a href="/case/${escapeHtml(c.slug)}" style="color: #18181b; text-decoration: none;">${escapeHtml(c.title)}</a>
      </h2>
      <p style="color: #52525b; margin: 0 0 16px 0;">${escapeHtml(c.description)}</p>
      <a href="/case/${escapeHtml(c.slug)}" style="color: #FF5B23; font-weight: 600; text-decoration: none;">Смотреть проект →</a>
    </article>`).join('');

    const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 900px; margin: 0 auto; line-height: 1.6;">
  <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 12px;">Портфолио & Кейсы</h1>
  <p style="font-size: 1.1rem; color: #52525b; margin-bottom: 32px;">${escapeHtml(description)}</p>
  ${casesListHtml}
</div>`;

    return renderHtmlDocument({ title, description, canonical, jsonLd, bodyHtml });
  }

  // ─── Route D: Brief (/brief) ────────────────────────────────────────────────
  if (pathname === '/brief') {
    const title = "Бриф на разработку сайта или веб-приложения | KSENWEB";
    const description = "Заполните онлайн-бриф для расчета стоимости и сроков вашего проекта по разработке сайта на Tilda или веб-приложения.";
    const canonical = "https://www.ksenweb.com/brief";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      "name": title,
      "description": description,
      "url": canonical,
      "inLanguage": "ru",
      "isPartOf": { "@id": "https://www.ksenweb.com/#website" }
    };

    const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; line-height: 1.6;">
  <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 16px;">Бриф на разработку проекта</h1>
  <p style="font-size: 1.1rem; color: #52525b; margin-bottom: 24px;">Ответьте на ключевые вопросы о вашем бизнесе, задачах и сроках, чтобы получить точный расчет стоимости и концепцию решения.</p>
  <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 24px;">
    <p style="margin: 0; color: #71717a;">Форма интерактивного брифа подгружается в браузере...</p>
  </div>
</div>`;

    return renderHtmlDocument({ title, description, canonical, jsonLd, bodyHtml });
  }

  // ─── Route E: Legal pages (/privacy-policy, /terms) ─────────────────────────
  if (pathname === '/privacy-policy') {
    const title = "Политика конфиденциальности | KSENWEB";
    const description = "Политика обработки персональных данных ИП Матвеенко К.А. (УНП ЕЕ7594998).";
    const canonical = "https://www.ksenweb.com/privacy-policy";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      "name": title,
      "description": description,
      "url": canonical,
      "inLanguage": "ru"
    };

    const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; line-height: 1.6;">
  <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 16px;">Политика конфиденциальности</h1>
  <p style="color: #52525b; margin-bottom: 16px;">Настоящая политика конфиденциальности определяет порядок обработки и защиты информации о физических лицах, пользующихся сервисами сайта ksenweb.com.</p>
  <p style="color: #71717a;">Оператор: Матвеенко Ксения Александровна (УНП ЕЕ7594998). Email: matweenko98@gmail.com</p>
</div>`;

    return renderHtmlDocument({ title, description, canonical, jsonLd, bodyHtml });
  }

  if (pathname === '/terms') {
    const title = "Условия использования и публичная оферта | KSENWEB";
    const description = "Условия оказания услуг по разработке сайтов и веб-приложений (УНП ЕЕ7594998).";
    const canonical = "https://www.ksenweb.com/terms";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      "name": title,
      "description": description,
      "url": canonical,
      "inLanguage": "ru"
    };

    const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; line-height: 1.6;">
  <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 16px;">Условия использования</h1>
  <p style="color: #52525b; margin-bottom: 16px;">Правила и регламент оказания услуг по дизайну, проектированию и разработке веб-сайтов и приложений.</p>
  <p style="color: #71717a;">Матвеенко Ксения Александровна (Плательщик НПД, УНП ЕЕ7594998).</p>
</div>`;

    return renderHtmlDocument({ title, description, canonical, jsonLd, bodyHtml });
  }

  // ─── Route F: Homepage (/) ──────────────────────────────────────────────────
  if (pathname === '/' || pathname === '/index.html') {
    const title = "Ксения Матвеенко — Разработка сайтов и веб-приложений";
    const description = "Создание сайтов на Tilda под ключ и веб-приложений/интерфейсов под задачи бизнеса.";
    const canonical = "https://www.ksenweb.com/";
    const ogTitle = "Ксения Матвеенко — Разработка сайтов и веб-приложений";
    const ogDescription = "Создание сайтов на Tilda под ключ и веб-приложений/интерфейсов под задачи бизнеса.";

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://www.ksenweb.com/#website",
          "url": "https://www.ksenweb.com/",
          "name": "KSENWEB — Ксения Матвеенко",
          "inLanguage": "ru",
          "publisher": { "@id": "https://www.ksenweb.com/#person" }
        },
        {
          "@type": "WebPage",
          "@id": "https://www.ksenweb.com/#webpage",
          "url": "https://www.ksenweb.com/",
          "name": title,
          "description": description,
          "inLanguage": "ru",
          "isPartOf": { "@id": "https://www.ksenweb.com/#website" },
          "about": { "@id": "https://www.ksenweb.com/#person" }
        },
        {
          "@type": "Person",
          "@id": "https://www.ksenweb.com/#person",
          "name": "Ксения Матвеенко",
          "alternateName": "Ксения Александровна Матвеенко",
          "jobTitle": "Веб-дизайнер и разработчик веб-приложений",
          "url": "https://www.ksenweb.com",
          "image": "https://www.ksenweb.com/og-image.png",
          "sameAs": ["https://t.me/ksen_web"],
          "knowsAbout": [
            "Web Design", "UI/UX Design", "Tilda Development",
            "React Web Applications", "Supabase Integration", "AI Prompt Engineering"
          ]
        },
        {
          "@type": "ProfessionalService",
          "@id": "https://www.ksenweb.com/#service",
          "name": "Ксения Матвеенко — Разработка сайтов и веб-приложений",
          "url": "https://www.ksenweb.com",
          "provider": { "@id": "https://www.ksenweb.com/#person" },
          "description": description,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "BY",
            "addressRegion": "Минская область",
            "addressLocality": "Минск"
          },
          "areaServed": [
            { "@type": "Country", "name": "Беларусь", "alternateName": "РБ" },
            { "@type": "Country", "name": "Россия", "alternateName": "РФ" },
            { "@type": "Place", "name": "СНГ" }
          ],
          "telephone": "+375259140959",
          "email": "matweenko98@gmail.com",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "telephone": "+375259140959",
            "email": "matweenko98@gmail.com",
            "availableLanguage": ["ru"]
          },
          "priceRange": "$$$"
        }
      ]
    };

    const bodyHtml = `
<div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 1000px; margin: 0 auto; line-height: 1.6;">
  <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Ксения Матвеенко — Дизайн и разработка сайтов и веб-приложений под ключ</h1>
  <p style="font-size: 1.1rem; color: #3f3f46; margin-bottom: 1.5rem;">Веб-дизайнер и разработчик интерфейсов. Создание продающих сайтов на Tilda и кастомных веб-приложений на React / Supabase для бизнеса в Беларуси (РБ), России (РФ) и удаленно по всему миру.</p>
  
  <h2 style="font-size: 1.4rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem;">Ключевые направления работы</h2>
  <ul style="list-style-type: disc; padding-left: 1.25rem; margin-bottom: 1.5rem;">
    <li style="margin-bottom: 0.5rem;"><strong>1. Создание сайтов «под ключ» на Tilda:</strong> Лендинги, многостраничные корпоративные сайты и каталоги услуг с кастомным дизайном в Zero Block и базовой SEO-оптимизацией для старта рекламы.</li>
    <li style="margin-bottom: 0.5rem;"><strong>2. Разработка веб-приложений и MVP (React & Supabase):</strong> Кастомные веб-сервисы, личные кабинеты пользователей, интерактивные панели и интеграция нейросетей (AI).</li>
    <li style="margin-bottom: 0.5rem;"><strong>3. Проектирование UI/UX в Figma:</strong> Интерактивные прототипы, аналитика пользовательского поведения и дизайн-системы.</li>
  </ul>

  <h2 style="font-size: 1.4rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem;">География работы и контакты</h2>
  <p style="margin-bottom: 1rem;">Официальное сотрудничество по договору (Налог на профессиональный доход, УНП ЕЕ7594998). Работа с клиентами по всей Беларуси, России и СНГ удаленно.</p>
  <p>Telegram: <a href="https://t.me/ksen_web" style="color: #ff5b23; font-weight: 500;">@ksen_web</a> | Телефон: +375 (25) 914-09-59 | Email: matweenko98@gmail.com</p>
</div>`;

    return renderHtmlDocument({ title, description, canonical, ogTitle, ogDescription, jsonLd, bodyHtml });
  }

  // ─── Route G: Unknown routes -> 404 HTML Response ───────────────────────────
  if (!pathname.startsWith('/admin')) {
    const title = "404 — Страница не найдена | KSENWEB";
    const description = "Запрошенная страница не существует на сайте ksenweb.com.";
    const canonical = `https://www.ksenweb.com${pathname}`;
    const bodyHtml = `
<div style="padding: 64px 32px; font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 600px; margin: 0 auto; text-align: center;">
  <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem;">404</h1>
  <h2>Страница не найдена</h2>
  <p style="color: #71717a; margin-bottom: 2rem;">К сожалению, запрошенная страница не существует.</p>
  <a href="/" style="display: inline-block; padding: 12px 24px; background: #FF5B23; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500;">
    На главную
  </a>
</div>`;

    return renderHtmlDocument({ title, description, canonical, robots: "noindex, follow", bodyHtml, statusCode: 404 });
  }
}
