// An inner page's head, set like the home page's first screen: a meta row
// (the sheet's label on the left, a status on the right), the title, then an
// optional ruled row with a lead line and margin notes.

import type { ReactNode } from "react";

type Props = {
  /** Left of the meta row: the sheet and where it sits ("Sheet 02 — Blog"). */
  label: ReactNode;
  /** Right of the meta row. */
  status?: ReactNode;
  title: ReactNode;
  /** The title's size: "page" for a section index, "article" for a post or work page. */
  kind?: "page" | "article";
  /** Extra classes for the title (long/short). */
  titleClass?: string;
  lead?: ReactNode;
  /** Set the lead as reading prose (a paragraph or two) instead of display type. */
  prose?: boolean;
  /** Margin notes beside the lead (a small mono list). */
  side?: ReactNode;
  /**
   * The title as plain text, when `title` is not a string: on a phone a short
   * title is sized to fit the screen's width on one line.
   */
  fit?: string;
  /** A short text set beside the title (desktop), below it on a phone. */
  aside?: ReactNode;
  children?: ReactNode;
};

export function PageHead({ label, status, title, kind = "page", titleClass = "", lead, prose, side, fit, aside, children }: Props) {
  const text = typeof title === "string" ? title : fit;
  // One word or two, short enough to set on one line at a phone's width.
  const fits = !!text && text.length <= 16;
  return (
    <header className={`page-head ${kind === "article" ? "article-head" : ""}`.trim()}>
      <div className="meta grid">
        <p className="l label">{label}</p>
        {status && <p className="r mono">{status}</p>}
      </div>
      {aside ? (
        <div className="title-row">
          <h1
            className={`page-title ${titleClass} ${fits ? "fit" : ""}`.trim()}
            style={fits ? ({ "--chars": text.length } as React.CSSProperties) : undefined}
          >
            {title}
          </h1>
          <p className="title-aside">{aside}</p>
        </div>
      ) : (
        <h1
          className={`page-title ${titleClass} ${fits ? "fit" : ""}`.trim()}
          style={fits ? ({ "--chars": text.length } as React.CSSProperties) : undefined}
        >
          {title}
        </h1>
      )}
      {(lead || side) && (
        <div className="intro grid">
          {lead && <p className={prose ? "lead prose" : "lead"}>{lead}</p>}
          {side && <div className="side mono">{side}</div>}
        </div>
      )}
      {children}
    </header>
  );
}
