"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Sub-neighborhoods of José Ignacio + Otras Zonas, matching the live site's
// Ventas/Alquileres submenu order. Shared with the mobile offcanvas menu.
export const ZONES = ["pueblo-jose-ignacio", "club-de-mar", "pinar-del-faro", "laguna-escondida", "alrededores", "otras-zonas"];

// `as const` keeps these as literal pathname types (matching routing.ts's
// `pathnames` keys) rather than widening to `string`, which next-intl's
// typed <Link> requires.
const LISTING_PATHNAME = {
  venta: "/propiedades-en-venta",
  alquiler: "/propiedades-en-alquiler",
} as const;
const ZONE_PATHNAME = {
  venta: "/propiedades-en-venta/[barrio]",
  alquiler: "/propiedades-en-alquiler/[barrio]",
} as const;

export default function NavDropdown({
  label,
  basePath,
  hoverClassName = "hover:text-brand-secondary",
  disableZones = false,
}: {
  label: string;
  basePath: "venta" | "alquiler";
  hoverClassName?: string;
  /** Hides the zone submenu, rendering a plain link — used while a listing
      section (e.g. alquiler) is temporarily disabled. */
  disableZones?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const tZones = useTranslations("Zones");
  const listingPath = LISTING_PATHNAME[basePath];

  if (disableZones) {
    return (
      <Link href={listingPath} className={`text-sm font-medium tracking-wide ${hoverClassName}`}>
        {label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={listingPath}
        className={`flex items-center gap-1 text-sm font-medium tracking-wide ${hoverClassName}`}
      >
        {label}
        <svg
          viewBox="0 0 12 8"
          className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {open ? (
        // pt-3 keeps a visual gap while preserving the hover bridge.
        <div className="absolute left-0 top-full pt-3">
          <ul className="min-w-[230px] overflow-hidden rounded-lg bg-brand-accent py-2 text-sm text-brand-primary shadow-xl">
            {ZONES.map((zone) => (
              <li key={zone}>
                <Link
                  href={{ pathname: ZONE_PATHNAME[basePath], params: { barrio: zone } }}
                  className="block px-5 py-2.5 hover:bg-white"
                >
                  {tZones(zone)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
