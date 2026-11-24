// /llms.txt (llmstxt.org): who Jorge is, how to reach him, and every work page,
// painting, post and page (about, CV, work with me) with its markdown twin. No TODO reaches it (stripTodos).

import { gallery } from "@content/gallery";
import { site } from "@content/site";
import { fanArtLabel, knownYear, materialsLines, mediumLabel, offersEnquiry, paperPlain, sizeLabel, type Painting } from "@/content/art";
import type { PostMeta } from "@/content/posts";
import type { WorkMeta } from "@/content/work";
import { stripTodos } from "@/content/todos";
import { absoluteUrl, ART_PATH, artPath, postPath, workPath } from "./urls";

function entry(title: string, url: string, description: string): string {
  const note = stripTodos(description);
  return `- [${stripTodos(title)}](${url})${note ? `: ${note}` : ""}`;
}

/** "2026. Watercolour on Arches, 100% cotton, 300 gsm (140 lb), cold press, about 27 × 21.5 cm. Available: enquire by email." */
function paintingLine(p: Painting): string {
  const year = knownYear(p);
  return [
    year && `${year}.`,
    `${mediumLabel(p)} on ${paperPlain(p)}, ${sizeLabel(p).toLowerCase()}.`,
    p.making,
    fanArtLabel(p),
    offersEnquiry(p) && `Available: enquire by email (${site.email}).`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildLlmsTxt(posts: PostMeta[], work: WorkMeta[], art: Painting[]): string {
  return [
    `# ${site.name}`,
    "",
    `> ${stripTodos(site.intro)}`,
    "",
    `Personal site of ${site.name}, based in ${site.location}. Every work page, painting and post below is also served as`,
    "plain markdown at the linked .md URL.",
    "",
    `Contact: ${site.email} (email), ${site.social.linkedin}, ${site.social.github}.`,
    "",
    "## Work",
    "",
    ...work.map((w) => entry(w.title, `${absoluteUrl(workPath(w.slug))}.md`, w.description)),
    "",
    "## Art",
    "",
    `${gallery.summary} His watercolours, newest first (gallery: ${absoluteUrl(ART_PATH)}). ${materialsLines().join(" ")}`,
    "",
    ...art.map((p) =>
      entry(stripTodos(p.title) || p.slug, `${absoluteUrl(artPath(p.slug))}.md`, paintingLine(p)),
    ),
    "",
    "## Pages",
    "",
    `- [About](${absoluteUrl("/about")}.md): who he is, the roles he fits at a game studio, his skills with when and where he used each, and how to hire him.`,
    `- [CV](${absoluteUrl("/cv")}.md): experience, projects and skills. Also as a PDF: ${absoluteUrl("/cv.pdf")}`,
    `- [Work with me](${absoluteUrl("/work-with-me")}.md): contract work he takes on, and how an engagement works.`,
    `- [RSS feed](${absoluteUrl("/rss.xml")}): every post.`,
    "",
    "## Blog",
    "",
    ...posts.map((p) => entry(p.title, `${absoluteUrl(postPath(p.slug))}.md`, p.description)),
    "",
  ].join("\n");
}
