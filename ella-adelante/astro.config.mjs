// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Update this to the production domain before launch.
const SITE = 'https://ellaadelante.netlify.app';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Allow remote hero images (e.g. seeded Unsplash placeholders) through
    // Astro's <Image> optimizer. Replace/extend with the real CDN at launch.
    domains: ['images.unsplash.com'],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
