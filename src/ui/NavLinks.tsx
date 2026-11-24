"use client";

// The running head's sections. The one you are in carries aria-current (an
// accent rule under it). Without JavaScript the links are the same, unmarked.
// The list comes from the server (Header), so a section hidden on this build
// (shownSections) is hidden in the HTML and after hydration alike.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { shownSections } from "./sections";

export function NavLinks({ sections }: { sections: ReturnType<typeof shownSections> }) {
  const path = usePathname() ?? "";
  return (
    <ol>
      {sections.map((s) => {
        const here = path === s.href || path.startsWith(`${s.href}/`);
        return (
          <li key={s.href}>
            <Link href={s.href} aria-current={here ? (path === s.href ? "page" : "true") : undefined}>
              <sup aria-hidden="true">{s.no}</sup>
              {s.label}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
