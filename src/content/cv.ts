// The CV, as one object: content/cv.ts joined with the work pages it names
// (their dates, roles and stacks), the core facts (content/site.ts: the
// title, availability, contact details, what he is looking for) and the
// hiring terms (content/hire.ts). /cv renders it, its markdown twin is
// made from it, and public/cv.pdf is typeset from it (scripts/cv-pdf.mjs).
// `rev` is a hash of everything else in it: the PDF prints it, so a test can
// tell when the PDF is older than the content.

import { createHash } from "node:crypto";
import { cv } from "@content/cv";
import { hire } from "@content/hire";
import { site } from "@content/site";
import { getAllWork, type Work } from "./work";

export type CvJob = {
  /** The entry's anchor on /cv: its work page's slug. */
  id: string;
  title: string;
  company: string;
  /** What the work was on, under the company: the app, when it is not the company's name. */
  context?: string;
  /** "Remote", on the company's row. */
  location?: string;
  dates: string;
  href: string;
  outcomes: string[];
};
export type CvProjectEntry = {
  id: string;
  name: string;
  role: string;
  dates: string;
  stack: string[];
  href: string;
  outcomes: string[];
};

export type Cv = {
  name: string;
  title: string;
  summary: string;
  contact: {
    email: string;
    site: string;
    location: string;
    timeZone: string;
    linkedin: string;
    github: string;
  };
  availability: string;
  lookingFor: string;
  hire: { route: string; overlap: string; english: string };
  experience: CvJob[];
  projects: CvProjectEntry[];
  skills: { group: string; items: string }[];
  rev: string;
};

/** The CV's public path and its PDF. */
export const CV_PATH = "/cv";
export const CV_PDF = "/cv.pdf";

/** A CV entry's address on /cv, for the work page or home row that links to it. */
export function cvEntryPath(slug: string): string {
  return `${CV_PATH}#${slug}`;
}

/** The work pages the CV has an entry for. */
export function cvSlugs(): string[] {
  return [...cv.experience.map((job) => job.work), ...cv.projects.map((project) => project.work)];
}

function page(work: Work[], slug: string): Work {
  const found = work.find((w) => w.slug === slug);
  if (!found) throw new Error(`content/cv.ts: no work page "${slug}" (content/work/${slug}.md)`);
  return found;
}

export function getCv(): Cv {
  const work = getAllWork();
  const body: Omit<Cv, "rev"> = {
    name: site.name,
    // The role line, set as a title: without its full stop.
    title: site.role.replace(/\.$/, ""),
    summary: cv.summary,
    contact: {
      email: site.email,
      site: site.url.replace(/^https?:\/\//, ""),
      location: site.location,
      timeZone: hire.timeZone,
      linkedin: site.social.linkedin.replace(/^https?:\/\//, ""),
      github: site.social.github.replace(/^https?:\/\//, ""),
    },
    availability: site.availability,
    lookingFor: site.lookingFor,
    hire: { route: hire.route, overlap: hire.overlap, english: hire.english },
    experience: cv.experience.map((job) => ({
      id: job.work,
      title: job.title,
      company: job.company,
      ...("context" in job && job.context ? { context: job.context } : {}),
      ...("location" in job && job.location ? { location: job.location } : {}),
      dates: page(work, job.work).period,
      href: `/work/${job.work}`,
      outcomes: [...job.outcomes],
    })),
    projects: cv.projects.map((project) => {
      const w = page(work, project.work);
      return {
        id: w.slug,
        name: w.title,
        role: w.role,
        dates: w.period,
        stack: w.stack,
        href: `/work/${w.slug}`,
        outcomes: [...project.outcomes],
      };
    }),
    skills: cv.skills.map((s) => ({ ...s })),
  };
  const rev = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 7);
  return { ...body, rev };
}
