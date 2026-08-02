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
  // Without this, next-intl redirects unprefixed URLs based on the visitor's
  // Accept-Language header — a Uruguayan real-estate site should keep
  // /propiedades-en-venta in Spanish regardless of browser language (see
  // CLAUDE.md: "Español es el default y va SIN prefijo"). Left on, it was
  // silently bouncing es-URL visitors to /en, costing an extra redirect
  // round-trip (~600ms LCP hit, confirmed via Lighthouse) and disabling
  // back/forward cache on every page.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
