// Absolute URLs for everything a machine reads: RSS, llms.txt, JSON-LD,
// markdown twins, canonical links.

import { site } from "@content/site";

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, site.url).toString().replace(/\/$/, "");
}

export const postPath = (slug: string) => `/blog/${slug}`;
export const workPath = (slug: string) => `/work/${slug}`;
export const TOYS_PATH = "/toys";
export const toyPath = (slug: string) => `${TOYS_PATH}/${slug}`;
export const ART_PATH = "/art";
export const artPath = (slug: string) => `${ART_PATH}/${slug}`;
