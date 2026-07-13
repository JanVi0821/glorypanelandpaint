// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Paths excluded from sitemap (noindexed / utility pages). */
const SITEMAP_EXCLUDED_PATHS = [
  '/book-appointment/',
  '/book-cancel/',
  '/404',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://glorypanelandpaint.co.nz',
  integrations: [
    react(),
    sitemap({
      // Keep noindexed / utility pages out of the sitemap
      filter: (page) => !SITEMAP_EXCLUDED_PATHS.some((path) => page.includes(path)),
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-dev-runtime', 'react/jsx-runtime'],
    },
  },
  // 301 redirects live in public/_redirects (Cloudflare Pages).
  // Re-enable astro.config redirects once all target pages exist.
});
