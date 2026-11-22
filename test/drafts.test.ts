// Drafts (`draft: true`): rendered at their URL where drafts are built (dev, a
// local build, a preview), with a Draft mark and noindex; never in a listing or
// machine form; not built on a production deploy; STRICT_DRAFTS=1 fails the gate.
// Uses the real draft in content/blog/ and the fixtures in test/fixtures/drafts/.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import { GET as twin, generateStaticParams as twinParams } from "@/app/md/blog/[slug]/route";
import { generateStaticParams as mdxParams } from "@/app/mdx/blog/[slug]/page";
import { generateStaticParams as ogParams } from "@/app/blog/[slug]/opengraph-image";
import { AI_DRAFT_LINE, draftsBuilt, draftsFailBuild, isDraftSource } from "@/content/drafts";
import { getAllPosts, getPagePost, getPagePosts, getPost, mdxPostSlugs, readPosts } from "@/content/posts";
import { getAllWork } from "@/content/work";
import { buildLlmsTxt } from "@/seo/llms";
import { buildRss } from "@/seo/rss";
import { PostArticle, postMetadata } from "@/ui/PostArticle";
import { showcase } from "@content/showcase";
import { resolveShowcase } from "@/widgets/showcase/items";

const DRAFT = "learning-by-guided-building-with-ai";
const fixtures = path.join(process.cwd(), "test/fixtures/drafts");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the draft flag", () => {
  it("is read from the frontmatter, false when absent", () => {
    const posts = readPosts(path.join(fixtures, "content/blog"));
    expect(posts.map((p) => [p.slug, p.draft])).toEqual([
      ["work-in-progress", true],
      ["ai-first-draft", true],
      ["published", false],
    ]);
    expect(isDraftSource("---\ntitle: x\ndraft: true\n---\n")).toBe(true);
    expect(isDraftSource("---\ntitle: x\ndraft: false\n---\n")).toBe(false);
    expect(isDraftSource("---\ntitle: x\n---\n")).toBe(false);
  });

  it("builds drafts everywhere but a Vercel production deploy; STRICT_DRAFTS=1 fails the build", () => {
    expect(draftsBuilt({})).toBe(true);
    expect(draftsBuilt({ VERCEL_ENV: "preview" })).toBe(true);
    expect(draftsBuilt({ VERCEL_ENV: "production" })).toBe(false);
    expect(draftsFailBuild({})).toBe(false);
    expect(draftsFailBuild({ STRICT_DRAFTS: "1" })).toBe(true);
  });
});

describe("a draft where drafts are built", () => {
  it("gets a page, a twin and an Open Graph image", () => {
    expect(getPagePost(DRAFT)?.draft).toBe(true);
    expect(mdxParams()).toContainEqual({ slug: DRAFT });
    expect(twinParams()).toContainEqual({ slug: DRAFT });
    expect(ogParams()).toContainEqual({ slug: DRAFT });
    expect(mdxPostSlugs()).toContain(DRAFT);
  });

  it("is in no listing or machine form", () => {
    expect(getAllPosts().map((p) => p.slug)).not.toContain(DRAFT);
    expect(getPost(DRAFT)).toBeUndefined();
    expect(buildRss(getAllPosts())).not.toContain(DRAFT);
    expect(buildLlmsTxt(getAllPosts(), getAllWork())).not.toContain(DRAFT);
    expect(JSON.stringify(sitemap())).not.toContain(DRAFT);
    expect(JSON.stringify(resolveShowcase(showcase))).not.toContain(DRAFT);
    // Named in the showcase, a draft is a post that does not exist.
    expect(() => resolveShowcase([{ kind: "post", slug: DRAFT }])).toThrow(`no post "${DRAFT}"`);
  });

  // Renders every post's page: about 1.3 s alone, past the default 5 s when
  // the machine is busy, so it gets 30 s.
  it(
    "is linked from no published post's prev/next, and shows none itself",
    () => {
      for (const post of getAllPosts()) {
        const html = renderToStaticMarkup(PostArticle({ slug: post.slug, children: null }));
        expect(html, post.slug).not.toContain(`/blog/${DRAFT}`);
      }
      const html = renderToStaticMarkup(PostArticle({ slug: DRAFT, children: null }));
      expect(html).toContain('<mark class="draft-mark">Draft</mark>');
      expect(html).not.toContain("Older post");
      expect(html).not.toContain("Newer post");
    },
    30_000,
  );

  it("carries noindex, in its metadata and on its twin", async () => {
    expect(postMetadata(DRAFT).robots).toEqual({ index: false, follow: false });
    expect(postMetadata(getAllPosts()[0].slug).robots).toBeUndefined();
    const draftTwin = await twin(new Request("http://x"), { params: Promise.resolve({ slug: DRAFT }) });
    expect(draftTwin.headers.get("X-Robots-Tag")).toBe("noindex");
    const published = await twin(new Request("http://x"), { params: Promise.resolve({ slug: getAllPosts()[0].slug }) });
    expect(published.headers.get("X-Robots-Tag")).toBeNull();
  });
});

