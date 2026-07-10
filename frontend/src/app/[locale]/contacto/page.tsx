import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeadForm from "@/components/LeadForm";
import PageHeader from "@/components/PageHeader";
import { getPageHeader } from "@/lib/api";
import { buildAlternates, canonicalFor } from "@/lib/seo";

const PATHNAME = "/contacto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });

  return {
    title: `${t("contact")} | Victoria Fones Real Estate`,
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
      <PageHeader
        title={header?.hero_title ?? t("title")}
        subtitle={header?.hero_subtitle ?? t("subtitle")}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <LeadForm />
      </section>
    </main>
  );
}
