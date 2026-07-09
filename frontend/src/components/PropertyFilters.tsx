"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { formatUsd } from "@/lib/format";

const TYPES = ["house", "apartment", "land", "chacra", "commercial"] as const;
const ZONES = ["pueblo-jose-ignacio", "club-de-mar", "pinar-del-faro", "laguna-escondida", "alrededores", "otras-zonas"] as const;
const BEDROOMS = [1, 2, 3, 4, 5] as const;
const BATHROOMS = [1, 2, 3, 4, 5] as const;
const VIEWS = ["cards", "list", "map"] as const;

const STEP = 50000;

const viewIconClass = "h-4 w-4";
const VIEW_ICONS: Record<string, React.ReactNode> = {
  cards: (
    <svg className={viewIconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  list: (
    <svg className={viewIconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="4" width="4" height="4" rx="1" />
      <rect x="9" y="5" width="12" height="2" rx="1" />
      <rect x="3" y="10" width="4" height="4" rx="1" />
      <rect x="9" y="11" width="12" height="2" rx="1" />
      <rect x="3" y="16" width="4" height="4" rx="1" />
      <rect x="9" y="17" width="12" height="2" rx="1" />
    </svg>
  ),
  map: (
    <svg className={viewIconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
    </svg>
  ),
};

export default function PropertyFilters({
  currentType,
  currentBedrooms,
  currentBathrooms,
  currentZone,
  currentSort,
  currentView = "cards",
  currentPriceMin,
  currentPriceMax,
  priceBounds,
  showZone = true,
  showSort = true,
  showView = true,
  showPrice = true,
  compact = false,
}: {
  currentType?: string;
  currentBedrooms?: string;
  currentBathrooms?: string;
  currentZone?: string;
  currentSort?: string;
  currentView?: string;
  currentPriceMin?: string;
  currentPriceMax?: string;
  priceBounds?: { min: number; max: number };
  showZone?: boolean;
  showSort?: boolean;
  showView?: boolean;
  showPrice?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations("Listing");
  const tZones = useTranslations("Zones");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Price slider bounds, rounded out to the step.
  const floor = 0;
  const ceil = Math.max(STEP, Math.ceil((priceBounds?.max ?? 5_000_000) / STEP) * STEP);

  const [minPrice, setMinPrice] = useState(() =>
    currentPriceMin ? Number(currentPriceMin) : floor,
  );
  const [maxPrice, setMaxPrice] = useState(() =>
    currentPriceMax ? Number(currentPriceMax) : ceil,
  );

  const priceTouched = minPrice > floor || maxPrice < ceil;

  const pushWith = useMemo(
    () =>
      (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
          if (!value) params.delete(key);
          else params.set(key, value);
        }
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      },
    [pathname, router, searchParams],
  );

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    pushWith({
      zona: (form.get("zona") as string) || undefined,
      type: (form.get("type") as string) || undefined,
      bedrooms: (form.get("bedrooms") as string) || undefined,
      bathrooms: (form.get("bathrooms") as string) || undefined,
      price_min: priceTouched && minPrice > floor ? String(minPrice) : undefined,
      price_max: priceTouched && maxPrice < ceil ? String(maxPrice) : undefined,
    });
  }

  const labelClass = "pb-1 text-[11px] font-medium uppercase tracking-wide text-brand-text/60";
  const fieldClass = "flex w-full flex-col gap-1 sm:w-auto sm:min-w-[130px] sm:flex-1";
  const selectClass =
    "w-full border border-brand-text/30 bg-white px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none";

  return (
    <div className={`relative ${compact ? "" : "mb-10 border-b border-brand-text/10 pb-8 sm:pb-14"}`}>
      <form onSubmit={applyFilters} className="flex w-full flex-wrap items-end gap-2.5">
        {/* On mobile the selects sit in an even 2-col grid; on desktop `contents`
            dissolves the wrapper so they flow inline in the filter row. */}
        <div className="grid w-full grid-cols-2 gap-2.5 sm:contents">
          {showZone ? (
            <label className={fieldClass}>
              <span className={labelClass}>{t("labelZone")}</span>
              <select name="zona" defaultValue={currentZone ?? ""} className={selectClass}>
                <option value="">{t("allZones")}</option>
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {tZones(zone)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className={fieldClass}>
            <span className={labelClass}>{t("labelType")}</span>
            <select name="type" defaultValue={currentType ?? ""} className={selectClass}>
              <option value="">{t("allTypes")}</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(type)}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldClass}>
            <span className={labelClass}>{t("bedrooms")}</span>
            <select name="bedrooms" defaultValue={currentBedrooms ?? ""} className={selectClass}>
              <option value="">{t("any")}</option>
              {BEDROOMS.map((n) => (
                <option key={n} value={n}>
                  {n === BEDROOMS[BEDROOMS.length - 1] ? `${n}+` : n}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldClass}>
            <span className={labelClass}>{t("bathrooms")}</span>
            <select name="bathrooms" defaultValue={currentBathrooms ?? ""} className={selectClass}>
              <option value="">{t("any")}</option>
              {BATHROOMS.map((n) => (
                <option key={n} value={n}>
                  {n === BATHROOMS[BATHROOMS.length - 1] ? `${n}+` : n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {showPrice ? (
          <div className="flex w-full flex-col gap-1 sm:w-auto sm:min-w-[170px] sm:flex-[1.5]">
            <span className={labelClass}>{t("priceRange")}</span>
            <div className="flex items-center justify-between text-xs text-brand-text/70">
              <span>{formatUsd(minPrice, "es")}</span>
              <span>
                {formatUsd(maxPrice, "es")}
                {maxPrice >= ceil ? "+" : ""}
              </span>
            </div>
            <div className="relative h-5">
              <div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 rounded bg-brand-text/20" />
              <div
                className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded bg-brand-primary"
                style={{
                  left: `${((minPrice - floor) / (ceil - floor)) * 100}%`,
                  right: `${100 - ((maxPrice - floor) / (ceil - floor)) * 100}%`,
                }}
              />
              <input
                type="range"
                aria-label="min price"
                min={floor}
                max={ceil}
                step={STEP}
                value={minPrice}
                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - STEP))}
                className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-primary"
              />
              <input
                type="range"
                aria-label="max price"
                min={floor}
                max={ceil}
                step={STEP}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + STEP))}
                className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-primary"
              />
            </div>
          </div>
        ) : null}

        {showSort ? (
          <label className={fieldClass}>
            <span className={labelClass}>{t("labelSort")}</span>
            <select
              value={currentSort ?? ""}
              onChange={(e) => pushWith({ sort: e.target.value || undefined })}
              className={selectClass}
            >
              <option value="">{t("sortNewest")}</option>
              <option value="price_desc">{t("sortPriceDesc")}</option>
              <option value="price_asc">{t("sortPriceAsc")}</option>
            </select>
          </label>
        ) : null}

        {/* Divider separating the filter inputs from the primary action. */}
        <div className="hidden w-px self-stretch bg-brand-text/20 sm:block" />

        <button
          type="submit"
          className="w-full border border-brand-primary bg-brand-primary px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-brand-primary/90 sm:ml-1 sm:w-auto"
        >
          {t("filter")}
        </button>
      </form>

      {/* View toggle rides on the bottom divider line, right-aligned on desktop. */}
      {showView ? (
        <div className="mt-4 w-full sm:absolute sm:bottom-0 sm:right-0 sm:mt-0 sm:w-auto sm:translate-y-1/2">
          <div className="flex w-full overflow-hidden rounded border border-brand-text/30 bg-white sm:inline-flex sm:w-auto">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => pushWith({ view: v === "cards" ? undefined : v })}
                aria-pressed={currentView === v}
                className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm capitalize transition-colors sm:flex-none ${
                  currentView === v
                    ? "bg-brand-primary text-white"
                    : "bg-white text-brand-text hover:bg-brand-accent"
                }`}
              >
                {VIEW_ICONS[v]}
                {t(v === "cards" ? "viewCards" : v === "list" ? "viewList" : "viewMap")}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
