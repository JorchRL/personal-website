// /cv: the CV as a sheet that reads like public/cv.pdf (the LaTeX layout of
// scripts/lib/cv-tex.mjs, in Latin Modern): the name centred in small caps,
// contact links joined by " | ", section titles over a rule, each company once
// with its context line in italics, roles and dates in one row, bullets with
// their key facts in bold, the skills block. It also shows what the one-page
// PDF leaves out: the summary and the hiring terms. Everything comes from
// getCv() (src/content/cv.ts), the same object the PDF is typeset from.

import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@content/site";
import { getCv, CV_PDF, type Cv } from "@/content/cv";
import { TodoText } from "@/content/TodoText";
import { breadcrumbJsonLd } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";
import { JsonLd } from "@/ui/JsonLd";
import { sheetLabel } from "@/ui/sections";
import { latinModern, latinModernCaps } from "./fonts";
import "./cv.css";

export const metadata = pageMetadata({
  title: "CV",
  description: `The CV of ${site.name}, ${site.role.replace(/\.$/, "").toLowerCase()}: experience, projects and skills, as a page and as a PDF.`,
  path: "/cv",
  markdown: "/cv.md",
});

export default function CvPage() {
  const cv = getCv();
  return (
    <article className={`cv ${latinModern.variable} ${latinModernCaps.variable}`}>
      <JsonLd data={breadcrumbJsonLd([{ name: "CV", path: "/cv" }])} />
      <header className="page-head cv-bar">
        <div className="meta grid">
          <p className="l label">{sheetLabel("/cv")}</p>
          <p className="r mono">
            <a className="cv-pdf-link" href={CV_PDF} type="application/pdf">
              PDF, one page <span aria-hidden="true">↓</span>
            </a>
          </p>
        </div>
        <p className="cv-actions">
          <a className="btn btn-primary" href={`mailto:${cv.contact.email}`}>
            Email me <span className="k" aria-hidden="true">→</span>
          </a>
          <a className="btn" href={CV_PDF} type="application/pdf">
            Download the PDF <span className="k" aria-hidden="true">↓</span>
          </a>
        </p>
      </header>

      <div className="cv-sheet">
        <header className="cv-top">
          <h1 className="cv-name">{cv.name}</h1>
          <p className="cv-title">{cv.title}</p>
          <p className="cv-status">
            <TodoText text={cv.availability} />
          </p>
          <Contact cv={cv} />
        </header>

        <Section id="summary" title="Summary">
          <p className="cv-summary">
            <TodoText text={cv.summary} />
          </p>
        </Section>

        <Section id="experience" title="Experience">
          <ol className="cv-entries">
            {cv.experience.map((job) => (
              <li key={job.id} id={job.id} className="cv-entry">
                <div className="cv-row">
                  <h3 className="cv-company">
                    <Link href={job.href}>{job.company}</Link>
                  </h3>
                  {job.location && <p className="cv-location">{job.location}</p>}
                </div>
                {job.context && (
                  <p className="cv-context">
                    <TodoText text={job.context} />
                  </p>
                )}
                <div className="cv-row cv-role-row">
                  <p className="cv-role">
                    <TodoText text={job.title} />
                  </p>
                  <p className="cv-dates">
                    <TodoText text={job.dates} />
                  </p>
                </div>
                <Outcomes items={job.outcomes} />
              </li>
            ))}
          </ol>
        </Section>

        <Section id="projects" title="Projects">
          <ol className="cv-entries">
            {cv.projects.map((project) => (
              <li key={project.id} id={project.id} className="cv-entry">
                <div className="cv-row">
                  <h3 className="cv-project">
                    <Link href={project.href}>{project.name}</Link>
                    <span className="cv-bar-sep"> | </span>
                    <span className="cv-stack">
                      <TodoText text={project.role} />; {project.stack.join(", ")}
                    </span>
                  </h3>
                  <p className="cv-dates cv-dates-bold">
                    <TodoText text={project.dates} />
                  </p>
                </div>
                <Outcomes items={project.outcomes} />
              </li>
            ))}
          </ol>
        </Section>

        <Section id="skills" title="Technical Skills" more={{ href: "/about#h-skills", label: "Where and when I used each" }}>
          <Pairs rows={cv.skills.map((s) => [s.group, s.items])} />
        </Section>

        <Section id="hiring" title="Hiring me">
          <Pairs
            rows={[
              ["Looking for", cv.lookingFor],
              ["How", cv.hire.route],
              ["Time zone", `${cv.contact.timeZone} ${cv.hire.overlap}`],
              ["Languages", cv.hire.english],
            ]}
          />
        </Section>

        <p className="cv-rev">
          {cv.contact.site}/cv · rev. {cv.rev}
        </p>
      </div>
    </article>
  );
}

function Section({
  id,
  title,
  more,
  children,
}: {
  id: string;
  title: string;
  more?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="cv-sec" aria-labelledby={`h-${id}`}>
      <div className="cv-sec-head">
        <h2 id={`h-${id}`}>{title}</h2>
        {more && (
          <Link className="cv-more" href={more.href}>
            {more.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** The contact links, as on the PDF: plain text joined by " | ". */
function Contact({ cv }: { cv: Cv }) {
  const c = cv.contact;
  const links: { href: string; text: string; rel?: string }[] = [
    { href: `mailto:${c.email}`, text: c.email },
    { href: `https://${c.site}`, text: c.site },
    { href: `https://${c.linkedin}`, text: c.linkedin, rel: "me" },
    { href: `https://${c.github}`, text: c.github, rel: "me" },
  ];
  return (
    <p className="cv-contact" aria-label="Contact">
      {links.map((link, i) => (
        <span key={link.href}>
          {i > 0 && <span className="cv-bar-sep"> | </span>}
          <a href={link.href} rel={link.rel}>
            {link.text}
          </a>
        </span>
      ))}
    </p>
  );
}

/** "Group: items" lines, as the PDF's skills block. */
function Pairs({ rows }: { rows: string[][] }) {
  return (
    <dl className="cv-pairs">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}:</dt> <dd>{<TodoText text={value} />}</dd>
        </div>
      ))}
    </dl>
  );
}

function Outcomes({ items }: { items: string[] }) {
  return (
    <ul className="cv-outcomes">
      {items.map((item) => (
        <li key={item}>
          {/* `**…**` in content/cv.ts marks a key fact: bold here and in the PDF. */}
          {item.split(/\*\*(.+?)\*\*/).map((part, i) =>
            i % 2 ? (
              <strong key={i}>
                <TodoText text={part} />
              </strong>
            ) : (
              <TodoText key={i} text={part} />
            ),
          )}
        </li>
      ))}
    </ul>
  );
}
