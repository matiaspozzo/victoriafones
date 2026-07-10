import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import { getPageHeader } from "@/lib/api";
import { ABOUT_HERO } from "@/lib/heroes";
import { buildAlternates, canonicalFor } from "@/lib/seo";

type Value = { term: string; desc: string };

const PATHNAME = "/quienes-somos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return {
    title: `${t("title")} | Victoria Fones Real Estate`,
    alternates: {
      canonical: canonicalFor(locale, PATHNAME),
      languages: buildAlternates(PATHNAME),
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const header = await getPageHeader(locale, "quienes-somos");
  const values = t.raw("values") as Value[];

  return (
    <main>
      <PageHeader title={header?.hero_title ?? t("title")} subtitle={header?.hero_subtitle || undefined} />

      <div className="relative h-[320px] w-full overflow-hidden sm:h-[400px]">
        <Image src={ABOUT_HERO} alt="" fill priority className="object-cover" sizes="100vw" />
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[minmax(0,320px)_1fr]">
        <div>
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-gray">
            <Image
              src="/brand/victoria-fones.webp"
              alt={t("personName")}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 320px, 100vw"
            />
          </div>
          <p className="mt-4 font-heading text-lg font-semibold text-brand-primary">
            {t("personName")}
          </p>
          <p className="text-sm text-brand-text/80">{t("personRole")}</p>
        </div>

        <div className="max-w-2xl space-y-8 text-brand-text">
          <p>{t("intro")}</p>

          <div>
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-brand-primary">
              {t("missionTitle")}
            </h2>
            <p className="mt-2">{t("mission")}</p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-brand-primary">
              {t("visionTitle")}
            </h2>
            <p className="mt-2">{t("vision")}</p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-brand-primary">
              {t("valuesTitle")}
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {values.map((value) => (
                <li key={value.term}>
                  <span className="font-semibold text-brand-primary">{value.term}:</span> {value.desc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
