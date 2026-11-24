// The running head: the name, the sections (numbered) and where Jorge
// is. On a phone the name sits above the sections, which share one ruled row.

import Link from "next/link";
import { site } from "@content/site";
import { NavLinks } from "./NavLinks";
import { shownSections } from "./sections";

export function Header() {
  return (
    <header className="head grid">
      <Link className="who" href="/">
        {site.name}
        <span>{new URL(site.url).host}</span>
      </Link>
      <nav aria-label="Main">
        <NavLinks sections={shownSections()} />
      </nav>
      <div className="where mono">{site.location} · {site.timeZone}</div>
    </header>
  );
}
