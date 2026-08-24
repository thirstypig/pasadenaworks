import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pasadenaworks.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
          'zh-hans': 'zh-Hans',
          'zh-hant': 'zh-Hant',
        },
      },
    }),
  ],
});
