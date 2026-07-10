import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyListingPage from "@/components/PropertyListingPage";
import { ALL_PROPERTIES_HERO } from "@/lib/heroes";
import { buildAlternates, canonicalFor } from "@/lib/seo";

const PATHNAME = "/nuestras-propiedades";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Listing" });

  return {
    title: `${t("allTitle")} | Victoria Fones Real Estate`,
    alternates: {
      canonical: canonicalFor(locale, PATHNAME),
      languages: buildAlternates(PATHNAME),
    },
  };
}

export default async function OurPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;

  return (
    <PropertyListingPage
      locale={locale}
      pageKey="nuestras-propiedades"
      heroImage={ALL_PROPERTIES_HERO}
      searchParams={searchParams}
    />
  );
}
