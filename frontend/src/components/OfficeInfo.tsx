import { getTranslations } from "next-intl/server";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import { OFFICE } from "@/lib/office";

/**
 * Address/phone/Instagram/email + a map pin for the office — used on both the
 * property detail page's contact section and the Contacto page. phoneLabel/
 * instagramLabel reuse the Footer namespace (same office info, already
 * localized there) rather than duplicating translation keys.
 */
export default async function OfficeInfo({
  locale,
  mapClassName = "min-h-[280px] flex-1",
}: {
  locale: string;
  mapClassName?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <div className="flex flex-col gap-6 text-sm text-brand-text">
      <div className="space-y-3">
        <p>
          {OFFICE.addressLine} <span className="font-bold text-brand-primary">{OFFICE.city}</span>
        </p>
        <p>
          {t("phoneLabel")}{" "}
          <a href={`tel:${OFFICE.phoneHref}`} className="font-bold text-brand-primary">
            {OFFICE.phone}
          </a>
        </p>
        <p>
          {t("instagramLabel").replace("Instagram", "")}
          <a
            href={OFFICE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-primary underline"
          >
            Instagram
          </a>
          <br />
          <a href={`mailto:${OFFICE.email}`} className="text-brand-primary">
            {OFFICE.email}
          </a>
        </p>
      </div>
      <PropertyLocationMap
        lat={OFFICE.lat}
        lng={OFFICE.lng}
        title="Victoria Fones Real Estate"
        className={mapClassName}
        popupTitle="Victoria Fones Real Estate"
        popupSubtitle={`${OFFICE.addressLine} ${OFFICE.city}`}
      />
    </div>
  );
}
