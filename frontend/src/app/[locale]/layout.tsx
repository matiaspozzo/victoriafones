import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Raleway } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import RawScripts from "@/components/RawScripts";
import { getPageHeader, getSiteSettings } from "@/lib/api";
import { OFFICE } from "@/lib/office";
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

// Fallback metadata for any route that doesn't set its own (currently none —
// every page defines its own title/description) and, more importantly, the
// source every page's <head> inherits `openGraph`/`twitter` from unless it
// sets those keys itself: only the property detail page and neighborhood
// zone pages with a custom og_image do, so this default share image is what
// actually shows up when the home page, listings, Quiénes Somos, Contacto,
// etc. get shared on WhatsApp/social — those had no image preview before.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return {
    metadataBase: new URL(SITE_URL),
    title: "Victoria Fones Real Estate",
    description: t("metaDescription"),
    alternates: {
      languages: buildAlternates("/"),
    },
    openGraph: {
      type: "website",
      siteName: "Victoria Fones Real Estate",
      title: "Victoria Fones Real Estate",
      description: t("metaDescription"),
      images: [{ url: "/brand/og.jpg", width: 1200, height: 675 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Victoria Fones Real Estate",
      description: t("metaDescription"),
      images: ["/brand/og.jpg"],
    },
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Victoria Fones Real Estate",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-azul@2x.webp`,
  image: `${SITE_URL}/brand/logo-azul@2x.webp`,
  telephone: "+598 93 985 888",
  email: "info@victoriafones.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Los Teros 9000",
    postalCode: "20000",
    addressLocality: "Faro de José Ignacio",
    addressRegion: "Maldonado",
    addressCountry: "UY",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: OFFICE.lat,
    longitude: OFFICE.lng,
  },
  areaServed: "José Ignacio, Punta del Este, Uruguay",
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
  const siteSettings = await getSiteSettings(locale);
  const alquilerPage = await getPageHeader(locale, "alquiler");
  const rentalsEnabled = !alquilerPage?.rental_disabled;

  return (
    <html lang={locale}>
      <body className={`${montserrat.variable} ${raleway.variable} antialiased`}>
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

        {siteSettings?.google_analytics_id ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${siteSettings.google_analytics_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteSettings.google_analytics_id}');`}
            </Script>
          </>
        ) : null}

        {siteSettings?.facebook_pixel_id ? (
          <>
            <Script id="fb-pixel-init" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${siteSettings.facebook_pixel_id}');
                fbq('track', 'PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${siteSettings.facebook_pixel_id}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}

        {siteSettings?.additional_scripts ? <RawScripts html={siteSettings.additional_scripts} /> : null}

        <NextIntlClientProvider messages={messages}>
          <Header rentalsEnabled={rentalsEnabled} />
          {children}
          <Footer />
          <WhatsAppFloatButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
