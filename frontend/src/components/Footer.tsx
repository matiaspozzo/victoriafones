import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const PHONE = "+598 9470 7314";
const PHONE_HREF = "+59894707314";
const EMAIL = "info@victoriafones.com";
const INSTAGRAM_URL = "https://www.instagram.com/victoriafones.realestate";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-[#eeeeec] text-brand-text">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <Image
          src="/brand/logo-azul@2x.webp"
          alt="Victoria Fones Real Estate"
          width={200}
          height={44}
          className="h-auto w-[200px]"
        />

        <div className="text-[0.75rem]">
          <p>{t("addressLine")}</p>
          <p className="font-semibold text-brand-primary">{t("addressCity")}</p>
        </div>

        <div className="text-[0.75rem]">
          <p>{t("phoneLabel")}</p>
          <a
            href={`tel:${PHONE_HREF}`}
            className="inline-block -my-1.5 py-1.5 font-semibold text-brand-primary underline"
          >
            {PHONE}
          </a>
        </div>

        <div className="text-[0.75rem]">
          <p>
            {t("instagramLabel").replace("Instagram", "")}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block -my-1.5 py-1.5 font-semibold text-brand-primary underline"
            >
              Instagram
            </a>
          </p>
          <a href={`mailto:${EMAIL}`} className="inline-block -my-1.5 py-1.5 text-brand-primary">
            {EMAIL}
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <a
            href={`https://wa.me/${PHONE_HREF.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center text-brand-primary"
            aria-label="WhatsApp"
          >
            {/* Font Awesome's "whatsapp" brand glyph (fa-brands fa-whatsapp), same
                technique as the fa-bed/fa-bath icons in PropertyStats.tsx: the
                real FA vector path recreated inline, no FA library dependency. */}
            <svg viewBox="0 0 448 512" className="h-[42px] w-[42px] fill-current">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
          </a>

          <p className="text-[11px] leading-snug text-brand-text/85">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
