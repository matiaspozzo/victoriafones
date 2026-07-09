"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LeadForm({
  propertyId,
  defaultSubject,
  variant = "light",
}: {
  propertyId?: number;
  defaultSubject?: string;
  variant?: "light" | "onDark";
}) {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const onDark = variant === "onDark";
  const inputClass = onDark
    ? "w-full border border-white/20 bg-white px-4 py-3 text-brand-text placeholder:text-brand-text/50 focus:outline-none"
    : "mt-1 w-full border border-brand-text/20 bg-[#F9F9F9] px-3 py-2";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "form",
          property_id: propertyId ?? null,
          name: form.get("name"),
          email: form.get("email"),
          message: `${form.get("subject") ? `[${form.get("subject")}] ` : ""}${form.get("message") ?? ""}`,
          locale,
          source_url: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className={onDark ? "text-white" : "text-brand-primary"}>
        {"✓"}{" "}
        {locale === "en"
          ? "Thank you, we'll be in touch."
          : locale === "pt"
            ? "Obrigado, entraremos em contato."
            : "Gracias, nos pondremos en contacto."}
      </p>
    );
  }

  const labelClass = onDark ? "sr-only" : "text-sm text-brand-text";

  return (
    <form onSubmit={handleSubmit} className={onDark ? "space-y-4" : "max-w-md space-y-5"}>
      <div>
        <label className={labelClass}>{t("name")}</label>
        <input name="name" required placeholder={onDark ? t("name") : undefined} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("email")}</label>
        <input type="email" name="email" required placeholder={onDark ? t("email") : undefined} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("subject")}</label>
        <input name="subject" defaultValue={defaultSubject} placeholder={onDark ? t("subject") : undefined} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("message")}</label>
        <textarea name="message" rows={5} placeholder={onDark ? t("message") : undefined} className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className={
          onDark
            ? "border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-brand-primary disabled:opacity-50"
            : "bg-brand-primary px-10 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-brand-primary/90 disabled:opacity-50"
        }
      >
        {t("submit")}
      </button>
      {status === "error" ? (
        <p className={onDark ? "text-sm text-red-200" : "text-sm text-red-600"}>
          {locale === "en" ? "Something went wrong, please try again." : locale === "pt" ? "Algo deu errado, tente novamente." : "Ocurrió un error, intentá de nuevo."}
        </p>
      ) : null}
    </form>
  );
}
