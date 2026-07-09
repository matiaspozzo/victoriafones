import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function prefixFor(locale: string): string {
  if (locale === "en") return "/en";
  if (locale === "pt") return "/br";

  return "";
}

/**
 * Builds the `alternates.languages` map for Next.js Metadata given a
 * locale-agnostic pathname (e.g. "/propiedades-en-venta" or "/propiedades/leg8").
 */
export function buildAlternates(pathname: string) {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    languages[locale === "pt" ? "pt-BR" : locale] = `${SITE_URL}${prefixFor(locale)}${pathname}`;
  }

  languages["x-default"] = `${SITE_URL}${pathname}`;

  return languages;
}

export function canonicalFor(locale: string, pathname: string): string {
  return `${SITE_URL}${prefixFor(locale)}${pathname}`;
}

export { SITE_URL };
