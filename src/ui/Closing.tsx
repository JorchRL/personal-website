// The end of a post or a work page: who made it (the role line),
// his availability and how to reach him, so a reader who got to the bottom
// knows what to do next.

import Link from "next/link";
import { site } from "@content/site";
import { Profiles } from "./Profiles";

type Props = {
  label: string;
  className?: string;
  /** Where the CV button goes: /cv, or a work page's own entry on it (/cv#<slug>). */
  cv?: string;
};

export function Closing({ label, className = "", cv = "/cv" }: Props) {
  return (
    <aside className={`closing grid ${className}`.trim()} aria-label="About the author">
      <span className="label">{label}</span>
      <div className="who">
        <b>{site.name}</b>
        <p>{site.role}</p>
        <p className="status">{site.availability}</p>
        <p className="actions">
          <a className="btn btn-primary" href={`mailto:${site.email}`}>
            Email me <span className="k" aria-hidden="true">→</span>
          </a>
          <Link className="btn" href={cv} prefetch={false}>
            CV <span className="k" aria-hidden="true">↗</span>
          </Link>
        </p>
      </div>
      <div className="reach">
        <span className="label">Get in touch</span>
        <a className="mail" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <Profiles />
      </div>
    </aside>
  );
}
