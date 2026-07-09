"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import type { PropertySummary } from "@/lib/api";
import { formatUsd, OPERATION_LABELS } from "@/lib/format";

/**
 * Featured slider used when there are fewer than five featured properties
 * (below that the masonry grid looks sparse). Each slide spans the full width
 * of the section and only one is shown at a time; arrows page through the rest.
 */
export default function FeaturedPropertiesSlider({ properties }: { properties: PropertySummary[] }) {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMultiple = properties.length > 1;

  function scrollByCards(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    // One full slide at a time (slide width + gap).
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : el.clientWidth;
    el.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((property) => {
          const operation = OPERATION_LABELS[locale]?.[property.operation] ?? "";
          return (
            <Link
              key={property.id}
              href={`/propiedades/${property.slug}`}
              className="group relative aspect-[4/3] w-full flex-shrink-0 snap-start overflow-hidden bg-brand-gray sm:aspect-auto sm:h-[520px]"
            >
              {property.cover_image ? (
                <Image
                  src={property.cover_image}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1280px) 1216px, 100vw"
                />
              ) : null}

              {operation ? (
                <span className="absolute left-5 top-5 bg-brand-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {operation}
                </span>
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                {property.neighborhood ? (
                  <p className="text-xs uppercase tracking-wide text-white/80">
                    {property.neighborhood.name}
                  </p>
                ) : null}
                <p className="mt-1 font-heading text-2xl font-medium sm:text-3xl">{property.title}</p>
                <p className="mt-1 font-price text-xl font-bold">
                  {formatUsd(property.price_usd, locale)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-2xl text-brand-primary shadow-md hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-2xl text-brand-primary shadow-md hover:bg-white"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
