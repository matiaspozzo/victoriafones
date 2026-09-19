// Sub-neighborhoods of José Ignacio + Otras Zonas, matching the live site's
// Ventas/Alquileres submenu order. This is the canonical list of zones that
// have their own /propiedades-en-venta|alquiler/{barrio} listing page —
// shared by the nav dropdown, the listing filter, and the sitemap.
// Plain module (no "use client") so server-only files like sitemap.ts can
// import it without pulling a client component into their bundle.
export const ZONES = [
  "pueblo-jose-ignacio",
  "club-de-mar",
  "pinar-del-faro",
  "laguna-escondida",
  "alrededores",
  "otras-zonas",
] as const;