describe("a first draft written with AI", () => {
  it("is a draft while its line is in the body, even with draft: false", () => {
    expect(isDraftSource(`---\ntitle: x\ndraft: false\n---\n\n*${AI_DRAFT_LINE}*\n`)).toBe(true);
    const post = readPosts(path.join(fixtures, "content/blog")).find((p) => p.slug === "ai-first-draft")!;
    expect(post.draft).toBe(true);
  });

  it("cannot be generated in a production build", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const pages = getPagePosts(path.join(fixtures, "content/blog")).map((p) => p.slug);
    expect(pages).toEqual(["published"]);
    expect(mdxPostSlugs(path.join(fixtures, "content/blog"))).toEqual([]);
  });

  it("the real post carries the line, so it cannot ship as it is", () => {
    expect(getPagePost(DRAFT)!.body).toContain(AI_DRAFT_LINE);
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getPagePost(DRAFT)).toBeUndefined();
  });
});

describe("a draft on a production deploy", () => {
  it("is not built at all", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getPagePost(DRAFT)).toBeUndefined();
    expect(getPagePosts().some((p) => p.draft)).toBe(false);
    expect(mdxPostSlugs()).not.toContain(DRAFT);
    expect(mdxParams()).not.toContainEqual({ slug: DRAFT });
    expect(twinParams()).not.toContainEqual({ slug: DRAFT });
    expect(ogParams()).not.toContainEqual({ slug: DRAFT });
  });
});

describe("the build gate and drafts", () => {
  const script = path.join(process.cwd(), "scripts/todo-report.mjs");
  const run = (env: Record<string, string>) =>
    spawnSync("node", [script, "--gate", "--root", fixtures], {
      encoding: "utf8",
      env: { ...process.env, STRICT_TODOS: "", STRICT_DRAFTS: "", VERCEL_ENV: "", ...env },
    });

  it("passes a production deploy whose only TODOs are in a draft, leaving the draft out", () => {
    const production = run({ VERCEL_ENV: "production" });
    expect(production.status).toBe(0);
    expect(production.stdout).toContain(
      "left out of this production build: content/blog/ai-first-draft.md, content/blog/work-in-progress.mdx",
    );
  });

  it("counts a draft's TODOs where drafts are built", () => {
    const strict = run({ STRICT_TODOS: "1" });
    expect(strict.status).toBe(1);
    expect(strict.stderr).toContain("content/blog/work-in-progress.mdx:3");
  });

  it("fails under STRICT_DRAFTS=1 while any draft exists, naming it", () => {
    for (const env of [{ STRICT_DRAFTS: "1" }, { STRICT_DRAFTS: "1", VERCEL_ENV: "production" }] as Record<string, string>[]) {
      const result = run(env);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("STRICT_DRAFTS=1");
      expect(result.stderr).toContain("content/blog/work-in-progress.mdx");
    }
  });

  it("passes a local build and says the draft is rendered but listed nowhere", () => {
    const local = run({});
    expect(local.status).toBe(0);
    expect(local.stdout).toContain("rendered at their URLs and listed nowhere");
  });
});
