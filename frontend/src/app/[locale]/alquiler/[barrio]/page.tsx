import { getTranslations } from "next-intl/server";
import PropertyListingPage from "@/components/PropertyListingPage";
import { ALQUILER_HERO } from "@/lib/heroes";

export default async function RentalsByNeighborhoodPage({
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
      operation="rent"
      neighborhood={barrio}
      pageKey="alquiler"
      heroImage={ALQUILER_HERO}
      subtitleOverride={zoneName}
      searchParams={searchParams}
    />
  );
}
