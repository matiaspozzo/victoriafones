import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PropertySummary } from "@/lib/api";
import { formatNumber, formatUsd, OPERATION_LABELS } from "@/lib/format";

function FeaturedCard({ property, hero = false }: { property: PropertySummary; hero?: boolean }) {
  const locale = useLocale();
  const operation = OPERATION_LABELS[locale]?.[property.operation] ?? "";
  const price =
    property.price_usd !== null
      ? `USD ${formatNumber(property.price_usd, locale)}`
      : formatUsd(null, locale);

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className={`group relative block overflow-hidden bg-brand-gray ${
        hero ? "aspect-[4/3] lg:aspect-auto lg:h-full" : "aspect-[4/3]"
      }`}
    >
      {property.cover_image ? (
        <Image
          src={property.cover_image}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={hero ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
        />
      ) : null}

      {operation ? (
        <span className="absolute left-4 top-4 bg-brand-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {operation}
        </span>
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/10 to-transparent" />

      <div className="absolute bottom-4 left-4 right-4 text-white">
        <p className={`font-heading font-semibold ${hero ? "text-3xl" : "text-xl"}`}>{price}</p>
        <p className={`truncate text-white/85 ${hero ? "text-base" : "text-sm"}`}>{property.title}</p>
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
    <div className="grid gap-4 lg:grid-cols-2">
      <FeaturedCard property={hero} hero />
      <div className="grid grid-cols-2 gap-4">
        {rest.map((property) => (
          <FeaturedCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
