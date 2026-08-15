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
  // With localeDetection already off, the only thing this cookie was doing
  // was getting set (Set-Cookie: NEXT_LOCALE) on every single response.
  // Chrome won't bfcache a page whose response both sets a cookie and is
  // Cache-Control: no-store (which every page here is, since the app is
  // fully dynamic) — confirmed via Lighthouse's bf-cache audit
  // (CacheControlNoStoreCookieModified). No code in this app reads
  // NEXT_LOCALE itself; the actual locale always comes from the URL prefix.
  localeCookie: false,
  // Translates each page's URL segment per locale (e.g. /mapa -> /en/map),
  // instead of only swapping the /en, /br prefix and keeping every segment
  // in Spanish. Keys are the canonical (Spanish/internal) path — matching
  // the actual app/[locale]/... folder names — used as the `href` passed to
  // <Link>/redirect/getPathname everywhere in the codebase; next-intl
  // resolves it to the right localized URL for the active locale, so call
  // sites don't need to know about this map.
  //
  // en/*: verified against the pre-migration WordPress site's real indexed
  // URLs (see next.config.ts's legacyRedirects source comment, fetched from
  // its live sitemap 2026-07-04) — properties-for-sale, properties-for-rent,
  // our-properties, about-us, contact. pt/*: sobre-nos, contato and
  // nossas-propriedades match the old site too; imoveis-a-venda,
  // imoveis-para-alugar and imoveis are NEW translations — the old WP site
  // left "sale" under /br using the Spanish "propiedades-en-venta" slug
  // (a WPML translation gap) and had no /mapa equivalent at all, so there
  // was nothing correct to preserve for those. Old URLs (Spanish segments
  // under /en, /br — live since this site's 2026-08-15 launch, and the
  // pre-migration WPML gap under /br) both redirect to these via
  // next.config.ts rather than being silently dropped.
  pathnames: {
    '/': '/',
    '/propiedades-en-venta': {
      en: '/properties-for-sale',
      pt: '/imoveis-a-venda',
    },
    '/propiedades-en-venta/[barrio]': {
      en: '/properties-for-sale/[barrio]',
      pt: '/imoveis-a-venda/[barrio]',
    },
    '/propiedades-en-alquiler': {
      en: '/properties-for-rent',
      pt: '/imoveis-para-alugar',
    },
    '/propiedades-en-alquiler/[barrio]': {
      en: '/properties-for-rent/[barrio]',
      pt: '/imoveis-para-alugar/[barrio]',
    },
    '/nuestras-propiedades': {
      en: '/our-properties',
      pt: '/nossas-propriedades',
    },
    '/propiedades/[slug]': {
      en: '/properties/[slug]',
      pt: '/imoveis/[slug]',
    },
    '/quienes-somos': {
      en: '/about-us',
      pt: '/sobre-nos',
    },
    '/contacto': {
      en: '/contact',
      pt: '/contato',
    },
    '/mapa': {
      en: '/map',
      pt: '/mapa',
    },
  },
});

export type Locale = (typeof routing.locales)[number];
