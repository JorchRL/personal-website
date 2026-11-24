// The markdown twins: every post at /blog/<slug>.md, every work page at
// /work/<slug>.md, every painting at /art/<slug>.md, and /cv.md, /work-with-me.md and /about.md, for agents. A short header of facts, the body as written,
// links made absolute, the old blog's widget lines and every TODO left out.
// An .mdx post's components become plain lines (src/content/mdx-plain.ts).

import { studioRoles, studioRolesNote, whyGames } from "@content/about";
import { hire } from "@content/hire";
import { home } from "@content/home";
import { site } from "@content/site";
import { workWithMe } from "@content/work-with-me";
import { CV_PATH, CV_PDF, type Cv } from "@/content/cv";
import {
  enquiryHref,
  fanArtLabel,
  knownYear,
  mediumLabel,
  offersEnquiry,
  paintsWithPigments,
  paperPlain,
  printsLink,
  sizeLabel,
  type Painting,
} from "@/content/art";
import { postPlain } from "@/content/blog-components/plain";
import { describer, mdxToMarkdown, parseMdx } from "@/content/mdx-plain";
import { getSkills } from "@/content/skills";
import type { Post } from "@/content/posts";
import type { Work } from "@/content/work";
import { stripTodos } from "@/content/todos";
import { absoluteUrl, artPath, postPath, workPath } from "./urls";

export function postMarkdown(post: Post): string {
  const tags = post.tags.map(stripTodos).filter(Boolean);
  return document(stripTodos(post.title), [
    `- Author: ${site.name}`,
    `- Published: ${post.date.slice(0, 10)}`,
    ...(tags.length ? [`- Tags: ${tags.join(", ")}`] : []),
    `- Web page: ${absoluteUrl(postPath(post.slug))}`,
  ], post.format === "mdx" ? mdxPlain(post) : post.body);
}

/** An .mdx post's body as markdown: each component a plain line, never JSX. */
export function mdxPlain(post: Pick<Post, "slug" | "body" | "file">): string {
  const describe = describer({
    postUrl: absoluteUrl(postPath(post.slug)),
    own: postPlain[post.slug],
  });
  return mdxToMarkdown(post.body, parseMdx(post.body, post.file), describe);
}

export function workMarkdown(work: Work): string {
  const period = stripTodos(work.period);
  const description = stripTodos(work.description);
  const stack = work.stack.map(stripTodos).filter(Boolean);
  return document(stripTodos(work.title), [
    ...(description ? [description, ""] : []),
    `- Role: ${stripTodos(work.role)}`,
    ...(work.team && stripTodos(work.team) ? [`- Team: ${stripTodos(work.team)}`] : []),
    ...(period ? [`- Period: ${period}`] : []),
    ...(stack.length ? [`- Stack: ${stack.join(", ")}`] : []),
    ...(work.links ?? []).map((link) => `- ${link.label}: ${link.href}`),
    `- Web page: ${absoluteUrl(workPath(work.slug))}`,
  ], work.body);
}

export function artMarkdown(painting: Painting): string {
  const paints = paintsWithPigments(painting);
  const picture = `![${stripTodos(painting.alt)}](${painting.image})`;
  const year = knownYear(painting);
  const prints = printsLink(painting);
  return document(stripTodos(painting.title) || painting.slug, [
    `- Painted by: ${site.name}`,
    ...(year ? [`- Year: ${year}`] : []),
    `- Medium: ${mediumLabel(painting)}`,
    ...(painting.fanArt ? [`- ${fanArtLabel(painting)}`] : []),
    `- Paper: ${paperPlain(painting)}`,
    `- Size: ${sizeLabel(painting)}`,
    ...(painting.making ? [`- Making: ${painting.making}`] : []),
    ...(paints.length ? [`- Paints and pigments: ${paints.join(", ")}`] : []),
    ...(offersEnquiry(painting) ? [`- Available: yes; to enquire, email ${site.email} (${enquiryHref(painting)})`] : []),
    ...(prints ? [`- Prints: ${prints}`] : []),
    `- Picture: ${absoluteUrl(painting.image)}`,
    `- Web page: ${absoluteUrl(artPath(painting.slug))}`,
  ], [picture, painting.body].filter(Boolean).join("\n\n"));
}

