"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

// MapLibre (+ its CSS and the basemap tiles) is heavy, so it is not part of
// the home page's bundle at all: the chunk is only requested once the visitor
// presses the button. `ssr: false` because it needs WebGL / the DOM.
const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => <div className="h-[480px] w-full animate-pulse bg-brand-accent lg:h-[620px]" aria-hidden />,
});

/** Home block with the interactive map, loaded on demand. */
export default function HomeMapSection() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [active, setActive] = useState(false);

  return (
    <div>
      {active ? (
        <PropertyMap locale={locale} embedded />
      ) : (
        <div className="relative h-[480px] w-full overflow-hidden bg-brand-accent lg:h-[620px]">
          <Image
            src="/brand/map-preview.webp"
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 1216px, 100vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-brand-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <button
              type="button"
              onClick={() => setActive(true)}
              className="bg-brand-primary px-8 py-4 text-sm font-medium uppercase tracking-wide text-white shadow-lg transition-colors hover:bg-brand-primary/90"
            >
              {t("mapOpen")}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-right">
        <Link
          href="/mapa"
          className="text-sm font-medium text-brand-primary hover:text-brand-secondary"
        >
          {t("mapFull")} ›
        </Link>
      </div>
    </div>
  );
}
