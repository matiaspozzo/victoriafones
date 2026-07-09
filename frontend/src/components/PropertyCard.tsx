import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { iconArea, iconBath, iconBed, iconCalendar, iconList } from "@/components/PropertyStats";
import type { PropertySummary } from "@/lib/api";

function priceLabel(price: number | null): string {
  if (price === null || price <= 0) return "Consultar";
  return `USD: ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PropertyCard({ property }: { property: PropertySummary }) {
  const area = property.built_area_m2 ?? property.lot_area_m2;
  const code = [property.code, property.neighborhood?.name].filter(Boolean).join(" - ").toUpperCase();

  return (
    <Link href={`/propiedades/${property.slug}`} className="group block min-w-0 bg-white">
      <div className="relative h-[360px] w-full overflow-hidden bg-brand-gray">
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

      <div className="pt-5">
        <h3 className="border-b border-brand-text/15 pb-3 font-heading text-2xl font-medium leading-snug text-brand-primary">
          {property.title}
        </h3>

        <p className="mt-3 font-price text-base font-bold tracking-wide text-brand-primary">
          {priceLabel(property.price_usd)}
        </p>

        {/* Stats + code on a single line; the code truncates if it runs long. */}
        <div className="mt-3 flex min-w-0 items-center gap-x-3 overflow-hidden whitespace-nowrap text-sm text-brand-text/80">
          {property.bedrooms ? (
            <span className="inline-flex shrink-0 items-center gap-1.5">{iconBed}{property.bedrooms}</span>
          ) : null}
          {property.bathrooms ? (
            <span className="inline-flex shrink-0 items-center gap-1.5">{iconBath}{property.bathrooms}</span>
          ) : null}
          {area ? (
            <span className="inline-flex shrink-0 items-center gap-1.5">{iconArea}{area}</span>
          ) : null}
          {property.year_built ? (
            <span className="inline-flex shrink-0 items-center gap-1.5">{iconCalendar}{property.year_built}</span>
          ) : null}
          {code ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 font-label text-xs uppercase tracking-wide text-brand-text/60">
              {iconList}
              <span className="truncate">{code}</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
