"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const LABELS: Record<string, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

export default function LocaleSwitcher({ variant = "dropdown" }: { variant?: "dropdown" | "inline" }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // For a dynamic route (e.g. the property detail or a zone page), the
  // canonical pathname alone isn't enough to build the target locale's URL —
  // next-intl also needs the current params (barrio/slug) to fill in the
  // translated template. See next-intl's docs on pathnames + locale
  // switching for this exact `{pathname, params}` pattern.
  const params = useParams();
  const [open, setOpen] = useState(false);

  // Inline variant for the mobile offcanvas: a plain row of the three
  // languages — no hover dropdown (hover doesn't exist on touch).
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-4">
        {routing.locales.map((loc) => (
          <button
            key={loc}
            type="button"
            // @ts-expect-error -- next-intl can't statically verify that
            // `params` matches whichever pathname `usePathname()` returns at
            // runtime; they always correspond to the same route in practice.
            onClick={() => router.replace({ pathname, params }, { locale: loc })}
            className={`text-sm tracking-wide ${
              loc === locale ? "font-semibold text-white underline underline-offset-4" : "text-white/70"
            }`}
          >
            {LABELS[loc]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-semibold tracking-wide text-current"
      >
        {t("language")}
        <svg
          viewBox="0 0 12 8"
          className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full pt-3">
          <ul className="min-w-[150px] overflow-hidden rounded-lg bg-brand-accent py-2 text-sm text-brand-primary shadow-xl">
            {routing.locales.map((loc) => (
              <li key={loc}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    // @ts-expect-error -- see the inline-variant onClick above.
                    router.replace({ pathname, params }, { locale: loc });
                  }}
                  className={`block w-full px-5 py-2.5 text-left hover:bg-white ${
                    loc === locale ? "font-semibold" : ""
                  }`}
                >
                  {LABELS[loc]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
