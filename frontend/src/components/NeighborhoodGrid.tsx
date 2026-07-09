import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Real photos captured from the live site's homepage neighborhood-link
// section (wp-content/uploads/2025/10/home-links-*.webp).
const ZONES = [
  { slug: "pueblo-jose-ignacio", image: "/neighborhoods/home-links-jose-ignacio-town.webp" },
  { slug: "pinar-del-faro", image: "/neighborhoods/home-links-pinar-del-faro.webp" },
  { slug: "club-de-mar", image: "/neighborhoods/home-links-club-de-mar.webp" },
  { slug: "laguna-escondida", image: "/neighborhoods/home-links-laguna-escondida-v2.webp" },
  { slug: "otras-zonas", image: "/neighborhoods/home-links-playa-brava.webp" },
  { slug: "alrededores", image: "/neighborhoods/home-links-alrededores.webp" },
];

export default async function NeighborhoodGrid({ locale }: { locale: string }) {
  const tZones = await getTranslations({ locale, namespace: "Zones" });

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      {ZONES.map((zone) => (
        <Link key={zone.slug} href={`/venta/${zone.slug}`} className="group block">
          <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
            <Image
              src={zone.image}
              alt={tZones(zone.slug)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 640px) 33vw, 50vw"
            />
          </div>
          {/* Label sits below the image (matches the live site's separate
              heading widget: Montserrat 300, uppercase, white). */}
          <span className="block py-5 font-label text-base font-light uppercase tracking-wide text-white">
            {tZones(zone.slug)}
          </span>
        </Link>
      ))}
    </div>
  );
}
