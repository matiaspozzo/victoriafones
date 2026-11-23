"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import type { PropertySummary } from "@/lib/api";
import { formatUsd, OPERATION_LABELS, TYPE_LABELS } from "@/lib/format";

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
          const typeLabel = TYPE_LABELS[locale]?.[property.type] ?? property.type;
          const title = [property.neighborhood?.name, typeLabel].filter(Boolean).join(" · ");
          return (
            <Link
              key={property.id}
              href={{ pathname: "/propiedades/[slug]", params: { slug: property.slug } }}
              className="group block w-full flex-shrink-0 snap-start pb-2 sm:relative sm:h-[520px] sm:overflow-hidden sm:bg-brand-gray sm:pb-0"
            >
              {/* Mobile: image on top, text below. sm+: image fills the slide, text overlays it. */}
              <div className="relative aspect-video overflow-hidden bg-brand-gray sm:absolute sm:inset-0 sm:aspect-auto">
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
                  <span className="pointer-events-auto absolute left-3 top-3 bg-brand-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white sm:left-5 sm:top-5">
                    {operation}
                  </span>
                ) : null}

                <div className="absolute inset-0 hidden bg-gradient-to-t from-brand-primary/90 via-brand-primary/10 to-transparent sm:block" />
              </div>

              <div className="pt-3 text-brand-primary sm:absolute sm:bottom-6 sm:left-6 sm:right-6 sm:pt-0 sm:text-white">
                <p className="font-heading text-xl font-medium sm:text-3xl">{title}</p>
                <p className="mt-1 font-price text-lg sm:text-xl">
                  <span className="font-bold">{formatUsd(property.price_usd, locale)}</span>
                  {property.code ? (
                    <span className="ml-3 text-base font-light text-brand-text/60 sm:text-white/70">{property.code}</span>
                  ) : null}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMultiple ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-video sm:inset-0 sm:aspect-auto">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous"
            className="pointer-events-auto absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-white/90 text-xl sm:left-4 sm:h-11 sm:w-11 text-brand-primary sm:text-2xl shadow-md hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next"
            className="pointer-events-auto absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-white/90 text-xl sm:right-4 sm:h-11 sm:w-11 text-brand-primary sm:text-2xl shadow-md hover:bg-white"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
