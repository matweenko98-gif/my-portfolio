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

export default function middleware(request) {
  const url = new URL(request.url);
  const accept = request.headers.get('accept') || '';

  if (url.pathname === '/sitemap.xml') {
    const today = new Date().toISOString().split('T')[0];
    const defaultArticles = [
      { slug: 'why-website-looks-cheap', date: today }
    ];

    let articleUrlsXml = defaultArticles.map(a => `
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
  </url>
  <url>
    <loc>https://www.ksenweb.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.ksenweb.com/brief</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>${articleUrlsXml}
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
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  }

  if (url.pathname === '/.well-known/api-catalog') {
    return new Response(apiCatalogJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/linkset+json; charset=utf-8'
      }
    });
  }

  if (url.pathname === '/.well-known/openid-configuration' || url.pathname === '/.well-known/oauth-authorization-server') {
    return new Response(openidConfigurationJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }

  if (url.pathname === '/.well-known/oauth-protected-resource') {
    return new Response(oauthProtectedResourceJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }

  if (url.pathname === '/.well-known/mcp/server-card.json') {
    return new Response(mcpServerCardJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }

  if (url.pathname === '/.well-known/agent-skills/index.json') {
    return new Response(agentSkillsJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }

  if (url.pathname === '/skills/portfolio-query/SKILL.md') {
    return new Response(skillMdContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8'
      }
    });
  }

  if (url.pathname === '/auth.md') {
    return new Response(authMdContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8'
      }
    });
  }

  if (url.pathname === '/sitemap.xml') {
    const supabaseUrl = 'https://slyroiqjmgykgimxeytv.supabase.co';
    const supabaseAnonKey = 'sb_publishable_dXbGCveDFU_j2biRt6qHJg_jKPwybdS';
    
    let caseUrls = [
      'https://www.ksenweb.com/case/esthete-catering',
      'https://www.ksenweb.com/case/apex-detailing'
    ];
    let articleUrls = [
      'https://www.ksenweb.com/blog/why-website-looks-cheap'
    ];

    try {
      const casesRes = await fetch(`${supabaseUrl}/rest/v1/cases?select=slug,id`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
      });
      if (casesRes.ok) {
        const dbCases = await casesRes.json();
        if (Array.isArray(dbCases)) {
          dbCases.forEach(item => {
            const slug = item.slug || (item.id ? String(item.id) : null);
            if (slug && !caseUrls.includes(`https://www.ksenweb.com/case/${slug}`)) {
              caseUrls.push(`https://www.ksenweb.com/case/${slug}`);
            }
          });
        }
      }

      const articlesRes = await fetch(`${supabaseUrl}/rest/v1/articles?select=slug`, {
        headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
      });
      if (articlesRes.ok) {
        const dbArticles = await articlesRes.json();
        if (Array.isArray(dbArticles)) {
          dbArticles.forEach(item => {
            if (item.slug && !articleUrls.includes(`https://www.ksenweb.com/blog/${item.slug}`)) {
              articleUrls.push(`https://www.ksenweb.com/blog/${item.slug}`);
            }
          });
        }
      }
    } catch (e) {}

    const today = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
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
  </url>
${caseUrls.map(u => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`).join('\n')}
  <url>
    <loc>https://www.ksenweb.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${articleUrls.map(u => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
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

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isSearchCrawler = /googlebot|yandexbot|bingbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|telegrambot|linkedinbot|embedly|whatsapp/i.test(userAgent);
  const wantsMarkdownOnly = (accept.startsWith('text/markdown') || accept.startsWith('application/x-markdown') || accept === 'text/markdown') && !accept.includes('text/html');

  if (!isSearchCrawler && wantsMarkdownOnly && (url.pathname === '/' || url.pathname === '/index.html')) {
    const tokensCount = Math.ceil(markdownContent.length / 4);
    return new Response(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(tokensCount)
      }
    });
  }
}

