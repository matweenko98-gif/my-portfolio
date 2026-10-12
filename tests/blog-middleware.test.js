import test from 'node:test';
import assert from 'node:assert/strict';
import middleware from '../middleware.js';

test('article HTML is available to ordinary visitors and crawlers before JavaScript', async () => {
  const originalFetch = globalThis.fetch;
  let articleResponse = [{
    slug: 'example',
    status: 'published',
    title: 'Статья о дизайне',
    excerpt: 'Краткое описание статьи',
    content: '<h2>Первый раздел</h2><p>Основной текст статьи доступен сразу.</p>',
    seo_title: 'Статья о дизайне | KSENWEB',
    published_at: '2026-09-18T10:00:00.000Z'
  }];
  let articleStatus = 200;

  globalThis.fetch = async input => {
    const url = new URL(input);
    if (url.pathname === '/index.html') {
      return new Response(`<!doctype html><html><head>
        <script type="module" crossorigin src="/assets/index-test.js"></script>
        <link rel="stylesheet" crossorigin href="/assets/index-test.css">
      </head><body><div id="root"></div></body></html>`);
    }
    if (url.pathname === '/rest/v1/articles') {
      return new Response(JSON.stringify(articleResponse), { status: articleStatus });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    for (const userAgent of ['Mozilla/5.0', 'ExampleCrawler/1.0']) {
      const response = await middleware(new Request('https://www.ksenweb.com/blog/example', {
        headers: { 'user-agent': userAgent, accept: 'text/html' }
      }));
      const html = await response.text();

      assert.equal(response.status, 200);
      assert.match(html, /Основной текст статьи доступен сразу/);
      assert.match(html, /<h1[^>]*>\s*Статья о дизайне\s*<\/h1>/);
      assert.match(html, /<title>Статья о дизайне \| Ксения Матвеенко — разработка сайтов\/приложений<\/title>/);
      assert.match(html, /<link rel="canonical" href="https:\/\/www\.ksenweb\.com\/blog\/example"/);
      assert.match(html, /"@type":"BlogPosting"/);
      assert.match(html, /\/assets\/index-test\.js/);
      assert.match(html, /\/assets\/index-test\.css/);
      assert.doesNotMatch(html, /\/src\/main\.jsx/);
    }

    const blog = await middleware(new Request('https://www.ksenweb.com/blog'));
    const blogHtml = await blog.text();
    assert.equal(blog.status, 200);
    assert.match(blogHtml, /Статья о дизайне/);
    assert.match(blogHtml, /\/assets\/index-test\.js/);

    articleResponse = [];
    const missing = await middleware(new Request('https://www.ksenweb.com/blog/missing'));
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('x-robots-tag'), 'noindex, follow');

    articleStatus = 503;
    const unavailableBlog = await middleware(new Request('https://www.ksenweb.com/blog'));
    assert.equal(unavailableBlog.status, 503);
    assert.equal(unavailableBlog.headers.get('cache-control'), 'no-store');
    const unavailable = await middleware(new Request('https://www.ksenweb.com/blog/unavailable'));
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.headers.get('cache-control'), 'no-store');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('case HTML exposes existing sections, respects visibility and escapes CMS text', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = new URL(input);
    if (url.pathname === '/index.html') return new Response('<script type="module" src="/assets/index-case.js"></script>');
    if (url.pathname === '/rest/v1/cases') return Response.json([{
      slug: 'complete', title: 'Проект', about: { text: 'Описание проекта' },
      process: [{ title: 'Исследование', desc: 'Изучили аудиторию' }],
      challenge: { task: 'Упростить заказ', solution: 'Сократили шаги' },
      features: [{ title: 'Каталог', text: 'Закрытый раздел' }], visibility: { desktop: false },
      custom_blocks: [{ type: 'text', content: '<script>unsafe()</script>' }],
    }]);
    throw new Error(`Unexpected fetch: ${url}`);
  };
  try {
    for (const agent of ['Mozilla/5.0', 'OAI-SearchBot', 'PerplexityBot', 'UnknownAudit']) {
      const response = await middleware(new Request('https://www.ksenweb.com/case/complete', { headers: { 'user-agent': agent } }));
      const html = await response.text();
      assert.equal(response.status, 200);
      for (const text of ['Описание проекта', 'Изучили аудиторию', 'Упростить заказ', 'Сократили шаги']) assert.ok(html.includes(text));
      assert.doesNotMatch(html, /Закрытый раздел|<script>unsafe/);
      const graph = JSON.parse(html.match(/<script id="jsonld-server"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
      assert.ok(graph.some(item => item['@id'] === 'https://www.ksenweb.com/#person'));
      assert.ok(graph.some(item => item['@type'] === 'CreativeWork'));
    }
  } finally { globalThis.fetch = originalFetch; }
});
