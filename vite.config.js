import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const markdownContent = `# Ksenia Matveenko — UI/UX Designer, Frontend Developer & AI Prompt Engineer / Веб-дизайнер и разработчик интерфейсов

Welcome to the LLM-friendly version of my portfolio. / Добро пожаловать в текстовую версию моего портфолио.

## Core Identity & Professional Overview / Общая информация
- **Full Name**: Матвеенко Ксения Александровна (Ksenia Alexandrovna Matveenko)
- **Role**: Professional Web Designer, UI/UX Specialist, and Frontend/AI Engineer.
- **Location**: Belarus (Минская область).
- **Tax Status / УНП**: Налог на профессиональный доход (НПД) в Беларуси. УНП: ЕЕ7594998.
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
  "id_token_signing_alg_values_supported": [
    "RS256"
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
- **MCP Server Card**: \`/.well-known/mcp/server-card.json\`

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

function markdownNegotiationPlugin() {
  return {
    name: 'markdown-negotiation',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const accept = req.headers['accept'] || '';
        const url = req.url ? new URL(req.url, `http://${req.headers.host || 'localhost'}`) : null;
        const pathname = url ? url.pathname : '';
        if (pathname === '/.well-known/api-catalog') {
          res.setHeader('Content-Type', 'application/linkset+json; charset=utf-8');
          res.end(apiCatalogJson);
        } else if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/oauth-authorization-server') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(openidConfigurationJson);
        } else if (pathname === '/.well-known/oauth-protected-resource') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(oauthProtectedResourceJson);
        } else if (pathname === '/.well-known/mcp/server-card.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(mcpServerCardJson);
        } else if (pathname === '/.well-known/agent-skills/index.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(agentSkillsJson);
        } else if (pathname === '/skills/portfolio-query/SKILL.md') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.end(skillMdContent);
        } else if (pathname === '/auth.md') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.end(authMdContent);
        } else if (accept.includes('text/markdown') && (pathname === '/' || pathname === '/index.html')) {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.setHeader('x-markdown-tokens', String(Math.ceil(markdownContent.length / 4)));
          res.end(markdownContent);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const accept = req.headers['accept'] || '';
        const url = req.url ? new URL(req.url, `http://${req.headers.host || 'localhost'}`) : null;
        const pathname = url ? url.pathname : '';
        if (pathname === '/.well-known/api-catalog') {
          res.setHeader('Content-Type', 'application/linkset+json; charset=utf-8');
          res.end(apiCatalogJson);
        } else if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/oauth-authorization-server') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(openidConfigurationJson);
        } else if (pathname === '/.well-known/oauth-protected-resource') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(oauthProtectedResourceJson);
        } else if (pathname === '/.well-known/mcp/server-card.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(mcpServerCardJson);
        } else if (pathname === '/.well-known/agent-skills/index.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(agentSkillsJson);
        } else if (pathname === '/skills/portfolio-query/SKILL.md') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.end(skillMdContent);
        } else if (pathname === '/auth.md') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.end(authMdContent);
        } else if (accept.includes('text/markdown') && (pathname === '/' || pathname === '/index.html')) {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.setHeader('x-markdown-tokens', String(Math.ceil(markdownContent.length / 4)));
          res.end(markdownContent);
        } else {
          next();
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), markdownNegotiationPlugin()],

  server: {
    headers: {
      'Link': '</llms.txt>; rel="describedby"; type="text/markdown"'
    }
  },

  preview: {
    headers: {
      'Link': '</llms.txt>; rel="describedby"; type="text/markdown"'
    }
  },

  build: {
    target: 'es2022',

    // ─── Source Maps ──────────────────────────────────────────────────────────
    // В продакшене source maps отключены:
    //   - не утяжеляют сборку (карты могут весить столько же, сколько сам код)
    //   - не раскрывают исходный код пользователям в DevTools
    // В dev-режиме (`vite`) карты включены автоматически через Vite HMR.
    sourcemap: mode === 'development',

    rollupOptions: {
      output: {
        // ─── Manual chunk strategy ────────────────────────────────────────────
        // Разбиваем vendor-зависимости на стабильные чанки с длинным кешем.
        // React-core грузится сразу (нужен для любой страницы).
        // framer-motion и lucide-react выделены отдельно — они тяжёлые
        // (~100 KB min+gz) и меняются реже своего кода.
        manualChunks(id) {
          // React runtime — критический, отдельный чанк с max-age кешем
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Анимационная библиотека — тяжёлая, меняется редко
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }
          // Иконки — тяжёлые (tree-shaking работает, но лучше изолировать)
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
          // Supabase SDK
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Остальные node_modules
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },

  optimizeDeps: {
    rolldownOptions: {
      target: 'es2022',
    },
  },
}))
