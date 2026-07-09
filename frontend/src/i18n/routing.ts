import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  localePrefix: {
    mode: 'as-needed',
    prefixes: {
      en: '/en',
      pt: '/br',
    },
  },
});

export type Locale = (typeof routing.locales)[number];
