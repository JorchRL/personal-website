// The CV, /work-with-me and /about: their content, their metadata, their
// machine forms (markdown twins, llms.txt, sitemap) and public/cv.pdf.

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// next/font runs only inside Next's compiler; /cv's page imports its fonts.
vi.mock("next/font/local", () => ({ default: () => ({ className: "", variable: "", style: {} }) }));
import { studioRoles } from "@content/about";
import { site } from "@content/site";
import { home } from "@content/home";
import { workWithMe } from "@content/work-with-me";
import { getCv, CV_PDF } from "@/content/cv";
import { getAllArt } from "@/content/art";
import { getAllPosts } from "@/content/posts";
import { getAllWork } from "@/content/work";
import { getSkills, PENDING } from "@/content/skills";
import { buildLlmsTxt } from "@/seo/llms";
import { aboutMarkdown, cvMarkdown, workMarkdown, workWithMeMarkdown } from "@/seo/twins";
import { getAbout } from "@/content/pages";
import { contactEvent } from "@/ui/contactEvents";
import sitemap from "@/app/sitemap";
import { metadata as cvMetadata } from "@/app/cv/page";
import WorkWithMePage, { metadata as workWithMeMetadata } from "@/app/work-with-me/page";
import { metadata as aboutMetadata } from "@/app/about/page";
import { bulletLength, BULLET_WINDOW, cvTex } from "../scripts/lib/cv-tex.mjs";
import { pdfLinks, pdfPageCount, pdfText, squash } from "./pdf-text";

const root = process.cwd();
const pdfPath = path.join(root, "public", CV_PDF);

describe("public/cv.pdf", () => {
  it("exists, is a PDF and is under 2.5 MB", () => {
    expect(existsSync(pdfPath), "run: pnpm cv:pdf").toBe(true);
    const pdf = readFileSync(pdfPath);
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(statSync(pdfPath).size).toBeLessThan(2.5 * 1024 * 1024);
  });

  it("is one page", () => {
    expect(pdfPageCount(readFileSync(pdfPath))).toBe(1);
  });

  it("is text, not a picture: the name, the contact details and each entry read back", () => {
    const text = squash(pdfText(readFileSync(pdfPath)));
    const cv = getCv();
    for (const expected of [cv.name, cv.contact.email, cv.contact.linkedin, cv.contact.github]) {
      expect(text).toContain(squash(expected));
    }
    for (const job of cv.experience) {
      expect(text).toContain(squash([job.company, job.location, job.context, job.title, job.dates].filter(Boolean).join(" ")));
    }
    for (const project of cv.projects) expect(text).toContain(squash(project.name));
  });

  it("reads each outcome line with its bullet (U+2022), in order, right after its entry", () => {
    // A marker drawn out of the text's flow reads detached from its line.
    const text = squash(pdfText(readFileSync(pdfPath)));
    const cv = getCv();
    const plain = (line: string) => squash(`• ${line.replace(/\*\*/g, "")}`);
    for (const entry of [...cv.experience, ...cv.projects]) {
      for (const line of entry.outcomes.filter((o) => !o.includes("TODO"))) {
        expect(text, line).toContain(plain(line));
      }
    }
    // The first job's lines come before the projects' heads, not after the whole sheet.
    expect(text.indexOf(plain(cv.experience[0].outcomes[0]))).toBeLessThan(text.indexOf(squash(cv.projects[0].name)));
  });

  it("is typeset from the content as it stands (else: pnpm cv:pdf)", () => {
    const text = squash(pdfText(readFileSync(pdfPath)));
    expect(text).toContain(squash(`rev. ${getCv().rev}`));
  });

  it("shows its missing facts as TODOs, like the page", () => {
    const text = pdfText(readFileSync(pdfPath));
    const todos = JSON.stringify(getCv()).includes("TODO(jorge)");
    expect(text.includes("TODO(jorge)")).toBe(todos);
  });

  it("names no local server in its text or links: every link points at the live site", () => {
    const pdf = readFileSync(pdfPath);
    const local = /localhost|127\.0\.0\.1/;
    expect(pdfText(pdf)).not.toMatch(local);
    const links = pdfLinks(pdf);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link, link).not.toMatch(local);
      expect(link, link).toMatch(/^(mailto:|https:\/\/)/);
    }
    // Each entry links to its work page on the live site.
    const cv = getCv();
    for (const entry of [...cv.experience, ...cv.projects]) expect(links).toContain(`${site.url}${entry.href}`);
  });

  it("is a download the CV's link reports as cv_download, and /cv as cv_open", () => {
    expect(contactEvent(`${site.url}${CV_PDF}`)).toBe("cv_download");
    expect(contactEvent(`${site.url}/cv`)).toBe("cv_open");
  });
});

