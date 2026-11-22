// 03 Contact: the email, large; what to include and when Jorge replies; the
// profiles, with rel="me".

import { home } from "@content/home";
import { site } from "@content/site";
import { profiles } from "@/ui/Profiles";
import { SectionHead } from "@/ui/SectionHead";
import type { FaceProps, WidgetManifest } from "../types";

export const manifest: WidgetManifest = {
  slug: "contact",
  title: "Contact",
  description: "Email, LinkedIn, GitHub and X.",
  size: "full",
  order: 80,
  section: { id: "contact" },
};

export function Face({ no }: FaceProps) {
  return (
    <section className="sec" id="contact" aria-labelledby="h-contact">
      <SectionHead no={no} id="contact" title="Contact" />
      <a className="big-mail" href={`mailto:${site.email}`}>
        {site.email}
      </a>
      <div className="contact-row grid">
        <div className="ask">
          <p>{home.include}</p>
          <p className="reply">{home.reply}</p>
        </div>
        <ul aria-label="Profiles">
          {profiles.map((p) => (
            <li key={p.label}>
              <a href={p.href} rel="me">
                <b>{p.label}</b>
                <span className="mono">{p.handle} ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
