"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import NavDropdown, { ZONES } from "./NavDropdown";

/** Offcanvas accordion group: main listing link + expandable zone submenu. */
function MobileNavGroup({
  label,
  basePath,
  onNavigate,
}: {
  label: string;
  basePath: "venta" | "alquiler";
  onNavigate: () => void;
}) {
  const tZones = useTranslations("Zones");
  const [expanded, setExpanded] = useState(false);
  const listingPath = basePath === "venta" ? "/propiedades-en-venta" : "/propiedades-en-alquiler";

  return (
    <div className="border-b border-white/10">
      <div className="flex items-center justify-between">
        <Link
          href={listingPath}
          className="flex-1 py-4 text-base font-medium tracking-wide"
          onClick={onNavigate}
        >
          {label}
        </Link>
        <button
          type="button"
          aria-label={`${label} submenu`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex h-12 w-12 items-center justify-center"
        >
          <svg
            viewBox="0 0 12 8"
            className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="overflow-hidden">
          {ZONES.map((zone) => (
            <li key={zone}>
              <Link
                href={`/${basePath}/${zone}`}
                className="block py-2.5 pl-4 text-sm text-white/80 hover:text-white"
                onClick={onNavigate}
              >
                {tZones(zone)}
              </Link>
            </li>
          ))}
          <li aria-hidden className="pb-3" />
        </ul>
      </div>
    </div>
  );
}

export default function Header() {
  const t = useTranslations("Nav");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the offcanvas menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-brand-primary text-white shadow-md">
      {/* Fixed height (h-20 = 80px) so the scroll-driven logo swap never
          changes the header height — that reflow was causing the jitter. */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 lg:px-0">
        {/* Full logo cross-fades into the isologo on scroll: both stay mounted
            (the iso overlays absolutely) so only opacity animates — no reflow. */}
        <Link href="/" className="relative flex items-center">
          <Image
            src="/brand/logo@2x.webp"
            alt="Victoria Fones Real Estate"
            width={220}
            height={48}
            className={`h-auto w-[220px] transition-opacity duration-500 ease-in-out ${
              scrolled ? "opacity-0" : "opacity-100"
            }`}
            priority
          />
          <Image
            src="/brand/iso-white.svg"
            alt="Victoria Fones Real Estate"
            width={40}
            height={40}
            className={`absolute left-0 h-10 w-10 transition-opacity duration-500 ease-in-out ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 pr-6 lg:flex">
          <Link href="/" className="text-sm font-medium tracking-wide hover:text-brand-secondary">
            {t("home")}
          </Link>
          <NavDropdown label={t("sales")} basePath="venta" />
          <NavDropdown label={t("rentals")} basePath="alquiler" />
          <Link href="/quienes-somos" className="text-sm font-medium tracking-wide hover:text-brand-secondary">
            {t("about")}
          </Link>
          <Link href="/mapa" className="text-sm font-medium tracking-wide hover:text-brand-secondary">
            {t("map")}
          </Link>
          <Link
            href="/contacto"
            className="border border-white/60 px-5 py-2 text-sm font-medium tracking-wide hover:border-brand-secondary hover:text-brand-secondary"
          >
            {t("contact")}
          </Link>
          <LocaleSwitcher />
        </nav>

        <button
          type="button"
          className="lg:hidden"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Offcanvas panel */}
      <nav
        className={`fixed inset-y-0 right-0 z-[70] flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-brand-primary px-6 pb-8 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-20 flex-shrink-0 items-center justify-between">
          <Image src="/brand/iso-white.svg" alt="" width={32} height={32} className="h-8 w-8" />
          <button
            type="button"
            className="relative -mr-2 flex h-10 w-10 items-center justify-center"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <span className="absolute block h-0.5 w-6 rotate-45 bg-white" />
            <span className="absolute block h-0.5 w-6 -rotate-45 bg-white" />
          </button>
        </div>

        <Link
          href="/"
          className="border-b border-white/10 py-4 text-base font-medium tracking-wide"
          onClick={() => setMenuOpen(false)}
        >
          {t("home")}
        </Link>

        <MobileNavGroup label={t("sales")} basePath="venta" onNavigate={() => setMenuOpen(false)} />
        <MobileNavGroup label={t("rentals")} basePath="alquiler" onNavigate={() => setMenuOpen(false)} />

        <Link
          href="/quienes-somos"
          className="border-b border-white/10 py-4 text-base font-medium tracking-wide"
          onClick={() => setMenuOpen(false)}
        >
          {t("about")}
        </Link>
        <Link
          href="/mapa"
          className="border-b border-white/10 py-4 text-base font-medium tracking-wide"
          onClick={() => setMenuOpen(false)}
        >
          {t("map")}
        </Link>

        <Link
          href="/contacto"
          className="mt-8 border border-white/60 px-5 py-3 text-center text-sm font-medium uppercase tracking-wide"
          onClick={() => setMenuOpen(false)}
        >
          {t("contact")}
        </Link>

        <div className="mt-auto pt-10">
          <LocaleSwitcher variant="inline" />
        </div>
      </nav>
    </header>
  );
}
