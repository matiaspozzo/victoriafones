import { Fragment, type ReactNode } from "react";

/**
 * Navy header band used on every internal (non-homepage) page — mirrors the
 * live site's ~220px blue header with the page title in white. Text is editable
 * from the Filament backend (PageSetting), fetched per page and passed in here.
 *
 * Bold segments are configurable from the backend: wrap a word in **double
 * asterisks** (e.g. "Todas las propiedades en **Venta**.") to render it bold,
 * matching the <strong> emphasis the live site uses.
 */
function renderRich(text: string): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="w-full bg-brand-primary text-white">
      <div className="mx-auto flex min-h-[220px] max-w-7xl flex-col justify-center px-6 py-12">
        <h1 className="font-heading text-[2rem] font-normal leading-tight">
          {renderRich(title)}
          {subtitle ? (
            <>
              <br />
              {renderRich(subtitle)}
            </>
          ) : null}
        </h1>
      </div>
    </section>
  );
}
