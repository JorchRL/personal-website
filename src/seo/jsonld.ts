// JSON-LD for search engines and AI search. Site-wide (layout.tsx): the
// WebSite and the Person who writes it, linked by @id. Per page: a
// ProfilePage (/about), a BlogPosting (each post) and a BreadcrumbList
// (posts and work pages). Render with <JsonLd data={…} /> (src/ui/JsonLd.tsx).

import { site } from "@content/site";
import type { PostMeta } from "@/content/posts";
import { stripTodos } from "@/content/todos";
import { absoluteUrl, postPath } from "./urls";

type JsonLd = Record<string, unknown>;

const PERSON_ID = `${site.url}/#person`;
const WEBSITE_ID = `${site.url}/#website`;

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: "Software engineer",
    description: stripTodos(site.intro),
    homeLocation: { "@type": "Place", name: site.location },
    sameAs: Object.values(site.social),
  } satisfies JsonLd;
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: stripTodos(site.intro),
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  } satisfies JsonLd;
}

/** The site-wide graph: the WebSite and its Person. */
export function siteJsonLd() {
  const strip = (data: JsonLd) => Object.fromEntries(Object.entries(data).filter(([key]) => key !== "@context"));
  return { "@context": "https://schema.org", "@graph": [strip(webSiteJsonLd()), strip(personJsonLd())] } satisfies JsonLd;
}

/** /about: a ProfilePage whose main entity is Jorge. */
export function profilePageJsonLd() {
  const person = Object.fromEntries(Object.entries(personJsonLd()).filter(([key]) => key !== "@context"));
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/about"),
    name: `About ${site.name}`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: person,
  } satisfies JsonLd;
}

/** Home › section › page, as absolute URLs. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: stripTodos(item.name) || item.path,
      item: absoluteUrl(item.path),
    })),
  } satisfies JsonLd;
}

/**
 * A date with its time zone, as schema.org asks. Posts store an ISO date-time
 * in UTC (kept as is) or a plain date, which is read as midnight in Mexico
 * City, where Jorge writes (six hours behind UTC all year: site.timeZone).
 */
export function zonedDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T00:00:00-06:00`;
  if (/T.*(Z|[+-]\d{2}:\d{2})$/.test(date)) return date;
  return new Date(date).toISOString();
}

export function blogPostingJsonLd(post: PostMeta) {
  const url = absoluteUrl(postPath(post.slug));
  const description = stripTodos(post.description);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: stripTodos(post.title),
    ...(description ? { description } : {}),
    datePublished: zonedDate(post.date),
    url,
    mainEntityOfPage: url,
    image: post.cover ? absoluteUrl(post.cover) : `${url}/opengraph-image`,
    keywords: post.tags.map(stripTodos).filter(Boolean),
    inLanguage: "en",
    author: { "@type": "Person", "@id": PERSON_ID, name: site.name, url: site.url },
    isPartOf: { "@id": WEBSITE_ID },
  } satisfies JsonLd;
}

/** JSON for a <script> tag: `<` is escaped so the text can never close the tag. */
export function jsonLdHtml(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
