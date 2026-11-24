// The machine-readable forms: RSS, llms.txt, the markdown twins and JSON-LD.
// None of them may carry a TODO(jorge); every link in them is absolute.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { site } from "@content/site";
import { getAllArt, type Painting } from "@/content/art";
import { getAllPosts, type Post } from "@/content/posts";
import { getAllWork, type Work } from "@/content/work";
import { TodoText } from "@/content/TodoText";
import { buildRss } from "@/seo/rss";
import { buildLlmsTxt } from "@/seo/llms";
import { artMarkdown, postMarkdown, workMarkdown } from "@/seo/twins";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  jsonLdHtml,
  personJsonLd,
  profilePageJsonLd,
  siteJsonLd,
  visualArtworkJsonLd,
  zonedDate,
} from "@/seo/jsonld";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { contactEvent } from "@/ui/contactEvents";
import { generateMetadata as postMetadata } from "@/app/blog/[slug]/page";
import { generateMetadata as workMetadata } from "@/app/work/[slug]/page";
import { pageMetadata } from "@/seo/metadata";

const post = (over: Partial<Post> = {}): Post => ({
  slug: "a-post",
  title: "A post",
  description: "What it is about.",
  date: "2022-03-04T01:43:21.999Z",
  tags: ["maths"],
  body: "Body text with an ![image](/blog/a-post/one.png) and [a link](/work/whiz-study).",
  readingMinutes: 1,
  format: "md",
  file: "content/blog/a-post.md",
  ...over,
});

const work = (over: Partial<Work> = {}): Work => ({
  slug: "a-work",
  title: "A work",
  role: "Main engineer",
  period: "2023–2026",
  stack: ["TypeScript"],
  description: "What it was.",
  order: 1,
  body: "The problem.",
  ...over,
});

const painting = (over: Partial<Painting> = {}): Painting => ({
  slug: "a-painting",
  title: "A painting",
  year: 2026,
  image: "/art/a-painting.jpg",
  alt: "Blue washes over a harbour.",
  paper: "arches",
  paints: ["ultramarine-blue", "white-gouache"],
  available: false,
  fanArt: false,
  body: "A note with [a link](/art).",
  pixels: { width: 2000, height: 1600 },
  ...over,
});

const withTodos = {
  post: post({
    slug: "todo-post",
    title: "Half a title TODO(jorge): the rest",
    tags: ["maths", "TODO(jorge): a tag"],
    description: "Kept sentence. TODO(jorge): a missing fact.",
    body: "Kept. TODO(jorge): missing in the body.",
  }),
  work: work({
    slug: "todo-work",
    period: "TODO(jorge): your years",
    stack: ["TypeScript", "TODO(jorge): the rest of the stack"],
    description: "Kept. TODO(jorge): what you owned.",
    body: "Kept line.\nTODO(jorge): a whole line.",
  }),
  art: painting({
    slug: "todo-painting",
    title: "Kept title",
    year: "TODO(jorge): the year",
    paper: "TODO(jorge): which paper",
    placeholder: "TODO(jorge): a placeholder",
    body: "Kept. TODO(jorge): a line about it.",
  }),
};

describe("RSS", () => {
  it("has one <item> per post, each with an absolute link", () => {
    const posts = getAllPosts();
    const xml = buildRss(posts);
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    expect(items).toHaveLength(posts.length);
    for (const [i, item] of items.entries()) {
      expect(item).toContain(`<link>${site.url}/blog/${posts[i].slug}</link>`);
    }
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
  });

  it("escapes XML and drops every TODO", () => {
    const xml = buildRss([post({ title: "Fish & <chips>" }), withTodos.post]);
    expect(xml).toContain("Fish &amp; &lt;chips&gt;");
    expect(xml).not.toContain("TODO(jorge)");
    expect(xml).toContain("Kept sentence.");
  });
});

