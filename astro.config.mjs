// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Apex, https. Every canonical, og:url, and sitemap entry derives from this
  // one value — there is no second place a host can drift (§11).
  site: 'https://envirotechidaho.com',
  // Trailing slashes on all URLs (§9).
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Conversion confirmations and anything noindexed stay out of the
      // sitemap — a sitemap is a list of pages we want indexed, not a
      // directory of every route that exists.
      filter: (page) => !['/thank-you/'].includes(new URL(page).pathname),
    }),
  ],
});
