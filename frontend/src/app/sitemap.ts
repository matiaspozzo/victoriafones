import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getNeighborhoods, getProperties } from "@/lib/api";
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

type NeighborhoodNode = { slug: string; children?: NeighborhoodNode[] };

// Only leaf neighborhoods (no children) have their own /propiedades-en-venta|alquiler/{barrio}
// listing page — intermediate nodes like "José Ignacio" or "Punta del Este" are
// grouping labels only, never a property's direct neighborhood, so a listing
// page for one would always be empty and isn't linked from anywhere in the UI.
function leafSlugs(nodes: NeighborhoodNode[]): string[] {
  return nodes.flatMap((node) =>
    node.children && node.children.length > 0 ? leafSlugs(node.children) : [node.slug]
  );
}

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

  try {
    const { data: neighborhoods } = await getNeighborhoods("es");

    for (const slug of leafSlugs(neighborhoods)) {
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
  } catch {
    // Backend unreachable at build time — sitemap still includes everything else.
  }

  return entries;
}
