import { build } from 'vite';

// Middleware cannot load the Node/CommonJS dependency graph at invocation time.
// Keep a self-contained browser-compatible module for the routing runtime.
await build({
  configFile: false,
  publicDir: false,
  build: {
    lib: { entry: 'src/utils/safeArticleHtml.js', formats: ['es'], fileName: () => 'safeArticleHtml.js' },
    outDir: 'server/vendor',
    emptyOutDir: false,
    minify: true,
  },
});
