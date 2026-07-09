import type { Metadata } from "next";
import { Anaheim, Montserrat, Raleway } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildAlternates, SITE_URL } from "@/lib/seo";
import "../globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Anaheim — the font the live site uses for property prices.
const anaheim = Anaheim({
  variable: "--font-anaheim",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Victoria Fones Real Estate",
  description: "Inmobiliaria en José Ignacio, Punta del Este, Uruguay.",
  alternates: {
    languages: buildAlternates("/"),
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Victoria Fones Real Estate",
  url: SITE_URL,
  telephone: "+598 9470 7314",
  email: "info@victoriafones.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Galería Los Caracoles. Sainz Martinez y Los Biguá",
    addressLocality: "José Ignacio",
    addressCountry: "UY",
  },
  sameAs: ["https://www.instagram.com/victoriafones.realestate"],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${montserrat.variable} ${raleway.variable} ${anaheim.variable} antialiased`}>
        {/* Browsers restore the last scroll position on reload by default. Since this
            property/page height isn't fixed (varies with content, e.g. photo count),
            a restored position can land past the new page's height and get clamped
            to the bottom. Opt out so every hard refresh starts at the top instead. */}
        <script
          dangerouslySetInnerHTML={{ __html: "if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }" }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
