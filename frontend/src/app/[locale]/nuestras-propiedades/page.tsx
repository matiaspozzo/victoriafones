import PropertyListingPage from "@/components/PropertyListingPage";
import { ALL_PROPERTIES_HERO } from "@/lib/heroes";

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
