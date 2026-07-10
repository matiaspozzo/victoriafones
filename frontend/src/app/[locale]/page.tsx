import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HeroVideo from "@/components/HeroVideo";
import FeaturedPropertiesMasonry from "@/components/FeaturedPropertiesMasonry";
import FeaturedPropertiesSlider from "@/components/FeaturedPropertiesSlider";
import NeighborhoodGrid from "@/components/NeighborhoodGrid";
import { getProperties } from "@/lib/api";

// Masonry needs enough cards to fill the columns without looking sparse;
// below this threshold a slider reads better.
const MASONRY_MIN = 5;

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
      <section className="bg-brand-primary px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-heading text-[2rem] font-medium leading-tight">
            {t("heroTitle")}
            <br />
            {t("heroSubtitle")}
          </h1>
          <Link
            href="/propiedades-en-venta"
            className="mt-8 inline-block border border-white px-6 py-3 text-sm font-medium uppercase tracking-wide hover:bg-white hover:text-brand-primary"
          >
            {t("heroCta")}
          </Link>
        </div>
      </section>

      <HeroVideo />

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-[26px] font-light leading-[1.2] tracking-[1.2px] text-brand-primary">
            {t.rich("aboutTitle", { b: (chunks) => <strong className="font-medium">{chunks}</strong> })}
          </h2>
          <hr className="mt-6 max-w-xs border-brand-text/30" />
          <p className="mt-4 text-xs font-normal uppercase tracking-[2px] text-brand-text/70">
            {t("aboutTag")}
          </p>
        </div>
        <div className="space-y-4 text-brand-text">
          {t("aboutBody")
            .split("\n\n")
            .map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
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
                <p className="mt-1 text-brand-text/70">{t("featuredSubtitle")}</p>
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

      <section className="bg-brand-primary px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-light tracking-[0.8px] sm:text-[2rem]">
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
