// Work pages: content/work/<slug>.md, listed by their `order` field.

import path from "node:path";
import { markdownFiles, readContentFile, workFrontmatter, type Work } from "./schema";

export type { Work, WorkMeta } from "./schema";

const WORK_DIR = path.join(process.cwd(), "content/work");

/** Reads every work page in `dir`, by `order`. Throws on invalid frontmatter. */
export function readWork(dir: string): Work[] {
  return markdownFiles(dir)
    .map((file) => {
      const { slug, data, body } = readContentFile(file, workFrontmatter);
      return { slug, ...data, body };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function getAllWork(): Work[] {
  return readWork(WORK_DIR);
}

export function getWork(slug: string): Work | undefined {
  return getAllWork().find((w) => w.slug === slug);
}

/** The first sentence of a description: the one-line "what it is" in tables. */
export function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0] : text;
}
