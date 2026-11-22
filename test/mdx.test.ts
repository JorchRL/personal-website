// MDX posts: they load through the same loaders as markdown posts, compile
// with the same treatment, fail with a file and line, and their twins hold no
// JSX. The sample post lives in test/fixtures/mdx/blog/ and is never published.
// Markdown posts render byte for byte as they did before MDX existed
// (test/fixtures/markdown-before/, captured from the commit before it).

import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/content/Markdown";
import { compileMdx } from "@/content/Mdx";
import { componentsFor, mdxComponents, postComponent } from "@/content/mdx-components";
import { parseMdx } from "@/content/mdx-plain";
import { getPagePosts, getPost, mdxPostSlugs, readPosts } from "@/content/posts";
import { mdxPlain, postMarkdown } from "@/seo/twins";

const fixtures = path.join(process.cwd(), "test/fixtures/mdx");
const samplePosts = () => readPosts(path.join(fixtures, "blog"));
const sample = () => samplePosts().find((p) => p.slug === "sample-explainer")!;

async function html(post: { slug: string; body: string; file: string }): Promise<string> {
  const Content = await compileMdx(post);
  return renderToStaticMarkup(createElement(Content, { components: componentsFor(post.slug) }));
}

/** KaTeX keeps each formula's source in a MathML <annotation>; leave it out of text checks. */
const text = (markup: string) =>
  markup
    .replace(/<annotation[\s\S]*?<\/annotation>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

describe("MDX posts load like markdown posts", () => {
  it("reads .md and .mdx posts through one loader, with the same fields", () => {
    const posts = samplePosts();
    expect(posts.map((p) => [p.slug, p.format])).toEqual([
      ["sample-explainer", "mdx"],
      ["a-markdown-post", "md"],
    ]);
    const [mdx, md] = posts;
    expect(Object.keys(mdx).sort()).toEqual(Object.keys(md).sort());
    expect(mdx.file).toBe("test/fixtures/mdx/blog/sample-explainer.mdx");
    expect(mdx.tags).toEqual(["test", "waves"]);
    expect(mdx.readingMinutes).toBe(1);
  });

  it("fails on a slug used by both an .md and an .mdx file, naming both", () => {
    expect(() => readPosts(path.join(fixtures, "duplicate"))).toThrow(
      'Two posts have the slug "same": test/fixtures/mdx/duplicate/same.md and test/fixtures/mdx/duplicate/same.mdx',
    );
  });

  it("fails on an MDX syntax error with the file, the line and how to escape", () => {
    let message = "";
    try {
      readPosts(path.join(fixtures, "broken"));
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/^test\/fixtures\/mdx\/broken\/broken-explainer\.mdx:10:\d+: MDX syntax error: /);
    expect(message).toContain("escape it (\\< or \\{)");
  });

  it("refuses import and export: components come from the map only", () => {
    const post = { slug: "x", file: "x.mdx", body: 'import Evil from "../evil"\n\nText.' };
    expect(() => parseMdx("Export of goods fell.\n\nexport of goods fell.", "x.mdx")).toThrow(
      'x.mdx:3:8: MDX syntax error: Could not parse import/exports with acorn\n  Hint: a paragraph that starts with the word import or export is read as code: write the word {"import"}.',
    );
    return expect(compileMdx(post)).rejects.toThrow("x.mdx:1: import and export are not allowed");
  });

  it("serves every .mdx post, and only those, from the MDX route", () => {
    expect(mdxPostSlugs(path.join(fixtures, "blog"))).toEqual(["sample-explainer"]);
    expect(mdxPostSlugs().sort()).toEqual(getPagePosts().filter((p) => p.format === "mdx").map((p) => p.slug).sort());
  });
});

describe("compiling an MDX post", () => {
  it("fails on a component posts cannot use, naming the file and line", async () => {
    const at = (body: string) => compileMdx({ slug: "x", file: "x.mdx", body });
    await expect(at("Text.\n\n<Chart />")).rejects.toThrow("x.mdx:3: <Chart> is not a component posts can use");
    await expect(at('<Toy slug="ripple-tank" />')).rejects.toThrow("x.mdx:1: <Toy> is not a component posts can use");
  });

  it("gives the sample the treatment of a markdown post", async () => {
    const out = await html(sample());
    // Headings get ids from their text; the code is highlighted by Shiki; maths is KaTeX.
    expect(out).toContain('<h2 id="waves-on-a-plate">Waves on a plate</h2>');
    expect(out).toContain('<h3 id="the-step-in-code">The step in code</h3>');
    expect(out).toMatch(/<pre class="shiki paper"[^>]*><code><span class="line">/);
    expect(out).toContain('<span class="katex-display">');
    expect(out).toMatch(/<span class="katex"><span class="katex-mathml">/);
    expect(out).toContain('<code class="nowrap">--reload</code>');
    // Pictures load lazily; an image-only link is named; footnotes; the TODO is marked, even in an Aside.
    expect(out).toContain('<img src="/blog/webgl-or-how-to-draw-a-single-point-the-hard-way/20f6f3ce-c936-445e-bbde-26365a079ae0.png" alt="The plate&#x27;s first frame" loading="lazy" decoding="async"/>');
    expect(out).toContain('alt="Buy me a coffee"');
    expect(out).toContain('data-footnotes="true"');
    expect(out).toContain('<mark class="todo">TODO(jorge): a sentence still to write</mark>');
    expect(out).toContain('<div class="mdx-aside" role="note"><p class="label">Aside</p><p>A side note with <strong>bold</strong>');
    // Figures are numbered: the demo is Fig. 1, the picture Fig. 2, its size read from the file.
    expect(out).toContain('<b>Fig. 1</b> Strike the plate to start a ring of waves.');
    expect(out).toContain('<b>Fig. 2</b> The tank&#x27;s first frame.');
    expect(out).toContain('width="1150" height="1202"');
    expect(out).not.toContain("<script");
  });

  it("puts all of the post's text in the HTML", async () => {
    const post = sample();
    const out = text(await html(post));
    for (const sentence of [
      "This post exists only for the tests.",
      "Waves on a plate",
      "written inline.",
      "Strike the plate to start a ring of waves.",
      "write a brace as { or { and a less-than as < in text.",
      "A side note with bold text and a link.",
      "A claim with a footnote.",
      "The footnote’s text.",
    ]) {
      expect(out.replace(/[’']/g, "’")).toContain(sentence.replace(/[’']/g, "’"));
    }
  });

  it("renders a post's own component as its static face until it loads", () => {
    const Part = postComponent(() => Promise.resolve({ default: () => createElement("p", null, "live") }));
    const out = renderToStaticMarkup(createElement(Part, { n: 2 }, createElement("p", null, "The static face.")));
    expect(out).toBe('<div class="live-slot" data-live="face"><p>The static face.</p></div>');
  });

  it("lists every shared component in the map", () => {
    expect(Object.keys(mdxComponents)).toEqual(["Figure", "Aside", "Demo"]);
  });

  it("compiles every real .mdx post", async () => {
    for (const post of getPagePosts().filter((p) => p.format === "mdx")) await compileMdx(post);
  });
});

describe("the MDX post's machine forms", () => {
  it("its twin is readable markdown with no JSX, each component a plain line", () => {
    const twin = postMarkdown(sample());
    expect(twin).not.toMatch(/<[A-Z]|<\/[A-Z]|\{"|className=/);
    expect(twin).toContain(
      "Interactive figure: Strike the plate to start a ring of waves. — https://jrlgs.dev/blog/sample-explainer\n\n![A plate at rest](https://jrlgs.dev/blog/webgl-or-how-to-draw-a-single-point-the-hard-way/20f6f3ce-c936-445e-bbde-26365a079ae0.png)",
    );
    expect(twin).toContain("> A side note with **bold** text and a [link](https://jrlgs.dev/blog).\n\n## A picture");
    expect(twin).toContain("![Waves crossing the plate in a beam.](https://jrlgs.dev/blog/webgl-or-how-to-draw-a-single-point-the-hard-way/20f6f3ce-c936-445e-bbde-26365a079ae0.png)\n\nThe tank's first frame.");
    expect(twin).toContain("write a brace as \\{ or { and a less-than as \\< in text.");
    expect(twin).toContain("$$\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u$$");
    expect(twin).toContain("```ts\nfunction step(");
    expect(twin).not.toContain("TODO(jorge)");
  });

  it("a post's own component becomes its fallback, framed by its Demo's line", () => {
    const body = [
      "Before.",
      "",
      '<Demo caption="Two waves add up.">',
      "  <WaveSum n={2}>",
      "    ![Two waves](/blog/x/sum.png)",
      "  </WaveSum>",
      "</Demo>",
      "",
      "<Bare />",
    ].join("\n");
    expect(mdxPlain({ slug: "x", file: "x.mdx", body })).toBe(
      [
        "Before.",
        "",
        "Interactive figure: Two waves add up. — https://jrlgs.dev/blog/x",
        "",
        "![Two waves](/blog/x/sum.png)",
        "",
        "Interactive figure — https://jrlgs.dev/blog/x",
      ].join("\n"),
    );
  });
});

describe("markdown posts are untouched by MDX", () => {
  const before = path.join(process.cwd(), "test/fixtures/markdown-before");
  for (const slug of [
    "100-post-of-code-2-one-time-pad-encryption",
    "thinking-with-types-building-a-fsm-for-my-pokedexs-ui",
    "webgl-or-how-to-draw-a-single-point-the-hard-way",
  ]) {
    it(`${slug}: the same HTML and twin, byte for byte`, async () => {
      const post = getPost(slug)!;
      expect(post.format).toBe("md");
      expect(await renderMarkdown(post.body)).toBe(readFileSync(path.join(before, `${slug}.html`), "utf8"));
      expect(postMarkdown(post)).toBe(readFileSync(path.join(before, `${slug}.twin.md`), "utf8"));
    });
  }
});
