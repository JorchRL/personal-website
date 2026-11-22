// Drafts: a post with `draft: true` in its frontmatter. It renders at its URL
// (with a Draft mark and noindex) wherever drafts are built, so it can be read
// in a local build or a preview, but no listing, feed, sitemap, llms.txt or
// prev/next link names it. A Vercel production deploy does not build drafts at
// all. STRICT_DRAFTS=1 makes the build gate fail while any draft exists.
//
// A post whose body holds AI_DRAFT_LINE is a draft whatever its frontmatter
// says, so a first draft written with AI cannot ship until that line is gone.
//
// No React and no path aliases here: scripts/todo-report.mjs imports it.

import { parse as parseYaml } from "yaml";

type Env = Record<string, string | undefined>;

/** Whether this build renders drafts: everywhere but a Vercel production deploy. */
export function draftsBuilt(env: Env = process.env): boolean {
  return env.VERCEL_ENV !== "production";
}

/** Whether the build gate fails while any draft exists (STRICT_DRAFTS=1). */
export function draftsFailBuild(env: Env = process.env): boolean {
  return env.STRICT_DRAFTS === "1";
}

/** The line at the top of a first draft written with AI; delete it before publishing. */
export const AI_DRAFT_LINE = "First draft written with AI from Jorge's notes, for him to rewrite.";

/** Whether a post's body marks it as a first draft written with AI. */
export function isAiDraft(body: string): boolean {
  return body.includes(AI_DRAFT_LINE);
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

/** Whether a post file's raw text makes it a draft: `draft: true`, or the AI draft line. */
export function isDraftSource(raw: string): boolean {
  if (isAiDraft(raw)) return true;
  const match = raw.match(FRONTMATTER);
  if (!match) return false;
  try {
    const data = parseYaml(match[1]) as { draft?: unknown } | null;
    return data?.draft === true;
  } catch {
    return false;
  }
}
