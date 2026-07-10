import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LeadForm from "@/components/LeadForm";
import PageHeader from "@/components/PageHeader";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyMap from "@/components/PropertyMap";
import { iconArea, iconBath, iconBed, iconCalendar } from "@/components/PropertyStats";
import { getPageHeader, getProperties } from "@/lib/api";
import { formatUsd } from "@/lib/format";

export default async function PropertyListingPage({
  locale,
  operation,
  neighborhood,
  pageKey,
  heroImage,
  titleOverride,
  subtitleOverride,
  searchParams,
}: {
  locale: string;
  operation?: "sale" | "rent";
  neighborhood?: string;
  pageKey: "venta" | "alquiler" | "nuestras-propiedades";
  heroImage: string;
  titleOverride?: string;
  subtitleOverride?: string;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations({ locale, namespace: "Listing" });

  // Fixed-zone pages (venta/[barrio]) pin the neighborhood; the general
  // listings let the user pick a zone via the filter (?zona=).
  const effectiveNeighborhood = neighborhood ?? params.zona;
  const view = params.view === "list" || params.view === "map" ? params.view : "cards";

  const [listing, header] = await Promise.all([
    getProperties(locale, {
      operation,
      neighborhood: effectiveNeighborhood,
      type: params.type,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      price_min: params.price_min,
      price_max: params.price_max,
      sort: params.sort,
      per_page: "48",
    }),
    getPageHeader(locale, pageKey),
  ]);
  const properties = listing.data;

  const fallbackTitle =
    operation === "rent" ? t("rentTitle") : operation === "sale" ? t("saleTitle") : t("allTitle");
  const title = titleOverride ?? header?.hero_title ?? fallbackTitle;
  const subtitle = subtitleOverride ?? header?.hero_subtitle ?? undefined;
  const cta = await getTranslations({ locale, namespace: "SearchCta" });

  // GeoJSON query for the map view (same filters as the list).
  const mapParams = new URLSearchParams();
  if (operation) mapParams.set("operation", operation);
  if (effectiveNeighborhood) mapParams.set("neighborhood", effectiveNeighborhood);
  if (params.type) mapParams.set("type", params.type);
  if (params.bedrooms) mapParams.set("bedrooms", params.bedrooms);
  if (params.bathrooms) mapParams.set("bathrooms", params.bathrooms);
  if (params.price_min) mapParams.set("price_min", params.price_min);
  if (params.price_max) mapParams.set("price_max", params.price_max);

  return (
    <main>
      <PageHeader title={title} subtitle={subtitle} />

      <div className="relative h-[320px] w-full overflow-hidden sm:h-[400px]">
        <Image src={heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
      </div>

      <div className={`w-full px-6 pt-12 lg:px-12 ${view === "map" ? "pb-4" : "pb-12"}`}>
        <PropertyFilters
          currentType={params.type}
          currentBedrooms={params.bedrooms}
          currentBathrooms={params.bathrooms}
          currentZone={params.zona}
          currentSort={params.sort}
          currentView={view}
          currentPriceMin={params.price_min}
          currentPriceMax={params.price_max}
          priceBounds={listing.price_bounds}
          showZone={!neighborhood}
        />

        {view === "map" ? null : properties.length === 0 ? (
          <p className="text-brand-text/70">{t("noResults")}</p>
        ) : view === "list" ? (
          <ul className="divide-y divide-brand-text/10 border-y border-brand-text/10">
            {properties.map((property) => {
              const area = property.built_area_m2 ?? property.lot_area_m2;
              const cell = "flex items-center gap-1.5 whitespace-nowrap px-4";
              return (
                <li key={property.id}>
                  <Link
                    href={`/propiedades/${property.slug}`}
                    className="group flex items-center gap-4 py-3 text-sm text-brand-text/80 transition-colors hover:bg-brand-accent/40"
                  >
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-brand-gray">
                      {property.cover_image ? (
                        <Image
                          src={property.cover_image}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : null}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center divide-x divide-brand-text/15">
                      <h3 className="min-w-0 flex-1 truncate pr-4 font-heading text-lg font-medium text-brand-primary">
                        {property.title}
                      </h3>
                      {property.bedrooms ? (
                        <span className={`hidden sm:flex ${cell}`}>{iconBed}{property.bedrooms}</span>
                      ) : null}
                      {property.bathrooms ? (
                        <span className={`hidden sm:flex ${cell}`}>{iconBath}{property.bathrooms}</span>
                      ) : null}
                      {area ? (
                        <span className={`hidden md:flex ${cell}`}>{iconArea}{area}</span>
                      ) : null}
                      {property.year_built ? (
                        <span className={`hidden md:flex ${cell}`}>{iconCalendar}{property.year_built}</span>
                      ) : null}
                      <span className="px-4 pr-0 text-right font-price text-sm font-bold tracking-wide text-brand-primary">
                        {property.price_usd ? formatUsd(property.price_usd, locale) : "Consultar"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

      {view === "map" ? (
        <div className="mb-16">
          <PropertyMap locale={locale} query={mapParams.toString()} />
        </div>
      ) : null}

      {/* "Didn't find what you were looking for?" CTA + contact form.
          Background photo with a 90% navy overlay, like the live site. */}
      <section className="relative text-white">
        <Image src="/brand/search-cta.jpg" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-brand-primary/90" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 lg:gap-16 lg:px-12">
          <div>
            <h2 className="font-heading text-[2rem] font-normal leading-tight whitespace-normal xl:whitespace-nowrap">
              {cta("title")}
            </h2>
            <hr className="my-8 max-w-xs border-white/25" />
            <p className="max-w-md text-white/80">{cta("text")}</p>
          </div>
          <div>
            <LeadForm variant="onDark" />
          </div>
        </div>
      </section>
    </main>
  );
}
