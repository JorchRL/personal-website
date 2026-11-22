// Blog posts: content/blog/<slug>.md or content/blog/<slug>.mdx, images in
// public/blog/<slug>/. Both kinds share the frontmatter, the listing and every
// machine form; an .mdx body is parsed here, so a syntax error fails every
// loader with its file and line.

import { readFileSync } from "node:fs";
import path from "node:path";
import { draftsBuilt, isAiDraft } from "./drafts";
import { describer, mdxToMarkdown, parseMdx } from "./mdx-plain";
import { postPlain } from "./blog-components/plain";
import { postFiles, postFrontmatter, readContentFile, type Post } from "./schema";

export type { Post, PostFormat, PostMeta } from "./schema";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const WORDS_PER_MINUTE = 220;

/** Reads every post in `dir`, newest first. Throws on invalid frontmatter, an MDX syntax error or a slug used twice. */
export function readPosts(dir: string): Post[] {
  const files = new Map<string, string>();
  return postFiles(dir)
    .map((file): Post => {
      const { slug, data, body } = readContentFile(file, postFrontmatter);
      const name = path.relative(process.cwd(), file);
      const twin = files.get(slug);
      if (twin) throw new Error(`Two posts have the slug "${slug}": ${twin} and ${name}. Keep one of them.`);
      files.set(slug, name);
      const format = file.endsWith(".mdx") ? "mdx" : "md";
      const bodyStart = bodyLine(file);
      const text = format === "mdx" ? mdxToMarkdown(body, parseMdx(body, name, bodyStart), wordsOf(slug)) : body;
      const words = text.split(/\s+/).filter(Boolean).length;
      return {
        slug,
        ...data,
        // The AI draft line keeps a post a draft even with `draft: false`.
        draft: data.draft === true || isAiDraft(body),
        body,
        format,
        file: name,
        bodyStart,
        readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
      };
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.slug.localeCompare(b.slug));
}

/** The lines above a file's body (its frontmatter), so errors give the line in the file. */
function bodyLine(file: string): number {
  const raw = readFileSync(file, "utf8");
  const frontmatter = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)?.[0] ?? "";
  return frontmatter.split("\n").length - 1;
}

/** For counting words: each component as its plain text, a post's own figures included. */
function wordsOf(slug: string) {
  return describer({ postUrl: "", own: postPlain[slug] });
}

/**
 * The published posts, newest first: every listing and machine form (the blog
 * index, the home showcase, RSS, the sitemap, llms.txt, prev/next) reads these.
 * Drafts are never among them.
 */
export function getAllPosts(): Post[] {
  return readPosts(BLOG_DIR).filter((p) => !p.draft);
}

/** A published post. */
export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/**
 * The posts that get a page (and a twin and an Open Graph image): the
 * published ones, plus the drafts where drafts are built (src/content/drafts.ts).
 */
export function getPagePosts(dir = BLOG_DIR): Post[] {
  const built = draftsBuilt();
  return readPosts(dir).filter((p) => !p.draft || built);
}

/** A post that gets a page: published, or a draft where drafts are built. */
export function getPagePost(slug: string): Post | undefined {
  return getPagePosts().find((p) => p.slug === slug);
}

/** The slugs of the .mdx posts that get a page: next.config.ts serves them from src/app/mdx/blog/. */
export function mdxPostSlugs(dir = BLOG_DIR): string[] {
  const pages = new Set(getPagePosts(dir).map((p) => p.slug));
  return postFiles(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.basename(file, ".mdx"))
    .filter((slug) => pages.has(slug));
}