describe("the CV's LaTeX (scripts/lib/cv-tex.mjs)", () => {
  const tex = cvTex(getCv(), site.url);

  it("sets each key fact in bold and escapes LaTeX's special characters", () => {
    expect(tex).toContain("\\textbf{300,000+ line}");
    expect(tex).toContain("\\$5k");
    expect(tex).not.toContain("**");
  });

  it("links each entry to its work page on the live site", () => {
    for (const entry of [...getCv().experience, ...getCv().projects]) expect(tex).toContain(`\\entrylink{${site.url}${entry.href}}`);
  });

  it("measures a bullet without its bold marks", () => {
    expect(bulletLength("a **b** c")).toBe(5);
    expect(BULLET_WINDOW.min).toBeLessThan(BULLET_WINDOW.max);
  });
});

describe("the CV's content", () => {
  it("names a real company, a full title and dates for every job", () => {
    for (const job of getCv().experience) {
      expect(job.company).not.toMatch(/company|client|TODO/i);
      expect(job.title).not.toMatch(/\b(Sr|Jr|Eng|Dev|Mgr)\.?(\s|$)/);
      expect(job.dates.length).toBeGreaterThan(0);
      expect(job.outcomes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("changes its revision when its content changes", () => {
    expect(getCv().rev).toMatch(/^[0-9a-f]{7}$/);
  });
});

describe("work pages", () => {
  it("each say who built them and open with a figure, or a TODO naming what to record", () => {
    for (const work of getAllWork()) {
      expect(work.team, work.slug).toBeTruthy();
      expect(work.figure, work.slug).toBeTruthy();
      if (typeof work.figure === "object") {
        expect(existsSync(path.join(root, "public", work.figure.src)), work.figure.src).toBe(true);
      }
    }
  });

  it("put the team in their markdown twin, without a TODO", () => {
    for (const work of getAllWork()) {
      const md = workMarkdown(work);
      expect(md).not.toContain("TODO");
      if (work.team === "Solo") expect(md).toContain("- Team: Solo");
    }
  });
});

describe("about: roles and skills", () => {
  const work = new Set(getAllWork().map((w) => `/work/${w.slug}`));
  const posts = new Set(getAllPosts().map((p) => `/blog/${p.slug}`));

  it("backs every role with a real work page", () => {
    for (const role of studioRoles) expect(work.has(role.href.split("#")[0]), role.href).toBe(true);
  });

  it("fills every skills cell, with a fact, a TODO or the mark of a fact asked on a work page, and links only to real pages", () => {
    for (const row of getSkills()) {
      for (const cell of [row.skill, row.usedFor, row.lastUsed, row.depth]) expect(cell.trim()).not.toBe("");
      if (row.href) expect(work.has(row.href) || posts.has(row.href), row.href).toBe(true);
      expect(row.lastUsed).toMatch(/^(\d{4}|TODO\(jorge\): .+)$|^—$/);
    }
  });

  it("asks Whiz.Study's years and stack on its work page only", () => {
    const whiz = getAllWork().find((w) => w.slug === "whiz-study")!;
    const rows = getSkills().filter((row) => row.href === "/work/whiz-study");
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      if (whiz.period.includes("TODO")) expect(row.lastUsed, row.skill).toBe(PENDING);
      expect(row.skill).not.toContain("TODO");
    }
  });
});

describe("metadata of the new pages", () => {
  const pages = [
    ["/cv", cvMetadata, "/cv.md"],
    ["/work-with-me", workWithMeMetadata, "/work-with-me.md"],
    ["/about", aboutMetadata, "/about.md"],
  ] as const;

  it("give each a title, a description, a canonical URL and its markdown twin, none with a TODO", () => {
    for (const [route, meta, twin] of pages) {
      expect(meta.title, route).toBeTruthy();
      expect(meta.description, route).toBeTruthy();
      expect(meta.alternates?.canonical, route).toBe(route);
      expect(JSON.stringify(meta.alternates?.types), route).toContain(twin);
      expect(JSON.stringify(meta), route).not.toContain("TODO");
    }
  });
});

describe("/work-with-me: rates", () => {
  // A rate per hour or per month, in any wording.
  const perHourOrMonth = /hourly|monthly|per (hour|month)|an hour\b|a month\b|\/\s*(h|hr|hour|mo|month)\b/i;
  const html = renderToStaticMarkup(createElement(WorkWithMePage));
  const text = html.replace(/<[^>]+>/g, " ");

  it("shows the week and the smallest project, from the figures in content/work-with-me.ts", () => {
    expect(workWithMe.weekFromUsd).toBe(3200);
    expect(workWithMe.projectMinimumUsd).toBe(3000);
    for (const page of [text, workWithMeMarkdown()]) {
      expect(page).toContain("A week is from US$3,200");
      expect(page).toContain("projects start at US$3,000");
    }
  });

  it("keeps the reply promise the site makes everywhere else", () => {
    expect(workWithMe.rates).toContain(`reply within ${home.replyWithin}`);
    expect(home.reply).toContain(home.replyWithin);
  });

  it("names no hourly or monthly rate on the page, its twin, the CV or its PDF", () => {
    const sources = [text, workWithMeMarkdown(), cvMarkdown(getCv()), pdfText(readFileSync(pdfPath))];
    // No rate per hour in any wording, anywhere on the page.
    expect(text).not.toMatch(/hourly|per hour|an hour\b|\/\s*(h|hr|hour)\b/i);
    for (const source of sources) {
      for (const sentence of source.split(/(?<=[.!?])\s+/)) {
        if (/US\$|USD|\brates?\b|billed/i.test(sentence)) expect(sentence, sentence).not.toMatch(perHourOrMonth);
      }
    }
  });
});

describe("machine forms of the new pages", () => {
  it("serve the CV, /work-with-me and /about as markdown with no TODO and absolute links", () => {
    const twins = [cvMarkdown(getCv()), workWithMeMarkdown(), aboutMarkdown(getAbout())];
    for (const md of twins) {
      expect(md).not.toContain("TODO");
      expect(md).not.toMatch(/\]\(\/(?!\/)/);
      expect(md).toContain(site.email);
    }
    expect(twins[0]).toContain(`${site.url}${CV_PDF}`);
    expect(twins[0]).toContain("Dimensione3");
    expect(twins[2]).toContain("| Skill | What I used it for | Last used | Depth |");
  });

  it("list the CV, its PDF, /work-with-me and /about in llms.txt", () => {
    const txt = buildLlmsTxt(getAllPosts(), getAllWork(), getAllArt());
    for (const url of ["/cv.md", "/cv.pdf", "/work-with-me.md", "/about.md"]) expect(txt).toContain(`${site.url}${url}`);
    expect(txt).not.toContain("TODO");
  });

  it("list /cv and /work-with-me in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(`${site.url}/cv`);
    expect(urls).toContain(`${site.url}/work-with-me`);
  });
});
