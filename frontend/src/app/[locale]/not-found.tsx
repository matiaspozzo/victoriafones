import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SetNavbarStyle } from "@/components/NavbarStyleContext";

// Next.js doesn't pass route params to a not-found.tsx boundary, so the
// locale here comes from next-intl's request-scoped detection (same as
// every other server call below) rather than a `params` prop.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return {
    title: `${t("title")} | Victoria Fones Real Estate`,
    robots: { index: false, follow: true },
  };
}

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main>
      <SetNavbarStyle style="blue" />
      <section className="relative flex min-h-[70vh] items-center text-brand-primary">
        <Image src="/brand/search-cta.jpg" alt="" fill priority className="object-cover grayscale" sizes="100vw" />
        <div className="absolute inset-0 bg-[#eeeeec]/90" />

        <div className="relative mx-auto w-full max-w-2xl px-6 py-24 text-center">
          <p className="font-label text-sm uppercase tracking-wide text-brand-primary/60">{t("eyebrow")}</p>
          <h1 className="mt-3 font-heading text-[2rem] font-bold leading-tight text-brand-primary sm:text-[2.5rem]">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-brand-text">{t("text")}</p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/propiedades-en-venta"
              className="bg-brand-primary px-10 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-brand-primary/90"
            >
              {t("ctaProperties")}
            </Link>
            <Link
              href="/"
              className="border border-brand-primary px-10 py-3 text-sm font-medium uppercase tracking-wide text-brand-primary hover:bg-brand-primary hover:text-white"
            >
              {t("ctaHome")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