describe("llms.txt", () => {
  it("lists every post and work page with its .md URL", () => {
    const posts = getAllPosts();
    const pages = getAllWork();
    const text = buildLlmsTxt(posts, pages, getAllArt());
    expect(text.startsWith(`# ${site.name}\n`)).toBe(true);
    expect(text).toContain(`> ${site.roles}`);
    for (const p of posts) expect(text).toContain(`(${site.url}/blog/${p.slug}.md)`);
    for (const w of pages) expect(text).toContain(`(${site.url}/work/${w.slug}.md)`);
    for (const p of getAllArt()) expect(text).toContain(`(${site.url}/art/${p.slug}.md)`);
    // The gallery says once what he paints with.
    expect(text).toContain("Daniel Smith watercolours:");
  });

  it("says how a painting was made only when it is set", () => {
    expect(buildLlmsTxt([], [], [painting({ making: "Two sittings." })])).toContain("Two sittings.");
    expect(buildLlmsTxt([], [], [painting()])).not.toContain("Two sittings.");
  });

  it("drops every TODO, also from the real content", () => {
    expect(buildLlmsTxt([withTodos.post], [withTodos.work], [withTodos.art])).not.toContain("TODO(jorge)");
    expect(buildLlmsTxt(getAllPosts(), getAllWork(), getAllArt())).not.toContain("TODO(jorge)");
  });
});

describe("markdown twins", () => {
  it("serve a post as markdown with its title, date and absolute links", () => {
    const md = postMarkdown(post());
    expect(md.startsWith("# A post\n")).toBe(true);
    expect(md).toContain("2022-03-04");
    expect(md).toContain(`(${site.url}/blog/a-post/one.png)`);
    expect(md).toContain(`(${site.url}/work/whiz-study)`);
    expect(md).toContain(`${site.url}/blog/a-post`);
  });

  it("drop every TODO, and Hashnode widget lines", () => {
    const md = postMarkdown(post({ ...withTodos.post, body: `${withTodos.post.body}\n\n%%[money-footer]` }));
    expect(md).not.toContain("TODO(jorge)");
    expect(md).not.toContain("%%[");
    const workMd = workMarkdown(withTodos.work);
    expect(workMd).not.toContain("TODO(jorge)");
    expect(workMd).toContain("Kept line.");
    expect(workMd).toContain("Main engineer");
  });

  it("serve a painting as markdown: its facts, its picture and note with absolute links, no TODO", () => {
    const md = artMarkdown(painting());
    expect(md.startsWith("# A painting\n")).toBe(true);
    for (const line of [
      "- Year: 2026",
      "- Medium: Watercolour and gouache",
      "- Paper: Arches, 100% cotton, 300 gsm (140 lb), cold press",
      "- Size: About 27 × 21.5 cm",
      "- Paints and pigments: Ultramarine blue (PB29), Titanium white gouache (PW6)",
      `- Web page: ${site.url}/art/a-painting`,
      `![Blue washes over a harbour.](${site.url}/art/a-painting.jpg)`,
      `[a link](${site.url}/art)`,
    ]) {
      expect(md).toContain(line);
    }
    expect(artMarkdown(withTodos.art)).not.toContain("TODO(jorge)");
    expect(artMarkdown(painting())).not.toContain("Available:");
    expect(artMarkdown(painting())).not.toContain("Making:");
    expect(artMarkdown(painting({ making: "Two sittings." }))).toContain("- Making: Two sittings.");
    expect(artMarkdown(painting({ available: true }))).toContain(`- Available: yes; to enquire, email ${site.email}`);
    const fan = artMarkdown(painting({ available: true, fanArt: true, subject: "Majora's Mask", owner: "Nintendo", prints: "https://prints.example/a" }));
    expect(fan).toContain("- Fan art of Majora's Mask. Characters © Nintendo. Not for sale.");
    expect(fan).not.toContain("Available:");
    expect(fan).not.toContain("prints.example");
  });

  it("carry no TODO for any real post or work page", () => {
    for (const p of getAllPosts()) expect(postMarkdown(p), p.slug).not.toContain("TODO(jorge)");
    for (const w of getAllWork()) expect(workMarkdown(w), w.slug).not.toContain("TODO(jorge)");
    for (const p of getAllArt()) expect(artMarkdown(p), p.slug).not.toContain("TODO(jorge)");
  });
});

