"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import type { DevelopmentSummary } from "@/lib/api";
import { developmentLotsLine } from "@/lib/format";
import { developmentHeadline } from "@/components/DevelopmentCard";

// Masonry needs enough cards to fill the columns without looking sparse;
// below this threshold a slider reads better (same rule the old
// "Destacados" block used).
const MASONRY_MIN = 5;

function Card({ development, hero = false }: { development: DevelopmentSummary; hero?: boolean }) {
  const locale = useLocale();
  const lotsLine = developmentLotsLine(development, locale);

  return (
    <Link
      href={{ pathname: "/desarrollos/[slug]", params: { slug: development.slug } }}
      className={`group relative block overflow-hidden bg-brand-gray ${
        hero ? "aspect-[4/3] lg:aspect-auto lg:h-full" : "aspect-[4/3]"
      }`}
    >
      {development.cover_image ? (
        <Image
          src={development.cover_image}
          alt={development.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={hero ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/10 to-transparent" />

      <div className="absolute bottom-4 left-4 right-4 text-white">
        <p className={`font-heading font-medium ${hero ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"}`}>
          {developmentHeadline(development)}
        </p>
        {lotsLine ? (
          <p className={`mt-1 font-price font-bold ${hero ? "text-xl" : "text-sm"}`}>{lotsLine}</p>
        ) : null}
      </div>
    </Link>
  );
}

function Masonry({ developments }: { developments: DevelopmentSummary[] }) {
  const [hero, ...rest] = developments.slice(0, 5);

  if (!hero) return null;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 lg:grid-cols-2">
      <Card development={hero} hero />
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {rest.map((development) => (
          <Card key={development.id} development={development} />
        ))}
      </div>
    </div>
  );
}

function Slider({ developments }: { developments: DevelopmentSummary[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMultiple = developments.length > 1;

  function scrollByCards(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
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
        {developments.map((development) => (
          <div key={development.id} className="w-full flex-shrink-0 snap-start sm:h-[520px]">
            <Card development={development} hero />
          </div>
        ))}
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

/** Home block that takes the place of the old "Destacados" section: same
    masonry / slider layouts, fed with developments instead of properties. */
export default function FeaturedDevelopments({ developments }: { developments: DevelopmentSummary[] }) {
  return developments.length >= MASONRY_MIN ? (
    <Masonry developments={developments} />
  ) : (
    <Slider developments={developments} />
  );
}
