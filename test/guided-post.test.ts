// The post "Learning by guided building with AI" and its three diagrams: it
// compiles; each diagram's face (the HTML a reader without JavaScript gets)
// and its plain text in the markdown twin hold every word of the diagram; the
// twin holds no JSX; the live parts render their first state; every example
// is labelled as simplified.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AI_DRAFT_LINE } from "@/content/drafts";
import { compileMdx } from "@/content/Mdx";
import { componentsFor } from "@/content/mdx-components";
import { getPagePost } from "@/content/posts";
import { dial, loop, scaffold } from "@/content/blog-components/learning-by-guided-building-with-ai/data";
import { DialFace, LoopFace, ScaffoldFace } from "@/content/blog-components/learning-by-guided-building-with-ai/Faces";
import { dialPlain, loopPlain, scaffoldPlain } from "@/content/blog-components/learning-by-guided-building-with-ai/plain";
import ScaffoldComesDown from "@/content/blog-components/learning-by-guided-building-with-ai/ScaffoldComesDown";
import TheDial from "@/content/blog-components/learning-by-guided-building-with-ai/TheDial";
import TheLoop from "@/content/blog-components/learning-by-guided-building-with-ai/TheLoop";
import { postMarkdown } from "@/seo/twins";

const SLUG = "learning-by-guided-building-with-ai";

/** Every string in a diagram's data that a reader sees. */
function strings(value: unknown, skip = new Set(["id", "who", "types", "reviews", "code", "mark", "title"])): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((v) => strings(v, skip));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => (skip.has(k) ? [] : strings(v, skip)));
  }
  return [];
}

/** Text without its `code` marks, spaces collapsed. */
const marks = (s: string) => s.replace(/`/g, "").replace(/\s+/g, " ").trim();

/** An HTML page's text: tags gone, entities decoded, `code` marks dropped, spaces collapsed. */
const flat = (s: string) =>
  marks(
    s
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, "&"),
  );

const figures = [
  { name: "TheLoop", data: loop, Face: LoopFace, plain: loopPlain },
  { name: "ScaffoldComesDown", data: scaffold, Face: ScaffoldFace, plain: scaffoldPlain },
  { name: "TheDial", data: dial, Face: DialFace, plain: dialPlain },
];

describe("the post", () => {
  it("compiles, with its three diagrams, and no script", async () => {
    const post = getPagePost(SLUG)!;
    expect(post.draft).toBe(true);
    const Content = await compileMdx(post);
    const html = renderToStaticMarkup(createElement(Content, { components: componentsFor(SLUG) }));
    expect(html).not.toContain("<script");
    for (const mark of ["Fig. 1", "Fig. 2", "Fig. 3"]) expect(html).toContain(mark);
    expect(html).toContain('class="gb gb-loop" data-stage="all"');
    expect(html).toContain('class="gb gb-fade" data-level="all"');
    expect(html).toContain('class="gb gb-dialfig" data-setting="all"');
  });

  it("opens with the line that marks it as an AI first draft", () => {
    const body = getPagePost(SLUG)!.body.trim();
    expect(body.split("\n")[0]).toBe(`*${AI_DRAFT_LINE}*`);
  });

  it("is a first draft of prose, with the gaps only Jorge can fill marked as TODOs", () => {
    const body = getPagePost(SLUG)!.body;
    const words = body.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThan(900);
    expect(words).toBeLessThan(1500);
    expect(body).toContain("TODO(jorge): compared with coding alone");
    expect(body).not.toMatch(/ — /); // no em-dash flourishes in the prose
  });

  it("has a twin with no JSX, every diagram as plain text, and no TODO", () => {
    const md = postMarkdown(getPagePost(SLUG)!);
    expect(md).not.toMatch(/<[A-Z][A-Za-z]*[\s/>]/);
    expect(md).not.toContain("TODO(jorge)");
    for (const f of figures) expect(md).toContain(f.plain());
  });

  it("labels every example as simplified", () => {
    for (const stage of loop.stages) if (stage.example) expect(stage.example.label).toMatch(/^Simplified example/);
  });
});

describe.each(figures)("$name", ({ data, Face, plain }) => {
  const expected = [...new Set(strings(data).map(marks).filter(Boolean))];

  it("its face holds every word of the diagram", () => {
    const html = flat(renderToStaticMarkup(createElement(Face)));
    expect(expected.filter((s) => !html.includes(s))).toEqual([]);
  });

  it("its plain text holds every word of the diagram", () => {
    const text = marks(plain());
    expect(expected.filter((s) => !text.includes(s))).toEqual([]);
  });
});

describe("the live parts' first state", () => {
  it("Fig. 1 opens on Discuss, one stage highlighted", () => {
    const html = renderToStaticMarkup(createElement(TheLoop));
    expect(html).toContain('data-stage="discuss"');
    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
    expect(html).toContain("Next: Prototype");
  });

  it("Fig. 2 opens on guided, Fig. 3 on by hand, each a radio group", () => {
    const scaffoldHtml = renderToStaticMarkup(createElement(ScaffoldComesDown));
    expect(scaffoldHtml).toContain('data-level="guided"');
    expect(scaffoldHtml.match(/type="radio"/g)).toHaveLength(3);
    const dialHtml = renderToStaticMarkup(createElement(TheDial));
    expect(dialHtml).toContain('data-setting="hand"');
    expect(dialHtml.match(/type="radio"/g)).toHaveLength(3);
  });
});
