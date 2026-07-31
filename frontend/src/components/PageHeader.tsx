import { Fragment, type ReactNode } from "react";

/**
 * Page title block shown below the hero photo on every internal (non-homepage)
 * page. Text is editable from the Filament backend (PageSetting), fetched per
 * page and passed in here.
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
    <section className="w-full text-brand-primary">
      <div className="mx-auto max-w-7xl px-6 py-10">
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
