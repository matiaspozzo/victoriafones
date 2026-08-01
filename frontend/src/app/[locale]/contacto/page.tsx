import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeadForm from "@/components/LeadForm";
import OfficeInfo from "@/components/OfficeInfo";
import PageHeader from "@/components/PageHeader";
import ResponsiveHero from "@/components/ResponsiveHero";
import { getPageHeader } from "@/lib/api";
import { ABOUT_HERO } from "@/lib/heroes";
import { buildAlternates, canonicalFor } from "@/lib/seo";

const PATHNAME = "/contacto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  const tContact = await getTranslations({ locale, namespace: "Contact" });

  return {
    title: `${t("contact")} | Victoria Fones Real Estate`,
    description: tContact("metaDescription"),
    alternates: {
      canonical: canonicalFor(locale, PATHNAME),
      languages: buildAlternates(PATHNAME),
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const header = await getPageHeader(locale, "contacto");

  return (
    <main>
      <ResponsiveHero
        desktop={header?.hero_image.desktop ?? ABOUT_HERO}
        mobile={header?.hero_image.mobile ?? ABOUT_HERO}
      />

      <PageHeader
        title={header?.hero_title ?? t("title")}
        subtitle={header?.hero_subtitle ?? t("subtitle")}
      />

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2">
        <LeadForm />
        <OfficeInfo locale={locale} />
      </section>
    </main>
  );
}
