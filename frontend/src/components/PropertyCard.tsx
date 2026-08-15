import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PropertySummary } from "@/lib/api";
import { BATHROOMS_LABEL, BEDROOMS_LABEL, TYPE_LABELS, formatNumber, priceOnRequestLabel } from "@/lib/format";

export default function PropertyCard({
  property,
  variant = "grid",
}: {
  property: PropertySummary;
  variant?: "grid" | "related";
}) {
  const locale = useLocale();
  const area = property.built_area_m2 ?? property.lot_area_m2;
  const typeLabel = TYPE_LABELS[locale]?.[property.type] ?? property.type;
  const title = [property.neighborhood?.name, typeLabel].filter(Boolean).join(" · ");

  const stats = [
    area ? `${area}m2` : null,
    property.bedrooms ? `${property.bedrooms} ${BEDROOMS_LABEL[locale] ?? BEDROOMS_LABEL.es}` : null,
    property.bathrooms ? `${property.bathrooms} ${BATHROOMS_LABEL[locale] ?? BATHROOMS_LABEL.es}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const price = property.price_usd
    ? `USD ${formatNumber(property.price_usd, locale)}`
    : priceOnRequestLabel(locale);

  const isRelated = variant === "related";

  return (
    <Link
      href={{ pathname: "/propiedades/[slug]", params: { slug: property.slug } }}
      className="group block min-w-0"
    >
      <div
        className={`relative w-full overflow-hidden bg-brand-gray ${isRelated ? "aspect-video" : "h-[360px]"}`}
      >
        {property.cover_image ? (
          <Image
            src={property.cover_image}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : null}
        {/* Hover overlay — cream wash + centered plus, exactly like the live site. */}
        <Image
          src="/brand/hover.webp"
          alt=""
          fill
          aria-hidden
          className="pointer-events-none object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      <div className="pt-5 font-heading text-brand-primary">
        <h2 className="text-2xl font-bold leading-snug">{title}</h2>
        {stats ? <p className="mt-2 text-base">{stats}</p> : null}
        <p className="mt-2 text-base">{price}</p>
        {property.code ? <p className="mt-2 text-base">{property.code}</p> : null}
      </div>
    </Link>
  );
}
