import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * Builds the `alternates.languages` map for Next.js Metadata given a
 * next-intl href — a canonical pathname (e.g. "/quienes-somos") or, for a
 * dynamic route, `{ pathname: "/propiedades/[slug]", params: { slug } }`.
 * Resolves each locale's own translated URL segment (routing.ts's
 * `pathnames`), not just the same path with a different prefix.
 */
export function buildAlternates(href: Href) {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    languages[locale === "pt" ? "pt-BR" : locale] = `${SITE_URL}${getPathname({ href, locale })}`;
  }

  languages["x-default"] = `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`;

  return languages;
}

export function canonicalFor(locale: string, href: Href): string {
  return `${SITE_URL}${getPathname({ href, locale: locale as Locale })}`;
}

export { SITE_URL };
