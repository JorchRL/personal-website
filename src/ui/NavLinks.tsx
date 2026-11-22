"use client";

// The running head's sections. The one you are in carries aria-current (an
// accent rule under it). Without JavaScript the links are the same, unmarked.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "./sections";

export function NavLinks() {
  const path = usePathname() ?? "";
  return (
    <ol>
      {sections.map((s, i) => {
        const here = path === s.href || path.startsWith(`${s.href}/`);
        return (
          <li key={s.href}>
            <Link href={s.href} aria-current={here ? (path === s.href ? "page" : "true") : undefined}>
              <sup aria-hidden="true">{String(i + 1).padStart(2, "0")}</sup>
              {s.label}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
