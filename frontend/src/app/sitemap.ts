import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProperties } from "@/lib/api";
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

  return entries;
}
