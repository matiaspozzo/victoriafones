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
    <footer className="bg-brand-accent text-brand-text">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
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
          <a href={`tel:${PHONE_HREF}`} className="font-semibold text-brand-primary underline">
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
              className="font-semibold text-brand-primary underline"
            >
              Instagram
            </a>
          </p>
          <a href={`mailto:${EMAIL}`} className="text-brand-primary">
            {EMAIL}
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <a
            href={`https://wa.me/${PHONE_HREF.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center bg-[#25D366] text-white"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
              <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.393.7 4.62 1.902 6.49L4 29l7.71-1.87A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.628 3 16.001 3Zm0 21.6c-1.98 0-3.83-.55-5.41-1.5l-.39-.23-4.58 1.11 1.14-4.46-.25-.4A9.57 9.57 0 0 1 6.4 15c0-5.3 4.3-9.6 9.6-9.6 5.3 0 9.6 4.3 9.6 9.6 0 5.3-4.3 9.6-9.6 9.6Zm5.27-7.19c-.29-.14-1.7-.84-1.96-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.9 1.11-.17.19-.33.21-.62.07-.29-.14-1.2-.44-2.29-1.4-.85-.75-1.42-1.68-1.59-1.97-.17-.29-.02-.44.13-.58.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.1-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43 0 1.43 1.03 2.81 1.17 3 .14.19 2.03 3.1 4.93 4.35.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.11.56-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.33Z" />
            </svg>
          </a>

          <p className="text-[0.5rem] leading-snug text-brand-text/60">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
