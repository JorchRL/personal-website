// The events that mean a contact may be coming, sent through Vercel Analytics
// (`track`; no cookies). Which link sends which: an explicit `data-track` on
// the link wins; otherwise the link's address decides.

import { site } from "@content/site";

export const CONTACT_EVENTS = [
  "contact_email",
  "cv_open",
  "cv_download",
  "outbound_linkedin",
  "outbound_github",
  "door_hiring",
  "door_contract",
] as const;

export type ContactEvent = (typeof CONTACT_EVENTS)[number];

const isEvent = (name: string | null | undefined): name is ContactEvent =>
  !!name && (CONTACT_EVENTS as readonly string[]).includes(name);

const host = (url: URL) => url.hostname.replace(/^www\./, "").toLowerCase();

/**
 * The event a click on a link sends, or null. `href` is the link's resolved
 * address; `explicit` its data-track attribute.
 */
export function contactEvent(href: string, explicit?: string | null): ContactEvent | null {
  if (isEvent(explicit)) return explicit;
  if (!URL.canParse(href)) return null;
  const url = new URL(href);
  if (url.protocol === "mailto:") return url.pathname.toLowerCase() === site.email ? "contact_email" : null;
  const linkedin = new URL(site.social.linkedin);
  const github = new URL(site.social.github);
  const own = new URL(site.url);
  if (host(url) === host(linkedin) && url.pathname.toLowerCase().startsWith(linkedin.pathname.toLowerCase())) {
    return "outbound_linkedin";
  }
  if (host(url) === host(github) && url.pathname.toLowerCase().startsWith(github.pathname.toLowerCase())) {
    return "outbound_github";
  }
  // The site's own pages: on any host (localhost, a preview deploy).
  const local = host(url) === host(own) || url.origin === globalThis.location?.origin;
  if (local && /^\/cv\/?$/.test(url.pathname)) return "cv_open";
  if (local && /\.pdf$/i.test(url.pathname) && /\/cv/i.test(url.pathname)) return "cv_download";
  return null;
}
