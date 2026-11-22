// The first screen: the name, the role line and one proof line, availability,
// the two buttons (Email me, CV) and the contact links. On a 390 × 844 phone
// the name, role, availability and both buttons show without scrolling
// (`pnpm verify` checks the elements marked data-first-screen).

import Link from "next/link";
import { site } from "@content/site";
import { Profiles } from "@/ui/Profiles";
import type { WidgetManifest } from "../types";

export const manifest: WidgetManifest = {
  slug: "intro",
  title: "Intro",
  description: "Who Jorge is, what he is looking for, and how to reach him.",
  size: "full",
  order: 10,
};

const [first, ...rest] = site.name.split(" ");

export function Face() {
  return (
    <section className="hero" aria-labelledby="name">
      <div className="hero-meta grid">
        <span className="l label">Sheet 00 — Profile</span>
        <p className="r mono status" data-first-screen>
          {site.availability}
        </p>
      </div>
      <h1 className="name wipe" id="name" data-first-screen>
        <span className="ln">{first}</span> <span className="ln">{rest.join(" ")}</span>
      </h1>
      <div className="hero-body grid">
        <div className="pitch rise d1">
          <p className="lead" data-first-screen>
            {site.role}
          </p>
          <p className="proof">{site.proof}</p>
          <p className="actions">
            <a className="btn btn-primary" href={`mailto:${site.email}`} data-first-screen>
              Email me <span className="k" aria-hidden="true">→</span>
            </a>
            <Link className="btn" href="/cv" prefetch={false} data-first-screen>
              CV <span className="k" aria-hidden="true">↗</span>
            </Link>
          </p>
        </div>
        <div className="contact rise d2">
          <span className="label">Get in touch</span>
          <a className="mail" href={`mailto:${site.email}`}>
            <i aria-hidden="true">→</i>
            {site.email}
          </a>
          <Profiles />
        </div>
        <div className="side mono rise d3">
          <dl>
            <dt>Based</dt>
            <dd>{site.location}</dd>
            <dt>Works</dt>
            <dd>Remote, {site.timeZone}</dd>
            <dt>Now</dt>
            <dd>Godot 4 · C++</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
