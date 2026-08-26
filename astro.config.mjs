// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://envirotechidaho.com',
  // Trailing slashes on all URLs (§9).
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
