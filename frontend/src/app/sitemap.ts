import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getNeighborhoods, getProperties } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHS = [
  "",
  "/propiedades-en-venta",
  "/propiedades-en-alquiler",
  "/nuestras-propiedades",
  "/quienes-somos",
  "/contacto",
  "/mapa",
];

function prefixFor(locale: string): string {
  if (locale === "en") return "/en";
  if (locale === "pt") return "/br";

  return "";
}

type NeighborhoodNode = { slug: string; children?: NeighborhoodNode[] };

// Only leaf neighborhoods (no children) have their own /venta|alquiler/{barrio}
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
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${SITE_URL}${prefixFor(locale)}${path}`,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  try {
    const { data: properties } = await getProperties("es", { per_page: "200" });

    for (const property of properties) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE_URL}${prefixFor(locale)}/propiedades/${property.slug}`,
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
        for (const pageKey of ["venta", "alquiler"]) {
          entries.push({
            url: `${SITE_URL}${prefixFor(locale)}/${pageKey}/${slug}`,
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