describe("JSON-LD", () => {
  it("describes Jorge as a Person with his profiles", () => {
    const person = personJsonLd();
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe(site.name);
    expect(person.sameAs).toEqual(Object.values(site.social));
    // Both his trades, not the CV's engineering role alone.
    expect(person.disambiguatingDescription).toBe(site.roles);
    expect(person.description).toContain(site.roles);
  });

  it("describes a post as a BlogPosting without TODOs", () => {
    const data = blogPostingJsonLd(withTodos.post);
    expect(data["@type"]).toBe("BlogPosting");
    expect(data.url).toBe(`${site.url}/blog/todo-post`);
    expect(JSON.stringify(data)).not.toContain("TODO(jorge)");
  });

  it("describes the site as a WebSite written by the Person, on every page", () => {
    const graph = siteJsonLd()["@graph"] as Record<string, unknown>[];
    const [website, person] = graph;
    expect(website["@type"]).toBe("WebSite");
    expect(person["@type"]).toBe("Person");
    expect(website.author).toEqual({ "@id": person["@id"] });
    expect(person.sameAs).toEqual(Object.values(site.social));
  });

  it("marks /about as Jorge's ProfilePage", () => {
    const page = profilePageJsonLd();
    expect(page["@type"]).toBe("ProfilePage");
    expect((page.mainEntity as Record<string, unknown>).name).toBe(site.name);
    expect(page.url).toBe(`${site.url}/about`);
  });

  it("gives a page its breadcrumb trail from the home page, with absolute URLs", () => {
    const trail = breadcrumbJsonLd([
      { name: "Blog", path: "/blog" },
      { name: "A post. TODO(jorge): a missing word", path: "/blog/a-post" },
      { name: "TODO(jorge): a title", path: "/work/a-work" },
    ]);
    expect(trail.itemListElement.map((i) => [i.position, i.name, i.item])).toEqual([
      [1, "Home", site.url],
      [2, "Blog", `${site.url}/blog`],
      [3, "A post.", `${site.url}/blog/a-post`],
      [4, "/work/a-work", `${site.url}/work/a-work`],
    ]);
  });

  it("dates a post with its time zone", () => {
    expect(zonedDate("2022-03-04T01:43:21.999Z")).toBe("2022-03-04T01:43:21.999Z");
    expect(zonedDate("2026-11-20")).toBe("2026-11-20T00:00:00-06:00");
    expect(blogPostingJsonLd(post()).datePublished).toMatch(/(Z|[+-]\d{2}:\d{2})$/);
    expect(blogPostingJsonLd(post()).author).toMatchObject({ name: site.name, url: site.url });
  });

  it("describes a painting as a VisualArtwork by the Person, without TODOs", () => {
    const data = visualArtworkJsonLd(painting({ pixels: { width: 1600, height: 2000 } }));
    expect(data).toMatchObject({
      "@type": "VisualArtwork",
      name: "A painting",
      url: `${site.url}/art/a-painting`,
      image: `${site.url}/art/a-painting.jpg`,
      dateCreated: "2026",
      artform: "Painting",
      material: ["Ultramarine blue (PB29)", "Titanium white gouache (PW6)"],
      artMedium: "Watercolour and gouache",
      artworkSurface: "Paper (Arches, 100% cotton, 300 gsm (140 lb), cold press)",
      // The usual sheet, upright like its picture.
      width: { "@type": "Distance", name: "21.5 cm" },
      height: { "@type": "Distance", name: "27 cm" },
      creator: { "@id": personJsonLd()["@id"], name: site.name },
    });
    expect(JSON.stringify(visualArtworkJsonLd(withTodos.art))).not.toContain("TODO(jorge)");
    for (const p of getAllArt()) expect(JSON.stringify(visualArtworkJsonLd(p)), p.slug).not.toContain("TODO(jorge)");
  });

  it("cannot close its <script> early", () => {
    expect(jsonLdHtml({ headline: "</script><b>" })).not.toContain("</script>");
  });
});

