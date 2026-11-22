// 02 Two doors: one for employers (what Jorge is looking for, the roles he fits
// from /about, each linked to its proof there, and the CV), one for contract
// clients (/work-with-me). Each door's button sends its own event.

import Link from "next/link";
import { studioRoles } from "@content/about";
import { hire } from "@content/hire";
import { home } from "@content/home";
import { site } from "@content/site";
import { rolePath } from "@/ui/roles";
import { SectionHead } from "@/ui/SectionHead";
import type { FaceProps, WidgetManifest } from "../types";

export const manifest: WidgetManifest = {
  slug: "doors",
  title: "Two doors",
  description: "Hiring for a role, or looking for a contractor: where to go next.",
  size: "full",
  order: 70,
  section: { id: "doors" },
};

export function Face({ no }: FaceProps) {
  return (
    <section className="sec" id="doors" aria-labelledby="h-doors">
      <SectionHead no={no} id="doors" title="Two doors" />
      <div className="doors grid">
        <div className="door">
          <span className="label">A · Employers</span>
          <h3>{home.hiring.title}</h3>
          <p>{site.lookingFor}</p>
          <ul aria-label="Roles I fit">
            {studioRoles.map(({ role }) => (
              <li key={role}>
                <Link href={rolePath(role)}>{role}</Link>
              </li>
            ))}
          </ul>
          <p className="actions">
            <Link className="btn btn-primary" href="/cv" prefetch={false} data-track="door_hiring">
              Read the CV <span className="k" aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
        <div className="door">
          <span className="label">B · Clients</span>
          <h3>{home.contract.title}</h3>
          <p>
            {home.contract.text} {hire.route}
          </p>
          <p className="actions">
            <Link className="btn btn-primary" href="/work-with-me" prefetch={false} data-track="door_contract">
              Work with me <span className="k" aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
