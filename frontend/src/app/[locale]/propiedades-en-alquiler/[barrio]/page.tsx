import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyListingPage from "@/components/PropertyListingPage";
import { findNeighborhoodBySlug, getNeighborhoods } from "@/lib/api";
import { ALQUILER_HERO } from "@/lib/heroes";
import { buildAlternates, canonicalFor } from "@/lib/seo";

type MetaProps = {
  params: Promise<{ locale: string; barrio: string }>;
};

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale, barrio } = await params;
  const t = await getTranslations({ locale, namespace: "Listing" });
  const tZones = await getTranslations({ locale, namespace: "Zones" });
  const pathname = `/propiedades-en-alquiler/${barrio}`;
  const zoneName = tZones.has(barrio) ? tZones(barrio) : undefined;

  const { data: neighborhoods } = await getNeighborhoods(locale).catch(() => ({ data: [] }));
  const neighborhood = findNeighborhoodBySlug(neighborhoods, barrio);

  const title = neighborhood?.seo_title
    ? `${neighborhood.seo_title} - Victoria Fones Real Estate`
    : zoneName
      ? t("rentMetaTitle", { zone: zoneName })
      : `${t("rentTitle")} | Victoria Fones Real Estate`;
  const description = neighborhood?.seo_description ?? undefined;

  return {
    title,
    // See the sale-zone page's identical comment: omit rather than pass undefined.
    ...(description ? { description } : {}),
    alternates: {
      canonical: canonicalFor(locale, pathname),
      languages: buildAlternates(pathname),
    },
    ...(neighborhood?.og_image
      ? { openGraph: { title, description, images: [neighborhood.og_image] } }
      : {}),
  };
}

export default async function RentalsByNeighborhoodPage({
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
      operation="rent"
      neighborhood={barrio}
      pageKey="alquiler"
      heroImage={ALQUILER_HERO}
      heroImageOverride={{
        desktop: neighborhood?.hero_image.desktop ?? ALQUILER_HERO,
        mobile: neighborhood?.hero_image.mobile ?? ALQUILER_HERO,
      }}
      navbarStyleOverride={neighborhood?.navbar_style}
      titleOverride={zoneName ? tListing("rentInZone", { zone: zoneName }) : undefined}
      subtitleOverride=""
      neighborhoodDescription={neighborhood?.description ?? undefined}
      searchParams={searchParams}
    />
  );
}
