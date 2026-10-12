import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import middleware from '../middleware.js';
import { createHash } from 'node:crypto';

test('public routes serve HTML and real errors regardless of user agent', async () => {
  const originalFetch = globalThis.fetch;
  let failCases = false;
  let failArticles = false;
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
      if (failArticles) return new Response('', { status: 503 });
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
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'self'/);
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
    failArticles = true;
    const brokenSitemap = await middleware(new Request('https://www.ksenweb.com/sitemap.xml'));
    assert.equal(brokenSitemap.status, 503);
    assert.equal(brokenSitemap.headers.get('cache-control'), 'no-store');
    failArticles = false;
    const redirect = await middleware(new Request('https://www.ksenweb.com/cases/?utm_source=test'));
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get('location'), 'https://www.ksenweb.com/cases?utm_source=test');
    for (const path of ['/hero-loop.mp4', '/pricing.md', '/fonts/example.woff2', '/admin', '/api/contact', '/index.html?__spa_shell=1']) {
      assert.equal(await middleware(new Request(`https://www.ksenweb.com${path}`)), undefined);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('agent discovery describes real resources and uses the correct digest', async () => {
  const response = await middleware(new Request('https://www.ksenweb.com/.well-known/agent-skills/index.json'));
  const index = await response.json();
  const skill = await middleware(new Request(index.skills[0].url));
  assert.equal(index.skills[0].digest, `sha256:${createHash('sha256').update(await skill.text()).digest('hex')}`);
  const catalogue = await middleware(new Request('https://www.ksenweb.com/.well-known/api-catalog'));
  const text = await catalogue.text();
  assert.match(text, /\/api\/contact/);
  assert.doesNotMatch(text, /vercel\.app|\/api\/status|\/docs\/api/);
  for (const path of ['/.well-known/openid-configuration', '/.well-known/oauth-protected-resource', '/.well-known/mcp/server-card.json', '/auth.md']) {
    assert.equal((await middleware(new Request(`https://www.ksenweb.com${path}`))).status, 404);
  }
  const configuration = JSON.parse(await readFile('vercel.json', 'utf8'));
  const spaRule = configuration.rewrites.find(rule => rule.destination === '/index.html');
  const pattern = new RegExp(`^${spaRule.source}$`);
  assert.ok(pattern.test('/cases'));
  for (const path of ['/api/contact', '/assets/missing.js', '/missing.png', '/fonts/missing.woff2']) assert.equal(pattern.test(path), false);
});
