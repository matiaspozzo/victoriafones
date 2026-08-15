import { Fragment, type ReactNode } from "react";

/**
 * A minimal markdown-style subset lets admins format text from a plain
 * Textarea/TextInput, no HTML/rich-editor involved: **bold**, __underline__,
 * *italic*. Bold is checked before italic in the alternation below, so
 * "**word**" always wins over misreading it as two adjacent "*"s.
 */
export function renderRich(text: string): ReactNode {
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
