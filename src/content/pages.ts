// The about page and the Now widget: content/about.md and content/now.md,
// plain markdown with no frontmatter. A core fact in them is written as
// {{site.<key>}} (for example {{site.lookingFor}}) and filled in from
// content/site.ts, so it is worded the same everywhere.

import { readFileSync } from "node:fs";
import path from "node:path";
import { site } from "@content/site";

function readPage(name: string): string {
  return fillSiteFacts(readFileSync(path.join(process.cwd(), "content", name), "utf8"), name);
}

/** Replaces each {{site.<key>}} with that string from content/site.ts; throws on an unknown key. */
export function fillSiteFacts(text: string, from = "content"): string {
  return text.replace(/\{\{\s*site\.(\w+)\s*\}\}/g, (_, key: string) => {
    const value = (site as Record<string, unknown>)[key];
    if (typeof value !== "string") throw new Error(`${from}: {{site.${key}}} is not a string in content/site.ts`);
    return value;
  });
}

export function getAbout(): string {
  return readPage("about.md");
}

export function getNow(): string {
  return readPage("now.md");
}

/** content/now.md split for the Now section: its first paragraph (the month) and the rest. */
export function getNowParts(): { dateline: string; body: string } {
  const [dateline, ...rest] = getNow().trim().split(/\n\s*\n/);
  return { dateline: dateline.trim(), body: rest.join("\n\n") };
}
