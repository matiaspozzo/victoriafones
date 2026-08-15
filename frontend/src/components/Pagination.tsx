import { getTranslations } from "next-intl/server";
// Plain next/link, not next-intl's typed one: these hrefs are always a bare
// "?query=string" relative to the current (already-localized) page — no
// pathname translation needed, and next-intl's <Link> only accepts hrefs
// from routing.ts's `pathnames` map.
import Link from "next/link";

/** Builds `?key=value&...&page=N` from the current search params, preserving
    every filter already applied (zona, type, price range, etc). */
function hrefForPage(params: Record<string, string | undefined>, page: number): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") qs.set(key, value);
  }
  if (page > 1) qs.set("page", String(page));
  const query = qs.toString();
  return query ? `?${query}` : "?";
}

export default async function Pagination({
  locale,
  currentPage,
  lastPage,
  params,
}: {
  locale: string;
  currentPage: number;
  lastPage: number;
  params: Record<string, string | undefined>;
}) {
  if (lastPage <= 1) return null;

  const t = await getTranslations({ locale, namespace: "Listing" });

  // Keep it to at most 7 page links: first, last, current ±1, with "…" gaps —
  // avoids an unusable wall of numbers on listings with many pages.
  const pages = new Set<number>([1, lastPage, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < lastPage) pages.add(currentPage + 1);
  const sorted = [...pages].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b);

  const linkClass =
    "flex h-10 min-w-10 items-center justify-center border border-brand-text/20 px-3 text-sm text-brand-text/80 hover:border-brand-primary hover:text-brand-primary";
  const activeClass =
    "flex h-10 min-w-10 items-center justify-center border border-brand-primary bg-brand-primary px-3 text-sm font-semibold text-white";

  return (
    <nav aria-label={t("pagination")} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link href={hrefForPage(params, currentPage - 1)} className={linkClass}>
          {t("previousPage")}
        </Link>
      ) : null}

      {sorted.map((page, index) => {
        const prev = sorted[index - 1];
        const gap = prev !== undefined && page - prev > 1;

        return (
          <span key={page} className="flex items-center gap-2">
            {gap ? <span className="px-1 text-brand-text/50">…</span> : null}
            {page === currentPage ? (
              <span className={activeClass}>{page}</span>
            ) : (
              <Link href={hrefForPage(params, page)} className={linkClass}>
                {page}
              </Link>
            )}
          </span>
        );
      })}

      {currentPage < lastPage ? (
        <Link href={hrefForPage(params, currentPage + 1)} className={linkClass}>
          {t("nextPage")}
        </Link>
      ) : null}
    </nav>
  );
}
