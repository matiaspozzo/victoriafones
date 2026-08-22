import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import LeadForm from "@/components/LeadForm";
import OfficeInfo from "@/components/OfficeInfo";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyHero from "@/components/PropertyHero";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import RelatedPropertiesSlider from "@/components/RelatedPropertiesSlider";
import { getProperties, getProperty, type PropertyDetail, type PropertySummary } from "@/lib/api";
import {
  BATHROOMS_LABEL,
  BEDROOMS_LABEL,
  formatNumber,
  formatUsd,
  priceOnRequestLabel,
  propertyMetaDescription,
  stripHtml,
} from "@/lib/format";
import { buildAlternates, canonicalFor } from "@/lib/seo";

// Same neighborhood first (most relevant); if that's too thin, top up with
// same-type listings so the section never renders with just one or two cards.
const RELATED_MIN = 4;
const RELATED_MAX = 8;

async function getRelatedProperties(locale: string, property: PropertyDetail): Promise<PropertySummary[]> {
  const operation = property.operation === "sale_and_rent" ? undefined : property.operation;
  const seen = new Set([property.id]);
  const related: PropertySummary[] = [];

  if (property.neighborhood) {
    const byNeighborhood = await getProperties(locale, {
      neighborhood: property.neighborhood.slug,
      operation,
      per_page: String(RELATED_MAX + 1),
    }).catch(() => ({ data: [] as PropertySummary[] }));

    for (const p of byNeighborhood.data) {
      if (!seen.has(p.id)) {
        related.push(p);
        seen.add(p.id);
      }
    }
  }

  if (related.length < RELATED_MIN) {
    const byType = await getProperties(locale, {
      type: property.type,
      operation,
      per_page: String(RELATED_MAX + 1),
    }).catch(() => ({ data: [] as PropertySummary[] }));

    for (const p of byType.data) {
      if (!seen.has(p.id)) {
        related.push(p);
        seen.add(p.id);
      }
    }
  }

  return related.slice(0, RELATED_MAX);
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const { data: property } = await getProperty(locale, slug);
    const href = { pathname: "/propiedades/[slug]", params: { slug: property.slug } } as const;
    // Manual copy first; auto-generated fallback last, since ~all listings
    // today have neither seo_description nor excerpt written (May SEO audit).
    const description =
      property.seo_description || property.excerpt || propertyMetaDescription(property, locale);

    return {
      title: property.seo_title
        ? `${property.seo_title} - Victoria Fones Real Estate`
        : `${property.title} | Victoria Fones Real Estate`,
      description,
      alternates: {
        canonical: canonicalFor(locale, href),
        languages: buildAlternates(href),
      },
      openGraph: {
        title: property.title,
        description,
        images: property.images[0] ? [property.images[0].card] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function PropertyPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Property" });

  let property;

  try {
    ({ data: property } = await getProperty(locale, slug));
  } catch {
    notFound();
  }

  const relatedProperties = await getRelatedProperties(locale, property);
  // JSON-LD "description" needs plain text — property.description is
  // sanitized RichEditor HTML, rendered as markup further down the page.
  const plainDescription = property.description ? stripHtml(property.description) : (property.excerpt ?? undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: plainDescription,
    url: canonicalFor(locale, { pathname: "/propiedades/[slug]", params: { slug: property.slug } }),
    image: property.images.map((img) => img.full),
    address: property.neighborhood
      ? {
          "@type": "PostalAddress",
          addressLocality: property.neighborhood.name,
          addressCountry: "UY",
        }
      : undefined,
    ...(property.lat && property.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.lat,
            longitude: property.lng,
          },
        }
      : {}),
    ...(property.price_usd
      ? {
          offers: {
            "@type": "Offer",
            price: property.price_usd,
            priceCurrency: "USD",
          },
        }
      : {}),
  };

  // Google doesn't offer rich results for RealEstateListing, so this
  // additionally marks the property up as a Product — Product/Offer is what
  // actually renders price/availability in search results.
  const productJsonLd = property.price_usd
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: property.title,
        description: plainDescription,
        image: property.images.map((img) => img.full),
        sku: property.code,
        brand: {
          "@type": "Organization",
          name: "Victoria Fones Real Estate",
        },
        offers: {
          "@type": "Offer",
          url: canonicalFor(locale, { pathname: "/propiedades/[slug]", params: { slug: property.slug } }),
          priceCurrency: "USD",
          price: property.price_usd,
          availability: "https://schema.org/InStock",
        },
      }
    : null;

  // Same "area | bedrooms | bathrooms" formula as PropertyCard, plus lot size
  // (when it's not already the primary area figure) and year built, since the
  // detail page carries more data than the card and shouldn't lose it.
  const primaryArea = property.built_area_m2 ?? property.lot_area_m2;
  const statsLine = [
    primaryArea ? `${primaryArea}m2` : null,
    property.bedrooms ? `${property.bedrooms} ${BEDROOMS_LABEL[locale] ?? BEDROOMS_LABEL.es}` : null,
    property.bathrooms ? `${property.bathrooms} ${BATHROOMS_LABEL[locale] ?? BATHROOMS_LABEL.es}` : null,
    property.lot_area_m2 && property.built_area_m2 ? `${property.lot_area_m2} ${t("lotArea")}` : null,
    property.year_built ? `${property.year_built}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const price = property.price_usd
    ? `USD ${formatNumber(property.price_usd, locale)}`
    : priceOnRequestLabel(locale);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {productJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      ) : null}
      <PropertyHero
        images={property.hero_images?.length ? property.hero_images : property.images}
        title={property.title}
      />

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          {property.neighborhood ? (
            <p
              className="text-[18px] font-medium leading-[1.41] text-brand-text"
              style={{ fontFamily: "var(--font-raleway), sans-serif" }}
            >
              {property.neighborhood.name}
            </p>
          ) : null}
          <h1
            className="text-[1.875rem] font-medium leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-raleway), sans-serif", letterSpacing: "-1.4px" }}
          >
            {property.title}
          </h1>

          <div className="mt-8 font-heading text-brand-primary">
            {statsLine ? <p className="font-bold">{statsLine}</p> : null}
            <p className="mt-1 font-bold">{price}</p>
            {property.code ? (
              <p className="mt-3 font-label text-xs uppercase tracking-wide text-brand-text/80">
                {property.code}
              </p>
            ) : null}
          </div>

          {property.rental_prices.length > 0 ? (
            <div className="mt-8">
              <h3 className="font-label text-lg text-brand-primary">{t("rentalPrices")}</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {property.rental_prices.map((rp, i) => (
                  <li key={i} className="flex justify-between border-b border-brand-text/10 py-1">
                    <span>{rp.label}</span>
                    <span className="font-semibold">{formatUsd(rp.price_usd, locale)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {property.amenities.length > 0 ? (
            <div className="mt-8">
              <h3 className="font-label text-lg text-brand-primary">{t("amenities")}</h3>
              <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
                {property.amenities.map((amenity) => (
                  <li key={amenity.id}>{amenity.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div
          className="vf-rich-text text-brand-text"
          dangerouslySetInnerHTML={{ __html: property.description ?? "" }}
        />
      </section>

      {property.images.length > 0 ? (
        <section
          className={`mx-auto max-w-7xl px-6 ${property.lat && property.lng ? "pb-4" : "pb-16"}`}
        >
          <PropertyGallery
            images={property.images}
            title={property.title}
            nextLabel={t("next")}
            previousLabel={t("previous")}
            closeLabel={t("close")}
          />
        </section>
      ) : null}

      {property.lat && property.lng ? (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2
            className="text-[1.875rem] font-light leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-raleway), sans-serif", letterSpacing: "-1.4px" }}
          >
            {t("location")}
          </h2>
          <div className="mt-6 overflow-hidden">
            <PropertyLocationMap
              lat={Number(property.lat)}
              lng={Number(property.lng)}
              title={property.title}
              className="h-[540px]"
              popupTitle={property.title}
              popupSubtitle={property.neighborhood?.name}
            />
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 md:grid-cols-2">
        {/* Contact form */}
        <div>
          <h2
            className="text-[1.875rem] font-light leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-raleway), sans-serif", letterSpacing: "-1.4px" }}
          >
            {t("contactHeading")}
          </h2>
          <div className="mt-6">
            <LeadForm propertyId={property.id} defaultSubject={property.title} variant="underline" whatsapp />
          </div>
        </div>

        {/* Contact info + office map (map fills the remaining column height) */}
        <OfficeInfo locale={locale} />
      </section>

      {relatedProperties.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2
            className="mb-6 text-[1.875rem] font-light leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-raleway), sans-serif", letterSpacing: "-1.4px" }}
          >
            {t("relatedProperties")}
          </h2>
          <RelatedPropertiesSlider properties={relatedProperties} />
        </section>
      ) : null}
    </main>
  );
}
