import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import middleware from '../middleware.js';
import { servicePages, servicePageSchema } from '../src/content/serviceSeo.js';
import { serviceRedirects } from '../src/content/additionalServices.js';
const buildDir=process.env.SEO_BUILD_DIR || 'dist';

test('all service pages are indexable HTML with unique metadata, matching schema and sitemap entries',async()=>{
 const savedFetch=globalThis.fetch;
 globalThis.fetch=async input=>{
  const url=new URL(input);
  if(url.pathname.startsWith('/_seo/'))return new Response(await readFile(buildDir+url.pathname,'utf8'));
  if(url.pathname.startsWith('/rest/v1/'))return new Response('[]');
  throw new Error('Unexpected request '+url);
 };
 try {
  const sitemap=await middleware(new Request('https://www.ksenweb.com/sitemap.xml'));
  assert.equal(sitemap.status,200);const xml=await sitemap.text();
  const staticSitemap=await readFile('public/sitemap.xml','utf8');
  const llms=await readFile('public/llms.txt','utf8');
  const titles=new Set();const descriptions=new Set();
  for(const [path,page] of Object.entries(servicePages)){
   assert.equal(page.noindex,false,path);
   assert.ok(!titles.has(page.title),path);titles.add(page.title);
   assert.ok(!descriptions.has(page.description),path);descriptions.add(page.description);
   for(const agent of ['Mozilla/5.0','Googlebot','OAI-SearchBot','YandexBot']){
    const response=await middleware(new Request('https://www.ksenweb.com'+path,{headers:{'user-agent':agent}}));
    assert.equal(response.status,200,path);assert.doesNotMatch(response.headers.get('x-robots-tag')||'',/noindex/);
    const html=await response.text();assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
    assert.ok(html.includes('<title>'+page.title+'</title>'),path);
    assert.ok(html.includes('href="https://www.ksenweb.com'+path+'"'),path);
    assert.doesNotMatch(html,/<meta name="robots" content="[^"]*noindex/);
    assert.ok(html.includes('href="/cases"'),path);
    const json=JSON.parse(html.match(/<script id="jsonld-server" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.deepEqual(json,servicePageSchema(path));
    assert.equal(json['@graph'].find(n=>n['@type']==='FAQPage').mainEntity.length,page.faq.length);
    const styles=[...html.matchAll(/rel="stylesheet"[^>]*?href="(\/assets\/[^"]+)"/g)];assert.ok(styles.length>=2,path);
    assert.ok(styles.some(([,href])=>href.includes('/ServiceProcess-')),`${path}: process styles must work without JavaScript`);
    for(const [,href] of styles)await readFile(buildDir+href);
   }
   for(const content of [xml,staticSitemap,llms])assert.ok(content.includes('https://www.ksenweb.com'+path),path);
  }
  for(const [from,to] of Object.entries(serviceRedirects)){
   const response=await middleware(new Request('https://www.ksenweb.com'+from+'?utm_source=test'));
   assert.equal(response.status,301);assert.equal(response.headers.get('location'),'https://www.ksenweb.com'+to+'?utm_source=test');
   assert.ok(!xml.includes('<loc>https://www.ksenweb.com'+from+'</loc>'));
  }
 } finally{globalThis.fetch=savedFetch;}
});

test('homepage links the website service to the consolidated Tilda page', async()=>{
 const html=await readFile(buildDir+'/_seo/home.html','utf8');
 const start=html.indexOf('id="service-card-01"');
 assert.ok(start>=0);
 const card=html.slice(start,html.indexOf('</article>',start));
 assert.match(card,/class="home-service-details"[^>]*href="\/services\/tilda"/);
 assert.doesNotMatch(card,/Сайты на Tilda|\/services\/websites/);
 assert.equal(servicePages['/services/websites'],undefined);
 assert.equal(serviceRedirects['/services/websites'],'/services/tilda');
});
