import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Render the existing components: no separate SEO copy or changes to page text.
await build({ configFile: false, plugins: [react()], logLevel: 'error',
  build: { ssr: 'src/entry-prerender.jsx', outDir: 'scratch/ssr', emptyOutDir: true },
});
{
  const { render } = await import(pathToFileURL(resolve('scratch/ssr/entry-prerender.js')));
  const shell = await readFile('dist/index.html', 'utf8');
  await mkdir('dist/_seo', { recursive: true });
  const pages = [
    ['/', 'home', 'Ксения Матвеенко — Разработка сайтов и веб-приложений'],
    ['/brief', 'brief', 'Интерактивный бриф | Матвеенко Ксения'],
    ['/privacy-policy', 'privacy-policy', 'Политика конфиденциальности | Матвеенко Ксения Александровна'],
    ['/terms', 'terms', 'Пользовательское соглашение | Правила использования сайта'],
  ];
  const descriptions = {
    '/brief': 'Пошаговый бриф на разработку сайта, UX/UI-дизайна или веб-приложения.',
    '/privacy-policy': 'Политика обработки и защиты персональных данных на сайте KSENWEB.',
    '/terms': 'Пользовательское соглашение и правила использования сайта KSENWEB.',
  };
  for (const [path, file, title] of pages) {
    const body = await render(path);
    const canonical = `https://www.ksenweb.com${path}`;
    const html = shell
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
      .replace(/(<link rel="canonical" href=")[^"]+/, `$1${canonical}`)
      .replace(/(<meta property="og:url" content=")[^"]+/, `$1${canonical}`)
      .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]+/g, `$1${title}`)
      .replace('</head>', '<noscript><style>#root [style] { opacity:1!important; transform:none!important; filter:none!important; }</style></noscript></head>');
    // The homepage entity graph must not describe legal/utility pages.
    let result = path === '/' ? html : html
      .replace(/<script id="jsonld-static-site"[\s\S]*?<\/script>/, '')
      .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description")\s+content=")[^"]+/g, `$1${descriptions[path]}`);
    if (path !== '/') {
      const graph = { '@context': 'https://schema.org', '@graph': [
        { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title,
          description: descriptions[path], inLanguage: 'ru', isPartOf: { '@id': 'https://www.ksenweb.com/#website' } },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://www.ksenweb.com/' },
          { '@type': 'ListItem', position: 2, name: title, item: canonical },
        ] },
      ] };
      result = result.replace('</head>', `<script id="jsonld-server" type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script></head>`);
    }
    await writeFile(`dist/_seo/${file}.html`, result);
    console.log(`Prerendered ${path}: ${Buffer.byteLength(result)} bytes`);
  }
}
