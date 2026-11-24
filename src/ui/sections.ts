// The site's sheets, numbered in one place. The sections are in the running
// head and the title block; /cv and /work-with-me follow them, linked from the
// pages. A sheet's number is its place among the sheets this build shows (Work
// is Sheet 01), so hiding one renumbers the ones after it.

export const sections = [
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/toys", label: "Toys" },
  { href: "/art", label: "Art" },
  { href: "/about", label: "About" },
];

/** The sheets after the sections: not in the running head. */
export const laterSheets = [
  { href: "/cv", label: "CV" },
  { href: "/work-with-me", label: "Work with me" },
];

// /toys is built by hand, in progress: hidden on the public site until it is
// ready (CLAUDE.md, "Hiding /toys"). Flip TOYS_PUBLIC to true to publish it.
const TOYS_PUBLIC = false;

type Env = Record<string, string | undefined>;
type Sheet = { href: string; label: string; no: string };

/** Whether this build shows /toys: everywhere but a Vercel production deploy, until TOYS_PUBLIC is true. */
export function toysShown(env: Env = process.env): boolean {
  return TOYS_PUBLIC || env.VERCEL_ENV !== "production";
}

const shown = (env: Env) => (s: { href: string }) => s.href !== "/toys" || toysShown(env);
const numbered = (list: { href: string; label: string }[]): Sheet[] =>
  list.map((s, i) => ({ ...s, no: String(i + 1).padStart(2, "0") }));

/** Every sheet this build shows, numbered: the sections shown, then the later sheets. */
export function shownSheets(env: Env = process.env): Sheet[] {
  return numbered([...sections.filter(shown(env)), ...laterSheets]);
}

/** The sections this build links to, each with its sheet number ("03"). */
export function shownSections(env: Env = process.env): Sheet[] {
  return shownSheets(env).filter((s) => sections.some((t) => t.href === s.href));
}

/**
 * A sheet's number on this build: "04". A hidden sheet (its page a 404) gets
 * the number it has when shown, so a page under it still renders.
 */
export function sheetNo(href: string, env: Env = process.env): string {
  const sheet =
    shownSheets(env).find((s) => s.href === href) ??
    numbered([...sections, ...laterSheets]).find((s) => s.href === href);
  if (!sheet) throw new Error(`No sheet for ${href} (src/ui/sections.ts)`);
  return sheet.no;
}

/** A page's label in its head: "Sheet 04 — Art". */
export function sheetLabel(href: string, env: Env = process.env): string {
  const { label } = [...sections, ...laterSheets].find((s) => s.href === href) ?? { label: "" };
  return `Sheet ${sheetNo(href, env)} — ${label}`;
}
