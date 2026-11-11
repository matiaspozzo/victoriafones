import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DevelopmentCard from "@/components/DevelopmentCard";
import LeadForm from "@/components/LeadForm";
import PageHeader from "@/components/PageHeader";
import ResponsiveHero from "@/components/ResponsiveHero";
import { getDevelopments } from "@/lib/api";
import { ALL_PROPERTIES_HERO } from "@/lib/heroes";
import { breadcrumbJsonLd, buildAlternates, canonicalFor } from "@/lib/seo";

const PATHNAME = "/desarrollos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Developments" });

  return {
    title: `${t("title")} | Victoria Fones Real Estate`,
    description: t("metaDescription"),
    alternates: {
      canonical: canonicalFor(locale, PATHNAME),
      languages: buildAlternates(PATHNAME),
    },
  };
}

export default async function DevelopmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Developments" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  const cta = await getTranslations({ locale, namespace: "SearchCta" });
  const { data: developments } = await getDevelopments(locale).catch(() => ({ data: [] }));

  const breadcrumbs = [
    { name: tNav("home"), url: canonicalFor(locale, "/") },
    { name: t("title"), url: canonicalFor(locale, PATHNAME) },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <ResponsiveHero desktop={ALL_PROPERTIES_HERO} mobile={ALL_PROPERTIES_HERO} />
      <PageHeader title={t("title")} description={t("intro")} />

      <section className="mx-auto max-w-7xl px-6 pb-16">
        {developments.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {developments.map((development) => (
              <DevelopmentCard key={development.id} development={development} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-brand-text/70">{t("empty")}</p>
        )}
      </section>

      <section className="bg-[#eeeeec] text-brand-primary">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 lg:gap-16 lg:px-12">
          <div>
            <h2 className="font-heading text-[2rem] font-bold leading-tight">{cta("title")}</h2>
            <hr className="my-8 max-w-xs border-brand-primary/25" />
            <p className="max-w-md font-bold">{cta("text")}</p>
          </div>
          <div>
            <LeadForm />
          </div>
        </div>
      </section>
    </main>
  );
}
