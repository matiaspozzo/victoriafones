import { getTranslations } from "next-intl/server";
import PropertyListingPage from "@/components/PropertyListingPage";
import { ventaZoneHero } from "@/lib/heroes";

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
