import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Legacy WordPress URLs → new short equivalents, per locale.
 * Source: https://www.victoriafones.com/{page,zona}-sitemap.xml (fetched 2026-07-04).
 * The old site nests category archives 3-4 levels deep
 * (/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-pueblo/);
 * the new site flattens these to /venta/{barrio} and /alquiler/{barrio}.
 */
const legacyRedirects: Array<{ source: string; destination: string }> = [
  // --- ES (default, no prefix) ---
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-pueblo", destination: "/venta/pueblo" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-club-de-mar", destination: "/venta/club-de-mar" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-pinar-del-faro", destination: "/venta/pinar-del-faro" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-laguna-escondida", destination: "/venta/laguna-escondida" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-alrededores-de-jose-ignacio", destination: "/venta/alrededores" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio", destination: "/venta/jose-ignacio" },
  { source: "/propiedades-en-venta/punta-del-este/propiedades-en-otras-zonas-de-punta-del-este", destination: "/venta/otras-zonas" },
  { source: "/propiedades-en-venta/punta-del-este", destination: "/propiedades-en-venta" },

  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-pueblo", destination: "/alquiler/pueblo" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-club-de-mar", destination: "/alquiler/club-de-mar" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-pinar-del-faro", destination: "/alquiler/pinar-del-faro" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-laguna-escondida", destination: "/alquiler/laguna-escondida" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio/propiedades-en-alquiler-en-alrededores-de-jose-ignacio", destination: "/alquiler/alrededores" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-alquiler-en-jose-ignacio", destination: "/alquiler/jose-ignacio" },
  { source: "/propiedades-en-alquiler/punta-del-este/propiedades-en-otras-zonas-de-punta-del-este", destination: "/alquiler/otras-zonas" },
  { source: "/propiedades-en-alquiler/punta-del-este", destination: "/propiedades-en-alquiler" },

  { source: "/nuestras-propiedades/punta-del-este/propiedades-en-jose-ignacio", destination: "/nuestras-propiedades" },
  { source: "/nuestras-propiedades/punta-del-este/propiedades-en-otras-zonas-de-punta-del-este", destination: "/nuestras-propiedades" },
  { source: "/nuestras-propiedades/punta-del-este", destination: "/nuestras-propiedades" },

  // --- EN (/en prefix) ---
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-town", destination: "/en/venta/pueblo" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-club-de-mar", destination: "/en/venta/club-de-mar" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-pinar-del-faro", destination: "/en/venta/pinar-del-faro" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-laguna-escondida", destination: "/en/venta/laguna-escondida" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio/properties-for-sale-in-the-surroundings-of-jose-ignacio", destination: "/en/venta/alrededores" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-jose-ignacio", destination: "/en/venta/jose-ignacio" },
  { source: "/en/properties-for-sale/punta-del-este/properties-for-sale-in-other-areas-of-punta-del-este", destination: "/en/venta/otras-zonas" },
  { source: "/en/properties-for-sale/punta-del-este", destination: "/en/propiedades-en-venta" },
  { source: "/en/properties-for-sale", destination: "/en/propiedades-en-venta" },

  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-town", destination: "/en/alquiler/pueblo" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-club-de-mar", destination: "/en/alquiler/club-de-mar" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-pinar-del-faro", destination: "/en/alquiler/pinar-del-faro" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-laguna-escondida", destination: "/en/alquiler/laguna-escondida" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio/properties-for-rent-in-the-surroundings-of-jose-ignacio", destination: "/en/alquiler/alrededores" },
  { source: "/en/properties-for-rent/punta-del-este/properties-for-rent-in-jose-ignacio", destination: "/en/alquiler/jose-ignacio" },
  { source: "/en/properties-for-rent/punta-del-este", destination: "/en/propiedades-en-alquiler" },
  { source: "/en/properties-for-rent", destination: "/en/propiedades-en-alquiler" },

  { source: "/en/our-properties/punta-del-este/properties-in-jose-ignacio", destination: "/en/nuestras-propiedades" },
  { source: "/en/our-properties/punta-del-este/properties-in-other-areas-of-punta-del-este", destination: "/en/nuestras-propiedades" },
  { source: "/en/our-properties/punta-del-este", destination: "/en/nuestras-propiedades" },
  { source: "/en/our-properties", destination: "/en/nuestras-propiedades" },

  { source: "/en/about-us", destination: "/en/quienes-somos" },
  { source: "/en/contact", destination: "/en/contacto" },

  // --- PT/BR (/br prefix) ---
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-na-cidade", destination: "/br/venta/pueblo" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-em-club-de-mar", destination: "/br/venta/club-de-mar" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-em-pinar-del-faro", destination: "/br/venta/pinar-del-faro" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-em-laguna-escondida", destination: "/br/venta/laguna-escondida" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio/propriedades-a-venda-nos-arredores-de-jose-ignacio", destination: "/br/venta/alrededores" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-jose-ignacio", destination: "/br/venta/jose-ignacio" },
  { source: "/br/propiedades-en-venta/punta-del-este/propriedades-a-venda-em-outras-areas-de-punta-del-este", destination: "/br/venta/otras-zonas" },
  { source: "/br/propiedades-en-venta/punta-del-este", destination: "/br/propiedades-en-venta" },

  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-na-cidade", destination: "/br/alquiler/pueblo" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-no-club-de-mar", destination: "/br/alquiler/club-de-mar" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-em-pinar-del-faro", destination: "/br/alquiler/pinar-del-faro" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-em-laguna-escondida", destination: "/br/alquiler/laguna-escondida" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio/propriedades-para-alugar-nos-arredores-de-jose-ignacio", destination: "/br/alquiler/alrededores" },
  { source: "/br/propriedades-para-aluguel/punta-del-este/propriedades-para-alugar-em-jose-ignacio", destination: "/br/alquiler/jose-ignacio" },
  { source: "/br/propriedades-para-aluguel/punta-del-este", destination: "/br/propiedades-en-alquiler" },
  { source: "/br/propriedades-para-aluguel", destination: "/br/propiedades-en-alquiler" },

  { source: "/br/nossas-propriedades/punta-del-este/propriedades-em-jose-ignacio", destination: "/br/nuestras-propiedades" },
  { source: "/br/nossas-propriedades/punta-del-este/propriedades-em-outras-areas-de-punta-del-este", destination: "/br/nuestras-propiedades" },
  { source: "/br/nossas-propriedades/punta-del-este", destination: "/br/nuestras-propiedades" },
  { source: "/br/nossas-propriedades", destination: "/br/nuestras-propiedades" },

  { source: "/br/sobre-nos", destination: "/br/quienes-somos" },
  { source: "/br/contato", destination: "/br/contacto" },
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
