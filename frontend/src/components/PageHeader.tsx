import { Fragment, type ReactNode } from "react";

/**
 * Page title block shown below the hero photo on every internal (non-homepage)
 * page. Text is editable from the Filament backend (PageSetting/Neighborhood),
 * fetched per page and passed in here.
 *
 * A minimal markdown-style subset lets admins format text from a plain
 * Textarea/TextInput, no HTML/rich-editor involved: **bold**, __underline__,
 * *italic*. Bold is checked before italic in the alternation below, so
 * "**word**" always wins over misreading it as two adjacent "*"s.
 */
function renderRich(text: string): ReactNode {
  const pattern = /\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const [full, bold, underline, italic] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, index)}</Fragment>);
    }

    if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-bold">
          {bold}
        </strong>
      );
    } else if (underline !== undefined) {
      nodes.push(<u key={key++}>{underline}</u>);
    } else {
      nodes.push(<em key={key++}>{italic}</em>);
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

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
