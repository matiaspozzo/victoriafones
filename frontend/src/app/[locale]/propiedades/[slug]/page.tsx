import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import LeadForm from "@/components/LeadForm";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyHero from "@/components/PropertyHero";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import { iconArea, iconBath, iconBed, iconCalendar, iconList } from "@/components/PropertyStats";
import RelatedPropertiesSlider from "@/components/RelatedPropertiesSlider";
import { getProperties, getProperty, type PropertyDetail, type PropertySummary } from "@/lib/api";
import { formatNumber, formatUsd } from "@/lib/format";
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

// Agency office shown alongside the property contact form.
const OFFICE = {
  addressLine: "Galería Los Caracoles. Sainz Martinez y Los Biguá.",
  city: "José Ignacio, Uruguay",
  phone: "+598 9470 7314",
  phoneHref: "+59894707314",
  email: "info@victoriafones.com",
  instagram: "https://www.instagram.com/victoriafones.realestate",
  lat: -34.8425851,
  lng: -54.6406539,
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const { data: property } = await getProperty(locale, slug);
    const pathname = `/propiedades/${property.slug}`;

    return {
      title: property.seo_title || `${property.title} | Victoria Fones Real Estate`,
      description: property.seo_description || property.excerpt || undefined,
      alternates: {
        canonical: canonicalFor(locale, pathname),
        languages: buildAlternates(pathname),
      },
      openGraph: {
        title: property.title,
        description: property.excerpt || undefined,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? property.excerpt ?? undefined,
    url: canonicalFor(locale, `/propiedades/${property.slug}`),
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

  const stats: { icon: ReactNode; value: string }[] = [];
  if (property.bedrooms) stats.push({ icon: iconBed, value: `${property.bedrooms} ${t("bedrooms")}` });
  if (property.bathrooms) stats.push({ icon: iconBath, value: `${property.bathrooms} ${t("bathrooms")}` });
  if (property.built_area_m2) stats.push({ icon: iconArea, value: `${property.built_area_m2} ${t("builtArea")}` });
  if (property.lot_area_m2) stats.push({ icon: iconArea, value: `${property.lot_area_m2} ${t("lotArea")}` });
  if (property.year_built) stats.push({ icon: iconCalendar, value: `${property.year_built}` });

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navy headline block, with the image slider below it (matches the live site). */}
      <section className="w-full bg-brand-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="font-heading text-[2rem] font-medium leading-[1.2]">
            {property.title}
          </h1>
          {property.neighborhood ? (
            <p className="font-heading text-[2rem] font-medium leading-[1.2]">
              {property.neighborhood.name}
            </p>
          ) : null}
        </div>
      </section>

      <PropertyHero
        images={property.hero_images?.length ? property.hero_images : property.images}
        title={property.title}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <h2
            className="text-[1.875rem] font-medium leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-montserrat), sans-serif", letterSpacing: "-1.4px" }}
          >
            {property.title}
          </h2>
          {property.neighborhood ? (
            <p
              className="text-[18px] font-medium leading-[1.41] text-brand-text"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              {property.neighborhood.name}
            </p>
          ) : null}
          <hr className="my-4 border-brand-text/20" />
          <p className="font-bold text-brand-primary">
            {property.price_usd !== null ? (
              <>
                <span className="font-body text-[20px] font-light text-[#7a7a7a]">Precio: USD </span>
                <span className="font-sans text-[1.5rem]">{formatNumber(property.price_usd, locale)}</span>
              </>
            ) : (
              <span className="font-sans text-[1.5rem]">{formatUsd(property.price_usd, locale)}</span>
            )}
          </p>
          <hr className="my-4 border-brand-text/20" />
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-text">
            {stats.map((s, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {s.icon}
                {s.value}
              </li>
            ))}
          </ul>
          <p className="mt-3 inline-flex items-center gap-1.5 font-label text-xs uppercase tracking-wide text-brand-text/60">
            {iconList}
            {property.code}
          </p>

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

        <div className="text-brand-text">
          <p className="whitespace-pre-line">{property.description}</p>
        </div>
      </section>

      {property.images.length > 0 ? (
        <section
          className={`mx-auto max-w-7xl px-6 ${property.lat && property.lng ? "pb-4" : "pb-16"}`}
        >
          <h2
            className="mb-6 text-center text-[1.875rem] font-light leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-montserrat), sans-serif", letterSpacing: "-1.4px" }}
          >
            {t("gallery")}
          </h2>
          <PropertyGallery images={property.images} title={property.title} />
        </section>
      ) : null}

      {property.lat && property.lng ? (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2
            className="text-[1.875rem] font-light leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-montserrat), sans-serif", letterSpacing: "-1.4px" }}
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

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 md:grid-cols-2">
        {/* Contact form */}
        <div>
          <h2
            className="text-[1.875rem] font-light leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-montserrat), sans-serif", letterSpacing: "-1.4px" }}
          >
            {t("contactHeading")}
          </h2>
          <div className="mt-6">
            <LeadForm propertyId={property.id} defaultSubject={property.title} />
          </div>
        </div>

        {/* Contact info + office map (map fills the remaining column height) */}
        <div className="flex flex-col gap-6 text-sm text-brand-text">
          <div className="space-y-3">
            <p>
              {OFFICE.addressLine}{" "}
              <span className="font-bold text-brand-primary">{OFFICE.city}</span>
            </p>
            <p>
              Phone &amp; Whatsapp{" "}
              <a href={`tel:${OFFICE.phoneHref}`} className="font-bold text-brand-primary">
                {OFFICE.phone}
              </a>
            </p>
            <p>
              Visit our{" "}
              <a
                href={OFFICE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-primary underline"
              >
                Instagram
              </a>
              <br />
              <a href={`mailto:${OFFICE.email}`} className="text-brand-primary">
                {OFFICE.email}
              </a>
            </p>
          </div>
          <PropertyLocationMap
            lat={OFFICE.lat}
            lng={OFFICE.lng}
            title="Victoria Fones Real Estate"
            className="min-h-[280px] flex-1"
            popupTitle="Victoria Fones Real Estate"
            popupSubtitle={`${OFFICE.addressLine} ${OFFICE.city}`}
          />
        </div>
      </section>

      {relatedProperties.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2
            className="mb-6 text-[1.875rem] font-light leading-[1.41] text-brand-primary"
            style={{ fontFamily: "var(--font-montserrat), sans-serif", letterSpacing: "-1.4px" }}
          >
            {t("relatedProperties")}
          </h2>
          <RelatedPropertiesSlider properties={relatedProperties} />
        </section>
      ) : null}
    </main>
  );
}
