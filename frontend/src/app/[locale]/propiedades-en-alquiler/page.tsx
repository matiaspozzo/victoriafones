import PropertyListingPage from "@/components/PropertyListingPage";
import { ALQUILER_HERO } from "@/lib/heroes";

export default async function RentalsPage({
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
      operation="rent"
      pageKey="alquiler"
      heroImage={ALQUILER_HERO}
      searchParams={searchParams}
    />
  );
}
