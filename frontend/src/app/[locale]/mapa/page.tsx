import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyMap from "@/components/PropertyMap";
import { buildAlternates, canonicalFor } from "@/lib/seo";

const PATHNAME = "/mapa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });

  return {
    title: `${t("map")} | Victoria Fones Real Estate`,
    alternates: {
      canonical: canonicalFor(locale, PATHNAME),
      languages: buildAlternates(PATHNAME),
    },
  };
}

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  // Build the map API query from the filter form values.
  const apiParams = new URLSearchParams();
  if (sp.zona) apiParams.set("neighborhood", sp.zona);
  if (sp.type) apiParams.set("type", sp.type);
  if (sp.bedrooms) apiParams.set("bedrooms", sp.bedrooms);
  if (sp.bathrooms) apiParams.set("bathrooms", sp.bathrooms);
  if (sp.price_min) apiParams.set("price_min", sp.price_min);
  if (sp.price_max) apiParams.set("price_max", sp.price_max);
  const query = apiParams.toString();

  return (
    <div className="relative">
      {/* Filter bar: stacked above the map on mobile, floating over it on desktop. */}
      <div className="border-b border-brand-text/10 bg-white px-4 py-4 lg:absolute lg:left-4 lg:top-4 lg:z-10 lg:rounded-lg lg:border lg:px-4 lg:py-3 lg:shadow-lg">
        <PropertyFilters
          currentType={sp.type}
          currentBedrooms={sp.bedrooms}
          currentBathrooms={sp.bathrooms}
          currentZone={sp.zona}
          currentPriceMin={sp.price_min}
          currentPriceMax={sp.price_max}
          showSort={false}
          showView={false}
          compact
        />
      </div>

      <PropertyMap locale={locale} query={query} />
    </div>
  );
}