describe("TodoText", () => {
  it("marks a TODO in a frontmatter string the way <Markdown> does", () => {
    const html = renderToStaticMarkup(createElement(TodoText, { text: "Kept. TODO(jorge): your years at Whiz.Study" }));
    expect(html).toBe('Kept. <mark class="todo">TODO(jorge): your years at Whiz.Study</mark>');
  });

  it("leaves clean text as it is", () => {
    expect(renderToStaticMarkup(createElement(TodoText, { text: "Fish & chips" }))).toBe("Fish &amp; chips");
  });
});

describe("Open Graph images", () => {
  const imageOf = (metadata: Awaited<ReturnType<typeof postMetadata>>) => {
    const images = metadata.openGraph?.images;
    return (Array.isArray(images) ? images[0] : images) as { url: string } | undefined;
  };

  it("gives a post and a work page their own generated image, not the site default", async () => {
    const post = await postMetadata({ params: Promise.resolve({ slug: "functions" }) });
    expect(imageOf(post)?.url).toBe("/blog/functions/opengraph-image");
    const work = await workMetadata({ params: Promise.resolve({ slug: "whiz-study" }) });
    expect(imageOf(work)?.url).toBe("/work/whiz-study/opengraph-image");
  });

  it("falls back to the site's image, and keeps TODOs out of the article tags", () => {
    const metadata = pageMetadata({
      title: "Blog",
      path: "/blog",
      article: { publishedTime: "2022-01-01", tags: ["maths", "TODO(jorge): a tag"] },
    });
    expect(imageOf(metadata)?.url).toBe("/opengraph-image");
    expect(JSON.stringify(metadata)).not.toContain("TODO(jorge)");
  });
});

describe("robots.txt and the sitemap", () => {
  it("let search and AI search crawlers in by name, and keep the twins' render route out", () => {
    const rules = [robots().rules].flat();
    const agents = rules.flatMap((r) => [r.userAgent].flat());
    for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "*"]) expect(agents).toContain(bot);
    for (const r of rules) {
      expect(r.allow).toBe("/");
      expect(r.disallow).toBe("/md/");
    }
  });

  it("list real URLs only, with no priority or changefreq", () => {
    const entries = sitemap();
    for (const e of entries) {
      expect(e).not.toHaveProperty("priority");
      expect(e).not.toHaveProperty("changeFrequency");
      expect(e.url.startsWith(site.url)).toBe(true);
    }
    expect(entries.length).toBe(new Set(entries.map((e) => e.url)).size);
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${site.url}/art`);
    for (const p of getAllArt()) expect(urls).toContain(`${site.url}/art/${p.slug}`);
  });
});

describe("contact events", () => {
  it("name each kind of contact link", () => {
    expect(contactEvent(`mailto:${site.email}`)).toBe("contact_email");
    expect(contactEvent(`mailto:${site.email}?subject=Hi`)).toBe("contact_email");
    expect(contactEvent(site.social.linkedin)).toBe("outbound_linkedin");
    expect(contactEvent("https://www.linkedin.com/in/jorchrl/")).toBe("outbound_linkedin");
    expect(contactEvent(site.social.github)).toBe("outbound_github");
    expect(contactEvent(`${site.social.github}/plain-engine`)).toBe("outbound_github");
    expect(contactEvent(`${site.url}/cv`)).toBe("cv_open");
    expect(contactEvent(`${site.url}/cv.pdf`)).toBe("cv_download");
  });

  it("let a link name its own event, and leave every other link alone", () => {
    expect(contactEvent(`${site.url}/cv`, "door_hiring")).toBe("door_hiring");
    expect(contactEvent(`${site.url}/work-with-me`, "door_contract")).toBe("door_contract");
    expect(contactEvent(`${site.url}/cv`, "not_an_event")).toBe("cv_open");
    expect(contactEvent(`${site.url}/blog`)).toBeNull();
    expect(contactEvent("https://github.com/someone-else")).toBeNull();
    expect(contactEvent("mailto:someone@example.com")).toBeNull();
    expect(contactEvent("not a url")).toBeNull();
  });
});
