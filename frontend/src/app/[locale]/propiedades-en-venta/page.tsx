import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyListingPage from "@/components/PropertyListingPage";
import { VENTA_HERO } from "@/lib/heroes";
import { buildAlternates, canonicalFor } from "@/lib/seo";

const PATHNAME = "/propiedades-en-venta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Listing" });

  return {
    title: `${t("saleTitle")} | Victoria Fones Real Estate`,
    alternates: {
      canonical: canonicalFor(locale, PATHNAME),
      languages: buildAlternates(PATHNAME),
    },
  };
}

export default async function SalesPage({
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
      operation="sale"
      pageKey="venta"
      heroImage={VENTA_HERO}
      searchParams={searchParams}
    />
  );
}
