// Static hero images captured from the live site (public/heroes/*).
export const ABOUT_HERO = "/heroes/bg-about-new.webp";
export const VENTA_HERO = "/heroes/venta.webp";
export const ALQUILER_HERO = "/heroes/hero-alquileres-todos.webp";
export const ALL_PROPERTIES_HERO = "/heroes/hero_propiedades.webp";

const VENTA_ZONE_HERO: Record<string, string> = {
  "pueblo-jose-ignacio": "/heroes/hero-venta-pueblo.webp",
  "club-de-mar": "/heroes/bg-club-de-mar.webp",
  "pinar-del-faro": "/heroes/bg-pinar-del-faro.webp",
  "laguna-escondida": "/heroes/hero-venta-laguna-escondida.webp",
  alrededores: "/heroes/hero-venta-alrededores.webp",
};

export function ventaZoneHero(slug: string): string {
  return VENTA_ZONE_HERO[slug] ?? VENTA_HERO;
}
