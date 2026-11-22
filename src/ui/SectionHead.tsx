// A numbered section's head: its number, its title (h2), an optional "more"
// link and an optional note under the title.

import Link from "next/link";

type Props = {
  no?: string;
  id: string;
  title: string;
  more?: { href: string; label: string; prefetch?: boolean };
  note?: React.ReactNode;
};

export function SectionHead({ no, id, title, more, note }: Props) {
  return (
    <header className="sec-head grid">
      <span className="no" aria-hidden="true">
        {no}
      </span>
      <h2 id={`h-${id}`}>{title}</h2>
      {more && (
        <Link className="more" href={more.href} prefetch={more.prefetch}>
          {more.label}
        </Link>
      )}
      {note && <p className="note mono">{note}</p>}
    </header>
  );
}

/** A row's number inside section `no`: "2.1", "2.2" … (or "1", "2" … outside a section). */
export function sub(no: string | undefined, index: number): string {
  const n = Number(no);
  return Number.isFinite(n) && no ? `${n}.${index + 1}` : String(index + 1);
}
