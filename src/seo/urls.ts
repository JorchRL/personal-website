// Absolute URLs for everything a machine reads: RSS, llms.txt, JSON-LD,
// markdown twins, canonical links.

import { site } from "@content/site";

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, site.url).toString().replace(/\/$/, "");
}

export const postPath = (slug: string) => `/blog/${slug}`;
export const workPath = (slug: string) => `/work/${slug}`;
