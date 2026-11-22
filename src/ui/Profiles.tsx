// Jorge's profiles as a ruled list: name · handle · arrow. rel="me" ties each
// profile to this site for the services that check it.

import { site } from "@content/site";

const last = (href: string) => new URL(href).pathname.split("/").filter(Boolean).pop() ?? "";

export const profiles = [
  { label: "LinkedIn", href: site.social.linkedin, handle: `in/${last(site.social.linkedin)}` },
  { label: "GitHub", href: site.social.github, handle: last(site.social.github) },
  { label: "X", href: site.social.x, handle: `@${last(site.social.x)}` },
];

export function Profiles() {
  return (
    <ul className="profiles" aria-label="Profiles">
      {profiles.map((p) => (
        <li key={p.label}>
          <a href={p.href} rel="me">
            <span>{p.label}</span>
            <span>{p.handle}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
