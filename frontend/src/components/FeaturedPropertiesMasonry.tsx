import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PropertySummary } from "@/lib/api";
import { formatNumber, formatUsd, OPERATION_LABELS, TYPE_LABELS } from "@/lib/format";

function FeaturedCard({ property, hero = false }: { property: PropertySummary; hero?: boolean }) {
  const locale = useLocale();
  const operation = OPERATION_LABELS[locale]?.[property.operation] ?? "";
  const typeLabel = TYPE_LABELS[locale]?.[property.type] ?? property.type;
  const title = [property.neighborhood?.name, typeLabel].filter(Boolean).join(" · ");
  const price =
    property.price_usd !== null
      ? `USD ${formatNumber(property.price_usd, locale)}`
      : formatUsd(null, locale);

  return (
    <Link
      href={{ pathname: "/propiedades/[slug]", params: { slug: property.slug } }}
      className={`group block pb-4 sm:relative sm:overflow-hidden sm:bg-brand-gray sm:pb-0 ${
        hero ? "sm:aspect-[4/3] lg:aspect-auto lg:h-full" : "sm:aspect-[4/3]"
      }`}
    >
      {/* Mobile: image on top, text below. sm+: image fills the card, text overlays it. */}
      <div className="relative aspect-video overflow-hidden bg-brand-gray sm:absolute sm:inset-0 sm:aspect-auto">
        {property.cover_image ? (
          <Image
            src={property.cover_image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={hero ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
          />
        ) : null}

        {operation ? (
          <span className="absolute left-4 top-4 bg-brand-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {operation}
          </span>
        ) : null}

        <div className="absolute inset-0 hidden bg-gradient-to-t from-brand-primary/90 via-brand-primary/10 to-transparent sm:block" />
      </div>

      <div className="pt-3 text-brand-primary sm:absolute sm:bottom-4 sm:left-4 sm:right-4 sm:pt-0 sm:text-white">
        <p className={`truncate font-heading text-base ${hero ? "sm:text-base" : "sm:text-sm"}`}>{title}</p>
        <p className={`font-heading text-xl font-bold ${hero ? "sm:text-3xl" : "sm:text-xl"}`}>
          {price}
          {property.code ? (
            <span className={`ml-2 text-sm font-light text-brand-text/60 sm:text-white/70 ${hero ? "sm:text-base" : "sm:text-sm"}`}>
              {property.code}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}

export default function FeaturedPropertiesMasonry({ properties }: { properties: PropertySummary[] }) {
  // Landa-style layout: one large hero card on the left + a 2×2 grid of four
  // smaller cards on the right. Uses the first five featured properties.
  const [hero, ...rest] = properties.slice(0, 5);

  if (!hero) return null;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 lg:grid-cols-2">
      <FeaturedCard property={hero} hero />
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {rest.map((property) => (
          <FeaturedCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