/** /cv.md: the CV, from the same object as /cv and public/cv.pdf. */
export function cvMarkdown(cv: Cv): string {
  const line = (text: string) => stripTodos(text);
  const items = (list: string[]) => list.map(line).filter(Boolean).map((item) => `- ${item}`);
  const entry = (heading: string, dates: string, href: string, outcomes: string[], about = "") => {
    const facts = [line(about), line(dates)].filter(Boolean).join(" · ");
    return [`### ${heading}`, "", ...(facts ? [facts, ""] : []), ...items(outcomes), "", `More: ${absoluteUrl(href)}`, ""];
  };
  const optional = (heading: string, text: string) => (line(text) ? [`## ${heading}`, "", line(text), ""] : []);
  const body = [
    line(cv.summary),
    "",
    "## Experience",
    "",
    ...cv.experience.flatMap((job) =>
      entry(`${line(job.title)}, ${job.company}`, job.dates, job.href, job.outcomes, [job.context, job.location].filter(Boolean).join(" · ")),
    ),
    "## Projects",
    "",
    ...cv.projects.flatMap((p) =>
      entry(p.name, p.dates, p.href, p.outcomes, `${line(p.role)} · ${p.stack.map(line).filter(Boolean).join(", ")}`),
    ),
    "## Skills",
    "",
    ...cv.skills.map((s) => `- ${s.group}: ${s.items}`),
    "",
    ...optional("Languages", cv.hire.english),
    "## Hiring me",
    "",
    ...items([cv.lookingFor, cv.hire.route, `${cv.contact.timeZone} ${cv.hire.overlap}`]),
  ].join("\n");
  return document(`${site.name}: CV`, [
    `- ${line(cv.title)}`,
    `- ${cv.availability}`,
    `- Email: ${cv.contact.email}`,
    `- Based: ${cv.contact.timeZone}`,
    `- LinkedIn: ${site.social.linkedin}`,
    `- GitHub: ${site.social.github}`,
    `- PDF: ${absoluteUrl(CV_PDF)}`,
    `- Web page: ${absoluteUrl(CV_PATH)}`,
  ], body);
}

/** /work-with-me.md: the page for contract clients. */
export function workWithMeMarkdown(): string {
  const body = [
    `${site.role} ${workWithMe.lead}`,
    "",
    site.proof,
    "",
    "## What I take on",
    "",
    ...workWithMe.offers.flatMap((o) => [`### ${o.title}`, "", o.text, "", `See: [${o.proof.label}](${o.proof.href})`, ""]),
    "## How it works",
    "",
    `- Contract: ${hire.route}`,
    `- Time zone: ${hire.timeZone} ${hire.overlap}`,
    ...(stripTodos(workWithMe.hours) ? [`- Hours: ${stripTodos(workWithMe.hours)}`] : []),
    `- Rates: ${workWithMe.rates}`,
    ...(stripTodos(hire.english) ? [`- Languages: ${stripTodos(hire.english)}`] : []),
    "",
    "## How to start",
    "",
    ...workWithMe.steps.map((step, i) => `${i + 1}. ${step}`),
    "",
  ].join("\n");
  return document(
    "Work with me",
    [`- ${site.availability}`, `- Web page: ${absoluteUrl("/work-with-me")}`, `- Email: ${site.email}`],
    body,
  );
}

/** /about.md: content/about.md, then the roles, the skills, why games and how to hire. */
export function aboutMarkdown(about: string): string {
  const cell = (text: string) => stripTodos(text).replace(/\|/g, "\\|");
  const rows = getSkills()
    .filter((s) => stripTodos(s.skill))
    .map((s) => `| ${cell(s.skill)} | ${cell(s.usedFor)} | ${cell(s.lastUsed)} | ${cell(s.depth)} |`);
  const body = [
    about.trim(),
    "",
    "## Roles I fit at a studio",
    "",
    studioRolesNote,
    "",
    ...studioRoles.map((r) => `- **${r.role}.** ${r.proof} See: ${absoluteUrl(r.href)}`),
    "",
    "## Skills",
    "",
    "| Skill | What I used it for | Last used | Depth |",
    "| --- | --- | --- | --- |",
    ...rows,
    "",
    ...(stripTodos(whyGames) ? ["## Why games", "", whyGames, ""] : []),
    "## How to hire me",
    "",
    `- Contract: ${hire.route}`,
    `- Time zone: ${hire.timeZone} ${hire.overlap}`,
    ...(stripTodos(hire.english) ? [`- Languages: ${stripTodos(hire.english)}`] : []),
    `- Email: ${site.email}. ${home.include}`,
    `- CV: ${absoluteUrl(CV_PATH)} (PDF: ${absoluteUrl(CV_PDF)})`,
  ].join("\n");
  return document(`About ${site.name}`, [`- ${site.availability}`, `- Web page: ${absoluteUrl("/about")}`], body);
}

function document(title: string, facts: string[], body: string): string {
  const contact = `${site.name}. ${stripTodos(site.intro)} Email: ${site.email}. LinkedIn: ${site.social.linkedin}.`;
  return [`# ${title}`, "", ...facts, "", "---", "", plainBody(body), "", "---", "", contact, ""].join("\n");
}

/** The body, minus TODOs and Hashnode widget lines, with site links absolute. */
function plainBody(body: string): string {
  return stripTodos(
    body
      .split("\n")
      .filter((line) => !/^\s*(%%\[[\w-]+\]\s*)+$/.test(line))
      .join("\n")
      .replace(/(!\[[^\]]*\]\([^)\s]+)\s+align="[^"]*"\)/g, "$1)"),
  )
    .replace(/\]\(\/(?!\/)/g, `](${site.url}/`)
    .replace(/\s(src|href)="\/(?!\/)/g, ` $1="${site.url}/`)
    .trim();
}
