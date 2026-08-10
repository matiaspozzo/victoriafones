import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LeadForm from "@/components/LeadForm";
import { SetNavbarStyle, type NavbarStyle } from "@/components/NavbarStyleContext";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyMap from "@/components/PropertyMap";
import { iconArea, iconBath, iconBed, iconCalendar } from "@/components/PropertyStats";
import ResponsiveHero from "@/components/ResponsiveHero";
import { getPageHeader, getProperties } from "@/lib/api";
import { formatUsd } from "@/lib/format";
import { canonicalFor } from "@/lib/seo";

export default async function PropertyListingPage({
  locale,
  operation,
  neighborhood,
  pageKey,
  heroImage,
  heroImageOverride,
  navbarStyleOverride,
  titleOverride,
  subtitleOverride,
  neighborhoodDescription,
  searchParams,
}: {
  locale: string;
  operation?: "sale" | "rent";
  neighborhood?: string;
  pageKey: "venta" | "alquiler" | "nuestras-propiedades";
  /** Static fallback used until the client uploads a custom hero photo in Filament. */
  heroImage: string;
  /** Fully-resolved hero (already merged with its own static fallback) for pages with
      their own distinct photo per neighborhood (venta|alquiler/[barrio]) — takes
      priority over the page-wide PageSetting hero, which would otherwise silently
      override every zone's distinct hero image. */
  heroImageOverride?: { desktop: string; mobile: string };
  /** Neighborhood's own navbar_style, when this is a zone page — same
      priority-over-PageSetting reasoning as heroImageOverride. */
  navbarStyleOverride?: NavbarStyle;
  titleOverride?: string;
  subtitleOverride?: string;
  neighborhoodDescription?: string;
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
      page: params.page,
    }),
    getPageHeader(locale, pageKey),
  ]);
  const properties = listing.data;

  const fallbackTitle =
    operation === "rent" ? t("rentTitle") : operation === "sale" ? t("saleTitle") : t("allTitle");
  const title = titleOverride ?? header?.hero_title ?? fallbackTitle;
  const subtitle = subtitleOverride ?? header?.hero_subtitle ?? undefined;
  const heroDesktop = heroImageOverride?.desktop ?? header?.hero_image.desktop ?? heroImage;
  const heroMobile = heroImageOverride?.mobile ?? header?.hero_image.mobile ?? heroImage;
  const navbarStyle = navbarStyleOverride ?? header?.navbar_style ?? "white";
  const cta = await getTranslations({ locale, namespace: "SearchCta" });

  // Marks up the listed properties as a Product ItemList, so search engines
  // can pick up price/availability for each card (see the property detail
  // page's Product markup for why Product rather than RealEstateListing).
  const itemListJsonLd =
    properties.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: properties.map((property, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: property.title,
              url: canonicalFor(locale, `/propiedades/${property.slug}`),
              image: property.cover_image ?? undefined,
              sku: property.code,
              ...(property.price_usd
                ? {
                    offers: {
                      "@type": "Offer",
                      priceCurrency: "USD",
                      price: property.price_usd,
                      availability: "https://schema.org/InStock",
                    },
                  }
                : {}),
            },
          })),
        }
      : null;

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
      <SetNavbarStyle style={navbarStyle} />
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <ResponsiveHero desktop={heroDesktop} mobile={heroMobile} />

      <PageHeader title={title} subtitle={subtitle} description={neighborhoodDescription} />

      <div className={`mx-auto max-w-7xl px-6 pt-12 ${view === "map" ? "pb-4" : "pb-12"}`}>
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
          <p className="text-brand-text/80">{t("noResults")}</p>
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
          <div className="mt-10 grid grid-cols-1 gap-20 sm:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {view === "map" || properties.length === 0 ? null : (
          <Pagination
            locale={locale}
            currentPage={listing.meta.current_page}
            lastPage={listing.meta.last_page}
            params={params}
          />
        )}
      </div>

      {view === "map" ? (
        <div className="mx-auto mb-16 max-w-7xl px-6">
          <PropertyMap locale={locale} query={mapParams.toString()} />
        </div>
      ) : null}

      {/* "Didn't find what you were looking for?" CTA + contact form.
          Grayscale background photo with a 90% light overlay. */}
      <section className="relative text-brand-primary">
        <Image src="/brand/search-cta.jpg" alt="" fill className="object-cover grayscale" sizes="100vw" />
        <div className="absolute inset-0 bg-[#eeeeec]/90" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 lg:gap-16 lg:px-12">
          <div>
            <h2 className="font-heading text-[2rem] font-bold leading-tight text-brand-primary whitespace-normal xl:whitespace-nowrap">
              {cta("title")}
            </h2>
            <hr className="my-8 max-w-xs border-brand-primary/25" />
            <p className="max-w-md font-bold text-brand-primary">{cta("text")}</p>
          </div>
          <div>
            <LeadForm />
          </div>
        </div>
      </section>
    </main>
  );
}
