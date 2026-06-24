import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

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
