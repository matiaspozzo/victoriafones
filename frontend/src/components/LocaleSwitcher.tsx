"use client";

import { useLocale, useTranslations } from "next-intl";
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
            onClick={() => router.replace(pathname, { locale: loc })}
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
        className="flex items-center gap-1 text-sm font-semibold tracking-wide text-white"
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
                    router.replace(pathname, { locale: loc });
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
