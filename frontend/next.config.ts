import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Legacy WordPress URLs → new short equivalents, per locale.
 * Source: https://www.victoriafones.com/{page,zona}-sitemap.xml (fetched 2026-07-04).
 * The old site nests category archives 3-4 levels deep
 * (/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-pueblo/);
 * the new site flattens these to /propiedades-en-venta/{barrio} and /propiedades-en-alquiler/{barrio}.
 */
const legacyRedirects: Array<{ source: string; destination: string }> = [
  // --- ES (default, no prefix) ---
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-pueblo", destination: "/propiedades-en-venta/pueblo" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-club-de-mar", destination: "/propiedades-en-venta/club-de-mar" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-pinar-del-faro", destination: "/propiedades-en-venta/pinar-del-faro" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-laguna-escondida", destination: "/propiedades-en-venta/laguna-escondida" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-alrededores-de-jose-ignacio", destination: "/propiedades-en-venta/alrededores" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio", destination: "/propiedades-en-venta/jose-ignacio" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-otras-zonas-de-punta-del-este", destination: "/propiedades-en-venta/otras-zonas" },
  { source: "/propiedades-en-venta/punta-del-este", destination: "/propiedades-en-venta" },

  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-pueblo", destination: "/propiedades-en-alquiler/pueblo" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-club-de-mar", destination: "/propiedades-en-alquiler/club-de-mar" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-pinar-del-faro", destination: "/propiedades-en-alquiler/pinar-del-faro" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-laguna-escondida", destination: "/propiedades-en-alquiler/laguna-escondida" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-alrededores-de-jose-ignacio", destination: "/propiedades-en-alquiler/alrededores" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio", destination: "/propiedades-en-alquiler/jose-ignacio" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-otras-zonas-de-punta-del-este", destination: "/propiedades-en-alquiler/otras-zonas" },
  { source: "/propiedades-en-alquiler/punta-del-este", destination: "/propiedades-en-alquiler" },

  { source: "/nuestras-propiedades/punta-del-este/propiedades-en-jose-ignacio", destination: "/nuestras-propiedades" },
  { source: "/nuestras-propiedades/punta-del-este/propiedades-en-otras-zonas-de-punta-del-este", destination: "/nuestras-propiedades" },
  { source: "/nuestras-propiedades/punta-del-este", destination: "/nuestras-propiedades" },

  // --- EN (/en prefix) ---
  // Segment words below (properties-for-sale, about-us, etc.) are the real
  // pre-migration WP English slugs (verified against its sitemap, see the
  // header comment) — since routing.ts's `pathnames` now translates every
  // page's URL per locale instead of keeping every segment in Spanish, these
  // ARE the site's real English paths again (see routing.ts's comment for
  // why), so the old one-off redirects that used to point them at the
  // Spanish-segment path have been removed; only the deeper nested
  // zone-archive URLs (which don't correspond to a real page at all) still
  // need a rewrite, now pointing at the new English zone path instead.
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-town", destination: "/en/properties-for-sale/pueblo" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-club-de-mar", destination: "/en/properties-for-sale/club-de-mar" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-pinar-del-faro", destination: "/en/properties-for-sale/pinar-del-faro" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-laguna-escondida", destination: "/en/properties-for-sale/laguna-escondida" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-the-surroundings-of-jose-ignacio", destination: "/en/properties-for-sale/alrededores" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio", destination: "/en/properties-for-sale/jose-ignacio" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-other-areas-of-punta-del-este", destination: "/en/properties-for-sale/otras-zonas" },
  { source: "/en/properties-for-sale/punta-del-este", destination: "/en/properties-for-sale" },

  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-town", destination: "/en/properties-for-rent/pueblo" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-club-de-mar", destination: "/en/properties-for-rent/club-de-mar" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-pinar-del-faro", destination: "/en/properties-for-rent/pinar-del-faro" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-laguna-escondida", destination: "/en/properties-for-rent/laguna-escondida" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-the-surroundings-of-jose-ignacio", destination: "/en/properties-for-rent/alrededores" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio", destination: "/en/properties-for-rent/jose-ignacio" },
  { source: "/en/properties-for-rent/punta-del-este", destination: "/en/properties-for-rent" },

  { source: "/en/our-properties/punta-del-este/properties-in-jose-ignacio", destination: "/en/our-properties" },
  { source: "/en/our-properties/punta-del-este/properties-in-other-areas-of-punta-del-este", destination: "/en/our-properties" },
  { source: "/en/our-properties/punta-del-este", destination: "/en/our-properties" },

  // Current site's own Spanish-segment English URLs (live since the
  // 2026-08-15 launch, before routing.ts's `pathnames` translated these) —
  // real indexed/shared links, not just a historical WP artifact.
  { source: "/en/propiedades-en-venta/:barrio", destination: "/en/properties-for-sale/:barrio" },
  { source: "/en/propiedades-en-venta", destination: "/en/properties-for-sale" },
  { source: "/en/propiedades-en-alquiler/:barrio", destination: "/en/properties-for-rent/:barrio" },
  { source: "/en/propiedades-en-alquiler", destination: "/en/properties-for-rent" },
  { source: "/en/nuestras-propiedades", destination: "/en/our-properties" },
  { source: "/en/propiedades/:slug", destination: "/en/properties/:slug" },
  { source: "/en/quienes-somos", destination: "/en/about-us" },
  { source: "/en/contacto", destination: "/en/contact" },
  { source: "/en/mapa", destination: "/en/map" },

  // --- PT/BR (/br prefix) ---
  // "sale" and "rent" get NEW Portuguese translations here (imoveis-a-venda,
  // imoveis-para-alugar) — the old WP site left "sale" under /br using the
  // Spanish "propiedades-en-venta" slug (a WPML translation gap, not a real
  // Portuguese phrase) and "rent"'s old slug (propriedades-para-aluguel)
  // wasn't reused either, for consistency with the new "imoveis-*" pattern.
  // "our-properties"/"about-us"/"contact" reuse the old site's real
  // Portuguese slugs (nossas-propriedades, sobre-nos, contato) — those ARE
  // now the live pathnames.pt values in routing.ts, so the redirects that
  // used to point them at the Spanish-segment path have been removed.
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-na-cidade", destination: "/br/imoveis-a-venda/pueblo" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-em-club-de-mar", destination: "/br/imoveis-a-venda/club-de-mar" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-em-pinar-del-faro", destination: "/br/imoveis-a-venda/pinar-del-faro" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-em-laguna-escondida", destination: "/br/imoveis-a-venda/laguna-escondida" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-nos-arredores-de-jose-ignacio", destination: "/br/imoveis-a-venda/alrededores" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio", destination: "/br/imoveis-a-venda/jose-ignacio" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-outras-areas-de-punta-del-este", destination: "/br/imoveis-a-venda/otras-zonas" },
  { source: "/br/propiedades-en-venta/punta-del-este", destination: "/br/imoveis-a-venda" },
  { source: "/br/propiedades-en-venta/:barrio", destination: "/br/imoveis-a-venda/:barrio" },
  { source: "/br/propiedades-en-venta", destination: "/br/imoveis-a-venda" },

  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-na-cidade", destination: "/br/imoveis-para-alugar/pueblo" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-no-club-de-mar", destination: "/br/imoveis-para-alugar/club-de-mar" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-em-pinar-del-faro", destination: "/br/imoveis-para-alugar/pinar-del-faro" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-em-laguna-escondida", destination: "/br/imoveis-para-alugar/laguna-escondida" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-nos-arredores-de-jose-ignacio", destination: "/br/imoveis-para-alugar/alrededores" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio", destination: "/br/imoveis-para-alugar/jose-ignacio" },
  { source: "/br/propriedades-para-aluguel/punta-del-este", destination: "/br/imoveis-para-alugar" },
  { source: "/br/propriedades-para-aluguel", destination: "/br/imoveis-para-alugar" },
  { source: "/br/propiedades-en-alquiler/:barrio", destination: "/br/imoveis-para-alugar/:barrio" },
  { source: "/br/propiedades-en-alquiler", destination: "/br/imoveis-para-alugar" },

  { source: "/br/nossas-propriedades/punta-del-este/propriedades-em-jose-ignacio", destination: "/br/nossas-propriedades" },
  { source: "/br/nossas-propriedades/punta-del-este/propriedades-em-outras-areas-de-punta-del-este", destination: "/br/nossas-propriedades" },
  { source: "/br/nossas-propriedades/punta-del-este", destination: "/br/nossas-propriedades" },
  { source: "/br/nuestras-propiedades", destination: "/br/nossas-propriedades" },

  { source: "/br/propiedades/:slug", destination: "/br/imoveis/:slug" },
  { source: "/br/quienes-somos", destination: "/br/sobre-nos" },
  { source: "/br/contacto", destination: "/br/contato" },

  // --- Flat taxonomy archives (tipo-de-operacion-sitemap.xml, tipo-de-propiedad-
  // sitemap.xml, zona-sitemap.xml) — only indexed in `es`, no /en or /br versions
  // existed on the live site for these. Zone slugs reuse the exact mapping
  // `import:wordpress` uses (backend/app/Console/Commands/ImportWordpress.php's
  // NEIGHBORHOOD_MAP/CATCH_ALL_NEIGHBORHOOD): known sub-zones map directly,
  // the generic "jose-ignacio" tag defaults to the town, and unrecognized/
  // discontinued zones (chacras, la-barra, la-juanita, manantiales, santa-monica —
  // not part of the new site's simplified neighborhood tree) fall back to
  // "otras-zonas" rather than 404ing.
  { source: "/tipo-de-operacion/venta", destination: "/propiedades-en-venta" },
  { source: "/tipo-de-operacion/alquiler", destination: "/propiedades-en-alquiler" },

  { source: "/tipo-de-propiedad/casa", destination: "/nuestras-propiedades?type=house" },
  { source: "/tipo-de-propiedad/casas", destination: "/nuestras-propiedades?type=house" },
  { source: "/tipo-de-propiedad/departamento", destination: "/nuestras-propiedades?type=apartment" },
  { source: "/tipo-de-propiedad/departamentos", destination: "/nuestras-propiedades?type=apartment" },
  { source: "/tipo-de-propiedad/terreno", destination: "/nuestras-propiedades?type=land" },
  { source: "/tipo-de-propiedad/terrenos", destination: "/nuestras-propiedades?type=land" },
  { source: "/tipo-de-propiedad/chacras", destination: "/nuestras-propiedades?type=chacra" },

  { source: "/zona/pueblo", destination: "/nuestras-propiedades?zona=pueblo-jose-ignacio" },
  { source: "/zona/club-de-mar", destination: "/nuestras-propiedades?zona=club-de-mar" },
  { source: "/zona/pinar-del-faro", destination: "/nuestras-propiedades?zona=pinar-del-faro" },
  { source: "/zona/laguna-escondida", destination: "/nuestras-propiedades?zona=laguna-escondida" },
  { source: "/zona/alderedores-de-jose-ignacio", destination: "/nuestras-propiedades?zona=alrededores" },
  { source: "/zona/jose-ignacio", destination: "/nuestras-propiedades?zona=pueblo-jose-ignacio" },
  { source: "/zona/otra-zona", destination: "/nuestras-propiedades?zona=otras-zonas" },
  { source: "/zona/chacras", destination: "/nuestras-propiedades?zona=otras-zonas" },
  { source: "/zona/la-barra", destination: "/nuestras-propiedades?zona=otras-zonas" },
  { source: "/zona/la-juanita", destination: "/nuestras-propiedades?zona=otras-zonas" },
  { source: "/zona/manantiales", destination: "/nuestras-propiedades?zona=otras-zonas" },
  { source: "/zona/santa-monica", destination: "/nuestras-propiedades?zona=otras-zonas" },
];

// Property photos are served by the Laravel backend (Spatie Media Library),
// at whatever host NEXT_PUBLIC_API_URL points to — next/image refuses to
// load images from hosts not explicitly whitelisted here, so derive the
// production pattern from the same env var instead of hardcoding a domain.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL) : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      ...(apiUrl && apiUrl.hostname !== "localhost"
        ? [
            {
              protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
              hostname: apiUrl.hostname,
            },
          ]
        : []),
    ],
  },
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
};

export default withNextIntl(nextConfig);
