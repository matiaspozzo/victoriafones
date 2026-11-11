import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { developmentHeadline } from "@/components/DevelopmentCard";
import LeadForm from "@/components/LeadForm";
import OfficeInfo from "@/components/OfficeInfo";
import PropertyHero from "@/components/PropertyHero";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import { getDevelopment } from "@/lib/api";
import { developmentLotsLine, formatNumber, formatUsd, stripHtml } from "@/lib/format";
import { breadcrumbJsonLd, buildAlternates, canonicalFor } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const SECTION_HEADING_STYLE = { fontFamily: "var(--font-raleway), sans-serif", letterSpacing: "-1.4px" } as const;
const SECTION_HEADING_CLASS = "text-[1.875rem] font-light leading-[1.41] text-brand-primary";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const { data: development } = await getDevelopment(locale, slug);
    const href = { pathname: "/desarrollos/[slug]", params: { slug: development.slug } } as const;
    const title = development.seo_title || developmentHeadline(development);
    const description =
      development.seo_description ||
      development.excerpt ||
      (development.description ? stripHtml(development.description).slice(0, 160) : undefined);

    return {
      title: `${title} | Victoria Fones Real Estate`,
      description,
      alternates: {
        canonical: canonicalFor(locale, href),
        languages: buildAlternates(href),
      },
      openGraph: {
        title,
        description,
        images: development.images[0] ? [development.images[0].card] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function DevelopmentPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Developments" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  let development;

  try {
    ({ data: development } = await getDevelopment(locale, slug));
  } catch {
    notFound();
  }

  const url = canonicalFor(locale, { pathname: "/desarrollos/[slug]", params: { slug: development.slug } });
  const lotsLine = developmentLotsLine(development, locale);
  const hasLocation = Boolean(development.lat && development.lng);

  const breadcrumbs = [
    { name: tNav("home"), url: canonicalFor(locale, "/") },
    { name: t("title"), url: canonicalFor(locale, "/desarrollos") },
    { name: development.title, url },
  ];

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: development.title,
    description: development.description ? stripHtml(development.description) : (development.excerpt ?? undefined),
    url,
    image: development.images.map((img) => img.full),
    ...(development.neighborhood
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: development.neighborhood.name,
            addressRegion: "Maldonado",
            addressCountry: "UY",
          },
        }
      : {}),
    ...(hasLocation
      ? { geo: { "@type": "GeoCoordinates", latitude: development.lat, longitude: development.lng } }
      : {}),
    ...(development.amenities.length > 0
      ? {
          amenityFeature: development.amenities.map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a.name,
            value: true,
          })),
        }
      : {}),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      <PropertyHero images={development.images} title={development.title} />

      {/* Conocé el proyecto */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          {development.neighborhood ? (
            <p
              className="text-[18px] font-medium leading-[1.41] text-brand-text"
              style={{ fontFamily: "var(--font-raleway), sans-serif" }}
            >
              {development.neighborhood.name}
            </p>
          ) : null}
          <h1
            className="text-[1.875rem] font-medium leading-[1.41] text-brand-primary"
            style={SECTION_HEADING_STYLE}
          >
            {development.title}
          </h1>
          {lotsLine ? <p className="mt-6 font-heading font-bold text-brand-primary">{lotsLine}</p> : null}
          <a
            href="#contacto"
            className="mt-6 inline-block border border-brand-primary px-6 py-3 text-sm uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
          >
            {t("checkAvailability")}
          </a>
        </div>

        <div>
          <h2 className={SECTION_HEADING_CLASS} style={SECTION_HEADING_STYLE}>
            {t("project")}
          </h2>
          <div
            className="vf-rich-text mt-4 text-brand-text"
            dangerouslySetInnerHTML={{ __html: development.description ?? "" }}
          />
        </div>
      </section>

      {/* Servicios y Amenities */}
      {development.amenities.length > 0 || development.amenity_groups.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className={SECTION_HEADING_CLASS} style={SECTION_HEADING_STYLE}>
            {t("amenities")}
          </h2>
          {development.amenity_groups.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {development.amenity_groups.map((group, index) => (
                <div key={`${group.title}-${index}`}>
                  {group.title ? (
                    <h3
                      className="text-[18px] font-medium leading-[1.41] text-brand-primary"
                      style={{ fontFamily: "var(--font-raleway), sans-serif" }}
                    >
                      {group.title}
                    </h3>
                  ) : null}
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-brand-text">
                    {group.items.map((item, i) => (
                      <li key={`${item}-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
          {development.amenities.length > 0 ? (
            <ul
              className={`grid list-disc grid-cols-1 gap-x-10 gap-y-2 pl-5 text-brand-text sm:grid-cols-2 lg:grid-cols-3 ${
                development.amenity_groups.length > 0 ? "mt-8" : "mt-6"
              }`}
            >
              {development.amenities.map((amenity) => (
                <li key={amenity.id}>{amenity.name}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {/* Masterplan */}
      {development.masterplan ? (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className={SECTION_HEADING_CLASS} style={SECTION_HEADING_STYLE}>
            {t("masterplan")}
          </h2>
          <div className="relative mt-6 w-full overflow-hidden bg-brand-gray">
            {/* Natural aspect ratio (it's a drawing): never crop. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={development.masterplan.full}
              alt={`${t("masterplan")} – ${development.title}`}
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
          {development.masterplan_caption ? (
            <p className="mt-3 text-sm text-brand-text/80">{development.masterplan_caption}</p>
          ) : null}
        </section>
      ) : null}

      {/* Superficies */}
      {development.surfaces.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className={SECTION_HEADING_CLASS} style={SECTION_HEADING_STYLE}>
            {t("surfaces")}
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full max-w-2xl border-collapse text-left text-brand-primary">
              <tbody>
                {development.surfaces.map((row, index) => (
                  <tr
                    key={`${row.label}-${index}`}
                    className={`border-b border-brand-text/10 ${row.is_total ? "font-bold" : ""}`}
                  >
                    <td className="py-3 pr-6">{row.label}</td>
                    <td className="py-3 text-right whitespace-nowrap">{formatNumber(row.m2, locale)} m²</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Lotes */}
      {development.lots.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className={SECTION_HEADING_CLASS} style={SECTION_HEADING_STYLE}>
            {t("lots")}
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-brand-primary">
              <thead>
                <tr className="border-b border-brand-primary/30 text-sm uppercase tracking-wide text-brand-text/80">
                  <th className="py-3 pr-4 font-medium">{t("lot")}</th>
                  <th className="py-3 pr-4 font-medium">{t("area")}</th>
                  <th className="py-3 pr-4 font-medium">{t("price")}</th>
                  <th className="py-3 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {development.lots.map((lot, index) => (
                  <tr
                    key={lot.id}
                    className={`border-b border-brand-text/10 ${lot.status === "sold" ? "text-brand-text/50" : ""}`}
                  >
                    <td className="py-3 pr-4">{lot.label || `${t("lot")} ${index + 1}`}</td>
                    <td className="py-3 pr-4">{new Intl.NumberFormat("en-US").format(lot.area_m2)} m²</td>
                    <td className="py-3 pr-4 font-medium">{formatUsd(lot.price_usd, locale)}</td>
                    <td className="py-3">{t(lot.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Ubicación */}
      {hasLocation ? (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className={SECTION_HEADING_CLASS} style={SECTION_HEADING_STYLE}>
            {t("location")}
          </h2>
          {development.location_text ? (
            <p className="mt-4 max-w-3xl whitespace-pre-line text-brand-text">{development.location_text}</p>
          ) : null}
          <div className="mt-6 overflow-hidden">
            <PropertyLocationMap
              lat={Number(development.lat)}
              lng={Number(development.lng)}
              title={development.title}
              className="h-[540px]"
              popupTitle={development.title}
              popupSubtitle={development.neighborhood?.name}
            />
          </div>
        </section>
      ) : null}

      <section id="contacto" className="mx-auto grid max-w-7xl scroll-mt-24 grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <h2 className={SECTION_HEADING_CLASS} style={SECTION_HEADING_STYLE}>
            {t("contactHeading")}
          </h2>
          <div className="mt-6">
            <LeadForm developmentId={development.id} defaultSubject={development.title} variant="underline" whatsapp />
          </div>
        </div>
        <OfficeInfo locale={locale} />
      </section>
    </main>
  );
}
