// The title block: every page ends like a drawing sheet, with who drew it,
// where, how to reach him, the index, his profiles and the revision.

import Link from "next/link";
import { site } from "@content/site";
import { shownSections } from "./sections";
import { profiles } from "./Profiles";

// The month of this build: the sheet's revision.
const revision = new Date().toISOString().slice(0, 7).replace("-", ".");

export function Footer() {
  return (
    <footer className="tblock">
      <div className="wide">
        <span className="label">Drawn by</span>
        <span className="v big">{site.name}</span>
      </div>
      <div>
        <span className="label">Location</span>
        <span className="v">{site.location}</span>
      </div>
      <div>
        <span className="label">Contact</span>
        <a className="v" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </div>
      <div>
        <span className="label">Index</span>
        <nav className="v" aria-label="Footer">
          <ul>
            {shownSections().map((s) => (
              <li key={s.href}>
                <Link href={s.href}>{s.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/cv" prefetch={false}>
                CV
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <span className="label">Elsewhere</span>
        <ul className="v" aria-label="Elsewhere">
          {profiles.map((p) => (
            <li key={p.label}>
              <a href={p.href} rel="me">
                {p.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/rss.xml">RSS</a>
          </li>
        </ul>
      </div>
      <div>
        <span className="label">Rev.</span>
        <span className="v mono">{revision}</span>
      </div>
    </footer>
  );
}
