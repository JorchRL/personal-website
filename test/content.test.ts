import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllPosts, getPost, readPosts } from "@/content/posts";
import { getAllWork, getWork, readWork } from "@/content/work";
import { getAbout, getNow } from "@/content/pages";
import { renderMarkdown } from "@/content/Markdown";
import { mdxPlain } from "@/seo/twins";

const root = process.cwd();
const fixtures = path.join(root, "test/fixtures");

describe("frontmatter validation", () => {
  it("throws an error naming the file and the missing field", () => {
    expect(() => readPosts(path.join(fixtures, "missing-title"))).toThrow(/no-title\.md[\s\S]*title/);
  });

  it("does the same for work pages", () => {
    expect(() => readWork(path.join(fixtures, "missing-role"))).toThrow(/no-role\.md[\s\S]*role/);
  });
});

describe("posts", () => {
  it("lists posts newest first, with the slug taken from the file name", () => {
    const posts = readPosts(path.join(fixtures, "sorting"));
    expect(posts.map((p) => p.slug)).toEqual(["newer", "older"]);
    expect(posts[0].date).toBe("2023-01-15T09:30:00.000Z");
    expect(posts[1].date).toBe("2022-04-10");
    expect(posts[0].tags).toEqual(["two", "three"]);
  });

  it("gives every post a reading time of at least one minute", () => {
    for (const post of [...readPosts(path.join(fixtures, "sorting")), ...getAllPosts()]) {
      expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
    }
  });

  it("gives every real post a description that ends at a sentence or a whole word, never mid-word", () => {
    for (const post of getAllPosts()) {
      expect(post.description, post.slug).not.toMatch(/\.\.\.$/);
      expect(post.description, post.slug).toMatch(/([.!?]["')\]]*|\S…)$/);
      expect(post.description.length, post.slug).toBeGreaterThanOrEqual(60);
    }
  });

  it("sorts the real posts newest first", () => {
    const dates = getAllPosts().map((p) => Date.parse(p.date));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("finds a post by slug, and nothing for an unknown slug", () => {
    expect(getPost("type-signatures-in-haskell")?.title).toBe("Type signatures in Haskell");
    expect(getPost("no-such-post")).toBeUndefined();
  });
});

describe("work", () => {
  it("lists work pages by order", () => {
    const work = readWork(path.join(fixtures, "work"));
    expect(work.map((w) => w.slug)).toEqual(["first", "second"]);
    expect(work[0].links).toEqual([{ label: "Site", href: "https://example.com" }]);
    expect(work[1].links).toBeUndefined();
  });

  it("finds a work page by slug, and nothing for an unknown slug", () => {
    expect(getWork("no-such-work")).toBeUndefined();
  });

  it("has exactly the real work pages", () => {
    expect(getAllWork().map((w) => w.slug).sort()).toEqual(
      ["lumen", "plain-engine", "the-lone-wander", "twinteraction", "whiz-study"],
    );
  });
});

describe("home page content", () => {
  it("states availability, place and time zone in one line", async () => {
    const { site } = await import("@content/site");
    expect(site.availability).toBe(
      "Open to remote roles and contract work, full time, starting now · Mexico City · UTC−6 · full overlap with US hours",
    );
  });

  it("splits now.md into its month and its list", async () => {
    const { getNowParts } = await import("@/content/pages");
    const { dateline, body } = getNowParts();
    expect(dateline).toMatch(/^\w+ \d{4}\.?$/);
    expect(body).toMatch(/^- /m);
  });
});

describe("about and now", () => {
  it("reads both pages as markdown with no frontmatter", () => {
    for (const text of [getAbout(), getNow()]) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text.startsWith("---")).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Every image and internal link in the real content points at something that
// exists. The check reads the rendered HTML, so it sees
// exactly what ships, including Hashnode images fixed up by the pipeline.

type Known = { posts: Set<string>; work: Set<string> };

const STATIC_ROUTES = new Set([
  "/",
  "/blog",
  "/work",
  "/about",
  "/cv",
  "/work-with-me",
  "/rss.xml",
  "/llms.txt",
  "/sitemap.xml",
]);

function knownTargets(): Known {
  return {
    posts: new Set(getAllPosts().map((p) => p.slug)),
    work: new Set(getAllWork().map((w) => w.slug)),
  };
}

/** Why `ref` is broken, or null when it resolves. */
function brokenReason(ref: string, known: Known): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith("//") || ref.startsWith("#")) return null;
  if (!ref.startsWith("/")) return "relative path (use an absolute path from the site root)";
  const pathname = ref.replace(/[?#].*$/, "").replace(/(.)\/$/, "$1");
  if (STATIC_ROUTES.has(pathname)) return null;
  const route = pathname.match(/^\/(blog|work)\/([^/.]+?)(\.md)?$/);
  if (route) {
    const [, section, slug] = route;
    const set = section === "blog" ? known.posts : known.work;
    return set.has(slug) ? null : `no ${section} page "${slug}"`;
  }
  return existsSync(path.join(root, "public", decodeURIComponent(pathname))) ? null : "file missing in public/";
}

async function brokenReferences(file: string, known: Known): Promise<string[]> {
  const raw = readFileSync(file, "utf8");
  const cover = raw.match(/^cover:\s*["']?([^"'\n]+)/m)?.[1];
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, "");
  // An .mdx post is checked through its plain markdown, where a <Figure> is a picture.
  const source = file.endsWith(".mdx") ? mdxPlain({ slug: path.basename(file, ".mdx"), body, file }) : body;
  const html = await renderMarkdown(source);
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) =>
    m[1].replace(/&#x26;|&amp;/g, "&"),
  );
  if (cover) refs.unshift(cover.trim());
  const name = path.relative(root, file);
  return refs.flatMap((ref) => {
    const reason = brokenReason(ref, known);
    return reason ? [`${name}: ${ref} (${reason})`] : [];
  });
}

function contentFiles(): string[] {
  const dirs = ["content/blog", "content/work"].map((d) => path.join(root, d));
  const pages = ["content/about.md", "content/now.md"].map((f) => path.join(root, f));
  return [
    ...dirs.flatMap((dir) =>
      existsSync(dir) ? readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).map((f) => path.join(dir, f)) : [],
    ),
    ...pages.filter((f) => existsSync(f)),
  ];
}

describe("references in the real content", () => {
  it("parses every post and work file", () => {
    expect(() => getAllPosts()).not.toThrow();
    expect(() => getAllWork()).not.toThrow();
    expect(getAllPosts().length).toBeGreaterThan(0);
  });

  it("names each missing image and broken internal link (fixture)", async () => {
    const problems = await brokenReferences(path.join(fixtures, "broken-refs/broken.md"), knownTargets());
    expect(problems).toEqual([
      "test/fixtures/broken-refs/broken.md: /blog/broken/cover-missing.png (file missing in public/)",
      "test/fixtures/broken-refs/broken.md: /blog/broken/missing.png (file missing in public/)",
      'test/fixtures/broken-refs/broken.md: /blog/no-such-post (no blog page "no-such-post")',
    ]);
  });

  // Reads and parses every post and work page: about 1.5 s alone, past the
  // default 5 s when the machine is busy, so it gets 30 s.
  it(
    "has no missing images or broken internal links",
    async () => {
      const known = knownTargets();
      const problems = (await Promise.all(contentFiles().map((f) => brokenReferences(f, known)))).flat();
      expect(problems).toEqual([]);
    },
    30_000,
  );
});

// ---------------------------------------------------------------------------
// Imported Hashnode markdown renders as plain links and images.

/** KaTeX keeps each formula's source in a MathML <annotation>; leave it out of text checks. */
function withoutTexSource(html: string): string {
  return html.replace(/<annotation[\s\S]*?<\/annotation>/g, "");
}

describe("Hashnode syntax", () => {
  const source = readFileSync(path.join(fixtures, "hashnode.md"), "utf8");

  it("renders %[url] embeds as a link", async () => {
    const html = await renderMarkdown(source);
    expect(html).toContain('<a href="https://x.y">https://x.y</a>');
  });

  it("renders raw and markdown images with align attributes as plain images", async () => {
    const html = await renderMarkdown(source);
    expect(html).toMatch(/<img src="\/blog\/hello\/raw\.png" alt="Raw image"[^>]*>/);
    expect(html).toMatch(/<img src="\/blog\/hello\/diagram\.png" alt="Diagram"[^>]*>/);
    expect(html).not.toContain("align=");
  });

  it("turns an embedded frame into a link", async () => {
    const html = await renderMarkdown(source);
    expect(html).not.toContain("<iframe");
    expect(html).toContain('<a href="https://www.youtube.com/embed/abc">https://www.youtube.com/embed/abc</a>');
  });

  it("leaves no raw Hashnode markup outside code", async () => {
    const html = await renderMarkdown(source);
    const outsideCode = html.replace(/<pre[\s\S]*?<\/pre>/g, "");
    expect(outsideCode).not.toContain("%[");
    expect(html).toContain("%[this stays as code]");
  });

  it("closes bold that Hashnode closed after a space", async () => {
    const html = await renderMarkdown("**Of course not! Whose blog is this! **\n\nA `**x **` stays code.");
    expect(html).toContain("<strong>Of course not! Whose blog is this!</strong>");
    expect(html).toContain("<code>**x **</code>");
  });

  it("does not take a line of inline triple-backtick code for a code fence", async () => {
    const html = await renderMarkdown("```npm run dev```\n\n![Shot](/blog/x/shot.png align=\"left\")");
    expect(html).toContain("<code>npm run dev</code>");
    expect(html).toContain('<img src="/blog/x/shot.png" alt="Shot" loading="lazy" decoding="async">');
  });

  it("shows a stray backtick at a line end as a backtick, keeping the code spans after it", async () => {
    const html = await renderMarkdown("it placed `\n`185a2` which in decimal is `99746`.");
    expect(html).toBe("<p>it placed `\n<code>185a2</code> which in decimal is <code>99746</code>.</p>");
  });

  it("drops %%[widget] paragraphs (the old blog's follow button and donation footers)", async () => {
    const html = await renderMarkdown("Maybe follow me?\n\n%%[twitter-follow]\n\n%%[money-footer]\n%%[crypto-footer]");
    expect(html).toBe("<p>Maybe follow me?</p>");
  });

  it("links a Hashnode mention @[Name](@handle) to the person's Hashnode profile", async () => {
    const html = await renderMarkdown("Thanks to my friend @[Miki Szeles](@mszeles) for this.");
    expect(html).toBe('<p>Thanks to my friend <a href="https://hashnode.com/@mszeles">Miki Szeles</a> for this.</p>');
  });

  it("typesets \\(inline\\) maths, also across a line break, and leaves a single $ alone", async () => {
    // In markdown, \\( is an escaped backslash: the text Hashnode's MathJax read was \(.
    const html = await renderMarkdown("Take \\\\(a_i \\in A\\\\) and \\\\(9 =\n10^1 - 1\\\\), then run `-v $PWD` or pay $5.");
    expect(html.match(/<span class="katex">/g)).toHaveLength(2);
    expect(html).not.toContain("katex-display");
    expect(withoutTexSource(html)).not.toContain("\\(");
    expect(html).toContain("$PWD");
    expect(html).toContain("pay $5.");
  });

  it("typesets $$display$$ maths, inline or fenced, with escapes read as Hashnode read them", async () => {
    const html = await renderMarkdown(
      "$$v_{t_0}=\\frac{x}{t}$$\n\n$$\n\\begin{align}\n&(1) \\quad a\\\\\\\\ \n&(2) \\quad b\n\\end{align}\n$$",
    );
    expect(html.match(/class="katex-display"/g)).toHaveLength(2);
    expect(html).not.toContain("$$");
    expect(html).not.toContain("katex-error");
    expect(html).not.toContain("eqn-num"); // MathJax on Hashnode numbered no equations
  });

  it("typesets a bare \\begin{align} block, and maths broken by a hard line break", async () => {
    const html = await renderMarkdown(
      "\\begin{align}\na &= c \\\\\\\\\nb &= d\n\\end{align}\n\n$$\n\\begin{align}\n&(4) \\quad B_2(t) = B_2(k)\\\n\\end{align}\n$$",
    );
    expect(html.match(/class="katex-display"/g)).toHaveLength(2);
    expect(withoutTexSource(html)).not.toContain("\\begin");
    expect(html).not.toContain("katex-error");
  });

  it("loads the KaTeX stylesheet from the same version that renders the maths", () => {
    const require = createRequire(import.meta.url);
    const ours = require("katex/package.json").version;
    const rehypeKatexDir = realpathSync(path.join(root, "node_modules/rehype-katex"));
    const theirs = createRequire(path.join(rehypeKatexDir, "index.js"))("katex/package.json").version;
    expect(ours).toBe(theirs);
  });

  it("typesets a matrix with \\hline, and rows ended \\\\\\ at a line end (KaTeX allows \\hline only in an array)", async () => {
    const html = await renderMarkdown(
      "$$\n\\begin{matrix}\n1 & 1 \\\\\\\n1 & 0\\\\\\\n\\\\hline\n0 & 1\n\\end{matrix}\n$$",
    );
    expect(html).not.toContain("katex-error");
    expect(html.match(/<mtr>/g)).toHaveLength(3);
  });

  it("does not typeset maths inside code", async () => {
    const html = await renderMarkdown("`\\(x\\)` and\n\n```text\n$$y$$\n```");
    expect(html).not.toContain("katex");
  });

  it("shows `code` in a raw HTML table cell as code, as Hashnode did", async () => {
    const html = await renderMarkdown("<table>\n  <tr>\n    <th>`gasLeft()` in</th>\n  </tr>\n</table>");
    expect(html).toContain("<th><code>gasLeft()</code> in</th>");
  });

  it("highlights a code block whose language is capitalised", async () => {
    const html = await renderMarkdown("```TypeScript\nconst a: number = 1;\n```");
    expect(html).toContain("--shiki-token-keyword");
  });

  it("moves headings down a level when the body has an h1, leaving the page title the only h1", async () => {
    expect(await renderMarkdown("# One\n\n## Two\n\n### Three")).toBe("<h2>One</h2>\n<h3>Two</h3>\n<h4>Three</h4>");
    expect(await renderMarkdown("## Two\n\n### Three")).toBe("<h2>Two</h2>\n<h3>Three</h3>");
  });

  it("leaves no Hashnode markup or maths source in the real posts, outside code", async () => {
    const leftovers = /%%?\[|\\\(|\$\$|\\begin\{|\salign=|katex-error/;
    for (const post of getAllPosts()) {
      const html = await renderMarkdown(post.body);
      const prose = withoutTexSource(html).replace(/<pre[\s\S]*?<\/pre>/g, "").replace(/<code[\s\S]*?<\/code>/g, "");
      expect(prose.match(leftovers)?.[0], post.slug).toBeUndefined();
    }
  });

  it("highlights code blocks at build time", async () => {
    const html = await renderMarkdown("```ts\nconst a: number = 1;\n```\n\n```nosuchlang\nplain\n```");
    expect(html).toContain('class="shiki');
    expect(html).toContain("--shiki-token-keyword");
    expect(html).toContain("plain");
  });
});

describe("inline code", () => {
  it("keeps a short flag with a hyphen on one line, and leaves long code and code with spaces alone", async () => {
    const html = await renderMarkdown(
      "Run `--reload` or `npm run dev --watch`.\n\n`a-very-long-identifier-that-should-be-allowed-to-wrap`",
    );
    expect(html).toContain('<code class="nowrap">--reload</code>');
    expect(html).toContain("<code>npm run dev --watch</code>");
    expect(html).toContain("<code>a-very-long-identifier-that-should-be-allowed-to-wrap</code>");
    expect(html.match(/nowrap/g)).toHaveLength(1);
  });
});

describe("images in posts", () => {
  it("load lazily, so a long post with many pictures does not fetch them all at once", async () => {
    const html = await renderMarkdown('![A](/blog/x/a.png)\n\n<img src="/blog/x/b.png" alt="B">');
    expect(html.match(/loading="lazy" decoding="async"/g)).toHaveLength(2);
  });

  it("name a link whose only content is an image without alt: the coffee button by its name", async () => {
    const html = await renderMarkdown(
      '<a href="https://www.buymeacoffee.com/jorchRL" target="_blank"> <img src="/blog/x/b.svg" /> </a>',
    );
    expect(html).toMatch(/<a href="https:\/\/www\.buymeacoffee\.com\/jorchRL"[^>]*> <img src="\/blog\/x\/b\.svg"[^>]* alt="Buy me a coffee"/);
  });

  it("name any other image-only link by its address, and leave named images and links alone", async () => {
    const html = await renderMarkdown(
      [
        "[![](/blog/x/a.png)](https://www.example.com/page)",
        "[![](/blog/x/c.png)](/blog/other-post)",
        "[![Diagram](/blog/x/d.png)](https://example.com)",
        '<a href="https://example.com"><img src="/blog/x/e.png"> Read more</a>',
        "![](/blog/x/f.png)",
      ].join("\n\n"),
    );
    expect(html).toMatch(/<img src="\/blog\/x\/a\.png" alt="example\.com"/);
    expect(html).toMatch(/<img src="\/blog\/x\/c\.png" alt="\/blog\/other-post"/);
    expect(html).toMatch(/<img src="\/blog\/x\/d\.png" alt="Diagram"/);
    expect(html).not.toMatch(/<img src="\/blog\/x\/e\.png" alt=/);
    expect(html).toMatch(/<img src="\/blog\/x\/f\.png" alt=""/);
  });

  it("leave no link without a name in any post", async () => {
    const unnamed: string[] = [];
    for (const post of getAllPosts()) {
      const html = await renderMarkdown(post.body);
      for (const [, inner] of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
        const text = inner.replace(/<[^>]*>/g, "").trim();
        const alts = [...inner.matchAll(/<img\b[^>]*\balt="([^"]*)"/g)].map((m) => m[1].trim()).join("");
        if (!text && !alts) unnamed.push(`${post.slug}: ${inner.slice(0, 80)}`);
      }
    }
    expect(unnamed).toEqual([]);
  });
});
