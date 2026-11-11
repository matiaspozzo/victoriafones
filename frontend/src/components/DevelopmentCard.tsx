import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DevelopmentSummary } from "@/lib/api";
import { developmentLotsLine } from "@/lib/format";

/** "Nombre – Lugar" headline shared by every development card. */
export function developmentHeadline(development: Pick<DevelopmentSummary, "title" | "neighborhood">): string {
  return [development.title, development.neighborhood?.name].filter(Boolean).join(" – ");
}

/**
 * Listing card: photo (3 per row on desktop), then "Nombre – Lugar" and
 * "Lotes de X m² desde USD X" below it — same structure as the sales cards.
 */
export default function DevelopmentCard({ development }: { development: DevelopmentSummary }) {
  const locale = useLocale();
  const lotsLine = developmentLotsLine(development, locale);

  return (
    <Link
      href={{ pathname: "/desarrollos/[slug]", params: { slug: development.slug } }}
      className="group block min-w-0"
    >
      <div className="relative h-[360px] w-full overflow-hidden bg-brand-gray">
        {development.cover_image ? (
          <Image
            src={development.cover_image}
            alt={development.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : null}
        {/* Same cream hover wash as the property cards. */}
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
        <h2 className="text-2xl font-bold leading-snug">{developmentHeadline(development)}</h2>
        {lotsLine ? <p className="mt-2 text-base">{lotsLine}</p> : null}
      </div>
    </Link>
  );
}
