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
    const unavailable = await middleware(new Request('https://www.ksenweb.com/blog/unavailable'));
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.headers.get('cache-control'), 'no-store');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
