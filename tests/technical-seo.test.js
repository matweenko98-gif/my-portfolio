import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import middleware from '../middleware.js';

test('public routes serve HTML and real errors regardless of user agent', async () => {
  const originalFetch = globalThis.fetch;
  let failCases = false;
  globalThis.fetch = async input => {
    const url = new URL(input);
    if (url.pathname.startsWith('/_seo/')) {
      return new Response(await readFile(`dist${url.pathname}`, 'utf8'));
    }
    if (url.pathname === '/index.html') return new Response(await readFile('dist/index.html', 'utf8'));
    if (url.pathname === '/rest/v1/cases') {
      if (failCases) return new Response('', { status: 503 });
      return new Response(JSON.stringify(url.searchParams.has('slug') ? [] : [
        { slug: 'elison-stroi', title: 'ELISON', updated_at: '2026-09-22T10:00:00Z' },
      ]));
    }
    if (url.pathname === '/rest/v1/articles') {
      assert.equal(url.searchParams.get('noindex'), 'eq.false');
      return new Response(JSON.stringify([
        { slug: 'indexable', updated_at: '2026-09-23T10:00:00Z' },
        { slug: 'syndicated', canonical_override: 'https://example.com/original' },
      ]));
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  try {
    for (const agent of ['Mozilla/5.0', 'AuditTool/1.0', 'Googlebot', 'GPTBot']) {
      for (const path of ['/', '/cases', '/case/esthete-catering', '/brief', '/privacy-policy', '/terms']) {
        const response = await middleware(new Request(`https://www.ksenweb.com${path}`, { headers: { 'user-agent': agent } }));
        const html = await response.text();
        assert.equal(response.status, 200, `${agent} ${path}`);
        assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
        assert.match(html, /\/assets\/index-[^"']+\.js/);
        assert.match(html, /rel="canonical" href="https:\/\/www\.ksenweb\.com/);
        assert.doesNotMatch(html, /\/assets\/(?:vendor-editor|AdminWorkspace)/);
        if (path === '/') assert.match(html, /"@type":"FAQPage"/);
      }
      for (const path of ['/does-not-exist', '/admin-unknown', '/case/missing']) {
        const response = await middleware(new Request(`https://www.ksenweb.com${path}`, { headers: { 'user-agent': agent } }));
        assert.equal(response.status, 404, path);
        assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
      }
    }
    failCases = true;
    const unavailable = await middleware(new Request('https://www.ksenweb.com/case/unavailable'));
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.headers.get('cache-control'), 'no-store');
    failCases = false;
    const sitemap = await middleware(new Request('https://www.ksenweb.com/sitemap.xml'));
    const xml = await sitemap.text();
    assert.match(xml, /\/blog\/indexable/);
    assert.doesNotMatch(xml, /syndicated/);
    assert.match(xml, /\/case\/elison-stroi<\/loc>\s*<lastmod>2026-09-22<\/lastmod>/);
    assert.doesNotMatch(xml, new RegExp(`<lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`));
    for (const path of ['/hero-loop.mp4', '/fonts/example.woff2', '/admin', '/index.html?__spa_shell=1']) {
      assert.equal(await middleware(new Request(`https://www.ksenweb.com${path}`)), undefined);
    }
  } finally { globalThis.fetch = originalFetch; }
});
