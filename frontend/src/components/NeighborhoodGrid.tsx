import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { HomeZoneCard } from "@/lib/api";

const ZONE_LINK_PATTERN = /^\/(propiedades-en-venta|propiedades-en-alquiler)\/([a-z0-9-]+)$/;

/**
 * `card.link` is admin-editable free text (e.g. "/propiedades-en-venta/club-de-mar"),
 * so it can't be a typed next-intl pathname at compile time. When it matches
 * the zone-listing pattern, re-resolve it through next-intl's per-locale
 * routing (this project's URLs are fully translated per locale — see
 * routing.ts — so a bare Spanish-segment href would otherwise 404 or land on
 * the wrong locale's page). Anything else (a different static page, an
 * external URL) renders as a plain, non-translated link.
 */
function ZoneCardLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const match = href.match(ZONE_LINK_PATTERN);

  if (match) {
    const [, operation, barrio] = match;
    const pathname = operation === "propiedades-en-venta" ? "/propiedades-en-venta/[barrio]" : "/propiedades-en-alquiler/[barrio]";

    return (
      <Link href={{ pathname, params: { barrio } }} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export default function NeighborhoodGrid({ cards }: { cards: HomeZoneCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-20">
      {cards.map((card, i) => (
        <ZoneCardLink key={`${card.link}-${i}`} href={card.link} className="group block">
          <div className="relative aspect-video overflow-hidden bg-brand-gray">
            {card.image ? (
              <Image
                src={card.image}
                alt={card.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="50vw"
              />
            ) : null}
          </div>
          <span className="block py-5 font-heading text-lg font-bold text-brand-primary">{card.label}</span>
        </ZoneCardLink>
      ))}
    </div>
  );
}
