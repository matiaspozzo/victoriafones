"use client";

import { useRef } from "react";
import PropertyCard from "@/components/PropertyCard";
import type { PropertySummary } from "@/lib/api";

/** Horizontal, snap-scrolling row of PropertyCards — 1/2/3 visible per breakpoint. */
export default function RelatedPropertiesSlider({ properties }: { properties: PropertySummary[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMultiple = properties.length > 1;

  function scrollByCard(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.offsetWidth + 24 : el.clientWidth;
    el.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((property) => (
          <div
            key={property.id}
            className="w-[85%] flex-shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous"
            className="absolute -left-4 top-[180px] flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white text-2xl text-brand-primary shadow-md hover:bg-brand-primary hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next"
            className="absolute -right-4 top-[180px] flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white text-2xl text-brand-primary shadow-md hover:bg-brand-primary hover:text-white"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
