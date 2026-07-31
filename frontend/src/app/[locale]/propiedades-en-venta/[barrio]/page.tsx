import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyListingPage from "@/components/PropertyListingPage";
import { ventaZoneHero } from "@/lib/heroes";
import { buildAlternates, canonicalFor } from "@/lib/seo";

type MetaProps = {
  params: Promise<{ locale: string; barrio: string }>;
};

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale, barrio } = await params;
  const t = await getTranslations({ locale, namespace: "Listing" });
  const tZones = await getTranslations({ locale, namespace: "Zones" });
  const pathname = `/venta/${barrio}`;
  const zoneName = tZones.has(barrio) ? tZones(barrio) : undefined;

  return {
    title: `${t("saleTitle")}${zoneName ? ` — ${zoneName}` : ""} | Victoria Fones Real Estate`,
    alternates: {
      canonical: canonicalFor(locale, pathname),
      languages: buildAlternates(pathname),
    },
  };
}

export default async function SalesByNeighborhoodPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; barrio: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale, barrio } = await params;
  const t = await getTranslations({ locale, namespace: "Zones" });
  const zoneName = t.has(barrio) ? t(barrio) : undefined;

  return (
    <PropertyListingPage
      locale={locale}
      operation="sale"
      neighborhood={barrio}
      pageKey="venta"
      heroImage={ventaZoneHero(barrio)}
      subtitleOverride={zoneName}
      searchParams={searchParams}
    />
  );
}
