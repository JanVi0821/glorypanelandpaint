// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://glorypanelandpaint.jan0821.com',
	integrations: [react(), sitemap()],
	vite: {
		resolve: {
			dedupe: ['react', 'react-dom'],
		},
		optimizeDeps: {
			include: ['react', 'react-dom', 'react/jsx-dev-runtime', 'react/jsx-runtime'],
		},
	},
	// 301 redirects live in public/_redirects (Cloudflare Pages).
	// Re-enable astro.config redirects once all target pages exist.
});
