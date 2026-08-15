import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HeroVideo from "@/components/HeroVideo";
import FeaturedPropertiesMasonry from "@/components/FeaturedPropertiesMasonry";
import FeaturedPropertiesSlider from "@/components/FeaturedPropertiesSlider";
import NeighborhoodGrid from "@/components/NeighborhoodGrid";
import { getProperties } from "@/lib/api";
import { buildAlternates, canonicalFor } from "@/lib/seo";

// Masonry needs enough cards to fill the columns without looking sparse;
// below this threshold a slider reads better.
const MASONRY_MIN = 5;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalFor(locale, "/"),
      languages: buildAlternates("/"),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      // A child's `openGraph` object isn't deep-merged with the root
      // layout's default — declaring one here without `images` would lose
      // the site's default share image, not just override title/description.
      images: [{ url: "/brand/og.jpg", width: 1200, height: 675 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: ["/brand/og.jpg"],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Home");

  const featured = await getProperties(locale, { featured: "1", per_page: "6" }).catch(
    () => ({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } })
  );

  return (
    <main>
      <HeroVideo />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="md:w-1/2">
          <h1 className="font-heading text-[32px] font-light leading-[1.2] tracking-[1.2px] text-brand-primary">
            {t.rich("aboutTitle", { b: (chunks) => <strong className="font-medium">{chunks}</strong> })}
          </h1>
          <Link
            href="/propiedades-en-venta"
            className="mt-6 inline-block text-sm font-medium uppercase tracking-wide text-brand-primary hover:underline"
          >
            {t("heroCta")}
          </Link>
        </div>
        <div className="mt-10 space-y-4 text-brand-text md:ml-auto md:w-1/2">
          <p>{t.rich("aboutBody", { b: (chunks) => <strong className="font-semibold">{chunks}</strong> })}</p>
        </div>
      </section>

      {featured.data.length > 0 ? (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-light tracking-[0.8px] text-brand-primary sm:text-[2rem]">
                  {t("featuredTitle")}
                </h2>
                <p className="mt-1 text-brand-text/80">{t("featuredSubtitle")}</p>
              </div>
              <Link
                href="/nuestras-propiedades"
                className="hidden flex-shrink-0 items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-secondary sm:flex"
              >
                {t("featuredViewAll")} ›
              </Link>
            </div>

            {featured.data.length >= MASONRY_MIN ? (
              <FeaturedPropertiesMasonry properties={featured.data} />
            ) : (
              <FeaturedPropertiesSlider properties={featured.data} />
            )}
          </div>
        </section>
      ) : null}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-light tracking-[0.8px] text-brand-primary sm:text-[2rem]">
            {t("salesTitle")}
          </h2>

          <div className="mt-10">
            <NeighborhoodGrid locale={locale} />
          </div>
        </div>
      </section>
    </main>
  );
}
