// /llms.txt (llmstxt.org): who Jorge is, how to reach him, and every work page,
// post and page (about, CV, work with me) with its markdown twin. No TODO reaches it (stripTodos).

import { site } from "@content/site";
import type { PostMeta } from "@/content/posts";
import type { WorkMeta } from "@/content/work";
import { stripTodos } from "@/content/todos";
import { absoluteUrl, postPath, workPath } from "./urls";

function entry(title: string, url: string, description: string): string {
  const note = stripTodos(description);
  return `- [${stripTodos(title)}](${url})${note ? `: ${note}` : ""}`;
}

export function buildLlmsTxt(posts: PostMeta[], work: WorkMeta[]): string {
  return [
    `# ${site.name}`,
    "",
    `> ${stripTodos(site.intro)}`,
    "",
    `Personal site of ${site.name}, based in ${site.location}. Every work page and post below is also served as`,
    "plain markdown at the linked .md URL.",
    "",
    `Contact: ${site.email} (email), ${site.social.linkedin}, ${site.social.github}.`,
    "",
    "## Work",
    "",
    ...work.map((w) => entry(w.title, `${absoluteUrl(workPath(w.slug))}.md`, w.description)),
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
