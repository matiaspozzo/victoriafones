import type { MetadataRoute } from "next";
import { ZONES } from "@/lib/zones";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getDevelopments, getProperties } from "@/lib/api";
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
          ...(property.updated_at ? { lastModified: new Date(property.updated_at) } : {}),
        });
      }
    }
  } catch {
    // Backend unreachable at build time — sitemap still includes static pages.
  }

  try {
    const { data: developments } = await getDevelopments("es");

    if (developments.length > 0) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE_URL}${getPathname({ href: "/desarrollos", locale })}`,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }

    for (const development of developments) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE_URL}${getPathname({
            href: { pathname: "/desarrollos/[slug]", params: { slug: development.slug } },
            locale,
          })}`,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // Same as above: backend unreachable at build time.
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
