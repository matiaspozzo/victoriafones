import PropertyListingPage from "@/components/PropertyListingPage";
import { VENTA_HERO } from "@/lib/heroes";

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
