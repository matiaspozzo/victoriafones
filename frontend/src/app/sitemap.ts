import type { MetadataRoute } from "next";
import { ZONES } from "@/lib/zones";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProperties } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHNAMES = [
  "/",
  "/propiedades-en-venta",
  "/propiedades-en-alquiler",
  "/nuestras-propiedades",
  "/quienes-somos",
  "/contacto",
  "/mapa",
] as const;

const ZONE_LISTING_PATHNAMES = ["/propiedades-en-venta/[barrio]", "/propiedades-en-alquiler/[barrio]"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const pathname of STATIC_PATHNAMES) {
      entries.push({
        url: `${SITE_URL}${getPathname({ href: pathname, locale })}`,
        changeFrequency: pathname === "/" ? "daily" : "weekly",
        priority: pathname === "/" ? 1 : 0.7,
      });
    }
  }

  try {
    const { data: properties } = await getProperties("es", { per_page: "200" });

    for (const property of properties) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE_URL}${getPathname({
            href: { pathname: "/propiedades/[slug]", params: { slug: property.slug } },
            locale,
          })}`,
          changeFrequency: "weekly",
          priority: 0.9,
        });
      }
    }
  } catch {
    // Backend unreachable at build time — sitemap still includes static pages.
  }

  // Zone listing pages are the same fixed set the zone filter/nav dropdown
  // use (see ZONES), not derived from the neighborhood tree — that tree can
  // have deeper nodes (e.g. Alrededores' sub-zones) that are internal
  // tagging only and never got their own listing page or nav entry.
  for (const slug of ZONES) {
    for (const locale of routing.locales) {
      for (const pathname of ZONE_LISTING_PATHNAMES) {
        entries.push({
          url: `${SITE_URL}${getPathname({ href: { pathname, params: { barrio: slug } }, locale })}`,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
