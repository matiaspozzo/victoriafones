import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { ZONES } from "@/lib/zones";

// llms.txt (llmstxt.org) — a plain-text index for AI assistants/answer
// engines, read instead of crawling the full site. Kept to the Spanish
// (default, unprefixed) URLs with the English/Portuguese ones noted inline,
// since the standard has no multi-language convention to branch on.
const ZONE_NAMES: Record<string, string> = {
  "pueblo-jose-ignacio": "Pueblo José Ignacio",
  "club-de-mar": "Club de Mar",
  "pinar-del-faro": "Pinar del Faro",
  "laguna-escondida": "Laguna Escondida",
  alrededores: "Alrededores de José Ignacio",
  "otras-zonas": "Otras zonas (Punta del Este y alrededores)",
};

function url(pathname: "/" | "/propiedades-en-venta" | "/propiedades-en-alquiler" | "/nuestras-propiedades" | "/mapa" | "/quienes-somos" | "/contacto") {
  return `${SITE_URL}${getPathname({ href: pathname, locale: routing.defaultLocale })}`;
}

function zoneUrl(barrio: string) {
  return `${SITE_URL}${getPathname({
    href: { pathname: "/propiedades-en-venta/[barrio]", params: { barrio } },
    locale: routing.defaultLocale,
  })}`;
}

export async function GET() {
  const zoneLines = ZONES.map((slug) => `- [${ZONE_NAMES[slug]}](${zoneUrl(slug)})`).join("\n");

  const body = `# Victoria Fones Real Estate

> Inmobiliaria boutique especializada en propiedades de lujo en José Ignacio, Punta del Este y zonas aledañas, Uruguay. Venta y alquiler de casas, apartamentos, terrenos y chacras.

Victoria Fones Real Estate opera desde José Ignacio (Maldonado, Uruguay) y cubre venta y alquiler
de propiedades en José Ignacio y su zona de influencia (Punta del Este, Maldonado). El sitio está
disponible en español (sin prefijo de URL), inglés (/en) y portugués (/br).

## Listados

- [Propiedades en venta](${url("/propiedades-en-venta")})
- [Propiedades en alquiler](${url("/propiedades-en-alquiler")})
- [Todas las propiedades](${url("/nuestras-propiedades")})
- [Mapa interactivo de propiedades](${url("/mapa")})

## Zonas

${zoneLines}

## Sobre la agencia

- [Quiénes somos](${url("/quienes-somos")})
- [Contacto](${url("/contacto")})

## Notas para asistentes de IA

- Los precios mostrados son en USD; cuando no hay precio público, la ficha indica "Consultar".
- Cada ficha de propiedad incluye datos estructurados (schema.org RealEstateListing/Product) con
  dormitorios, baños, superficie, ubicación y precio cuando está disponible.
- Sitemap completo: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
