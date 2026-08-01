import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyListingPage from "@/components/PropertyListingPage";
import { findNeighborhoodBySlug, getNeighborhoods } from "@/lib/api";
import { ventaZoneHero } from "@/lib/heroes";
import { buildAlternates, canonicalFor } from "@/lib/seo";

type MetaProps = {
  params: Promise<{ locale: string; barrio: string }>;
};

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale, barrio } = await params;
  const t = await getTranslations({ locale, namespace: "Listing" });
  const tZones = await getTranslations({ locale, namespace: "Zones" });
  const pathname = `/propiedades-en-venta/${barrio}`;
  const zoneName = tZones.has(barrio) ? tZones(barrio) : undefined;

  return {
    title: zoneName
      ? t("saleMetaTitle", { zone: zoneName })
      : `${t("saleTitle")} | Victoria Fones Real Estate`,
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
  const tZones = await getTranslations({ locale, namespace: "Zones" });
  const tListing = await getTranslations({ locale, namespace: "Listing" });
  const zoneName = tZones.has(barrio) ? tZones(barrio) : undefined;

  const { data: neighborhoods } = await getNeighborhoods(locale).catch(() => ({ data: [] }));
  const neighborhood = findNeighborhoodBySlug(neighborhoods, barrio);

  return (
    <PropertyListingPage
      locale={locale}
      operation="sale"
      neighborhood={barrio}
      pageKey="venta"
      heroImage={ventaZoneHero(barrio)}
      heroImageOverride={{
        desktop: neighborhood?.hero_image.desktop ?? ventaZoneHero(barrio),
        mobile: neighborhood?.hero_image.mobile ?? ventaZoneHero(barrio),
      }}
      titleOverride={zoneName ? tListing("saleInZone", { zone: zoneName }) : undefined}
      subtitleOverride=""
      neighborhoodDescription={neighborhood?.description ?? undefined}
      searchParams={searchParams}
    />
  );
}
