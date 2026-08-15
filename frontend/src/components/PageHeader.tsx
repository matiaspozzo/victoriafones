import { renderRich } from "@/lib/richText";

/**
 * Page title block shown below the hero photo on every internal (non-homepage)
 * page. Text is editable from the Filament backend (PageSetting/Neighborhood),
 * fetched per page and passed in here.
 */
export default function PageHeader({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle?: string;
  /** Body-text line below the title, styled like the homepage intro's paragraph
      (not part of the <h1> — unlike `subtitle`, which is a second heading line). */
  description?: string;
}) {
  return (
    <section className="w-full text-brand-primary">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className={`font-heading text-[2rem] font-normal leading-tight ${description ? "pb-16" : ""}`}>
          {renderRich(title)}
          {subtitle ? (
            <>
              <br />
              {renderRich(subtitle)}
            </>
          ) : null}
        </h1>
        {description ? (
          <p className="mt-4 whitespace-pre-line text-brand-text md:ml-auto md:w-1/2">{renderRich(description)}</p>
        ) : null}
      </div>
    </section>
  );
}
