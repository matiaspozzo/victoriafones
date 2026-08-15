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
  const href = { pathname: "/propiedades-en-venta/[barrio]", params: { barrio } } as const;
  const zoneName = tZones.has(barrio) ? tZones(barrio) : undefined;

  const { data: neighborhoods } = await getNeighborhoods(locale).catch(() => ({ data: [] }));
  const neighborhood = findNeighborhoodBySlug(neighborhoods, barrio);

  const title = neighborhood?.seo_title
    ? `${neighborhood.seo_title} - Victoria Fones Real Estate`
    : zoneName
      ? t("saleMetaTitle", { zone: zoneName })
      : `${t("saleTitle")} | Victoria Fones Real Estate`;
  const description = neighborhood?.seo_description ?? undefined;

  return {
    title,
    // Omit the key entirely rather than passing description: undefined — Next
    // treats an explicitly-present-but-undefined field as "this page has no
    // description" (blocking inheritance from the root layout's), not as
    // "unset, inherit from parent". Zones without a custom SEO description
    // would otherwise render with none at all instead of falling back.
    ...(description ? { description } : {}),
    alternates: {
      canonical: canonicalFor(locale, href),
      languages: buildAlternates(href),
    },
    ...(neighborhood?.og_image
      ? { openGraph: { title, description, images: [neighborhood.og_image] } }
      : {}),
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
      navbarStyleOverride={neighborhood?.navbar_style}
      titleOverride={zoneName ? tListing("saleInZone", { zone: zoneName }) : undefined}
      subtitleOverride=""
      neighborhoodDescription={neighborhood?.description ?? undefined}
      searchParams={searchParams}
    />
  );
}
