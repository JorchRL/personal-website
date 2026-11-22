// /cv: the CV as a page in the site's look, and, printed (scripts/cv-pdf.mjs),
// public/cv.pdf: one column, real text, the contact details in the body.
// Everything comes from getCv() (src/content/cv.ts).

import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@content/site";
import { getCv, CV_PDF, type Cv } from "@/content/cv";
import { TodoText } from "@/content/TodoText";
import { breadcrumbJsonLd } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";
import { JsonLd } from "@/ui/JsonLd";
import { PageHead } from "@/ui/PageHead";
import { SectionHead } from "@/ui/SectionHead";
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
    <article className="cv">
      <JsonLd data={breadcrumbJsonLd([{ name: "CV", path: "/cv" }])} />
      <PageHead
        label="Sheet 04 — CV"
        status={
          <a className="cv-pdf-link" href={CV_PDF} type="application/pdf">
            PDF, one column <span aria-hidden="true">↓</span>
          </a>
        }
        title={cv.name}
      />

      <header className="cv-intro grid">
        <div className="cv-lead">
          <p className="cv-title">{cv.title}</p>
          <p className="cv-status status">{cv.availability}</p>
          <p className="cv-summary">
            <TodoText text={cv.summary} />
          </p>
          <p className="cv-actions">
            <a className="btn btn-primary" href={`mailto:${cv.contact.email}`}>
              Email me <span className="k" aria-hidden="true">→</span>
            </a>
            <a className="btn" href={CV_PDF} type="application/pdf">
              Download the PDF <span className="k" aria-hidden="true">↓</span>
            </a>
          </p>
        </div>
        <Contact cv={cv} />
      </header>

      <section className="sec cv-sec" aria-labelledby="h-experience">
        <SectionHead no="01" id="experience" title="Experience" />
        <ol className="cv-entries">
          {cv.experience.map((job) => (
            <li key={job.id} id={job.id} className="cv-entry">
              <h3>
                <span className="cv-role">
                  <TodoText text={job.title} />
                  <Sep>,</Sep>
                </span>{" "}
                <span className="cv-at">
                  <Link href={job.href}>{job.company}</Link>
                </span>
              </h3>
              <p className="cv-dates">
                <TodoText text={job.dates} />
              </p>
              <Outcomes items={job.outcomes} />
            </li>
          ))}
        </ol>
      </section>

      <section className="sec cv-sec" aria-labelledby="h-projects">
        <SectionHead no="02" id="projects" title="Projects" />
        <ol className="cv-entries">
          {cv.projects.map((project) => (
            <li key={project.id} id={project.id} className="cv-entry">
              <h3>
                <span className="cv-role">
                  <Link href={project.href}>{project.name}</Link>
                  <Sep>,</Sep>
                </span>{" "}
                <span className="cv-at">
                  <TodoText text={project.role} /> · {project.stack.join(", ")}
                </span>
              </h3>
              <p className="cv-dates">
                <TodoText text={project.dates} />
              </p>
              <Outcomes items={project.outcomes} />
            </li>
          ))}
        </ol>
      </section>

      <section className="sec cv-sec" aria-labelledby="h-skills">
        <SectionHead no="03" id="skills" title="Skills" more={{ href: "/about#h-skills", label: "Where and when I used each" }} />
        <dl className="cv-pairs">
          {cv.skills.map((s) => (
            <div key={s.group}>
              <dt>
                {s.group}
                <Sep>:</Sep>
              </dt>
              <dd>{s.items}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sec cv-sec" aria-labelledby="h-hiring">
        <SectionHead no="04" id="hiring" title="Hiring me" />
        <dl className="cv-pairs">
          <div>
            <dt>
              Looking for
              <Sep>:</Sep>
            </dt>
            <dd>{cv.lookingFor}</dd>
          </div>
          <div>
            <dt>
              How
              <Sep>:</Sep>
            </dt>
            <dd>{cv.hire.route}</dd>
          </div>
          <div>
            <dt>
              Time zone
              <Sep>:</Sep>
            </dt>
            <dd>{cv.hire.overlap}</dd>
          </div>
          <div>
            <dt>
              Languages
              <Sep>:</Sep>
            </dt>
            <dd>
              <TodoText text={cv.hire.english} />
            </dd>
          </div>
        </dl>
      </section>

      <p className="cv-rev mono">
        {cv.contact.site}/cv · rev. {cv.rev}
      </p>
    </article>
  );
}

function Contact({ cv }: { cv: Cv }) {
  const c = cv.contact;
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Email", value: <a href={`mailto:${c.email}`}>{c.email}</a> },
    { label: "Based", value: c.timeZone.replace(/\.$/, "") },
    { label: "Site", value: <a href={`https://${c.site}`}>{c.site}</a> },
    {
      label: "LinkedIn",
      value: (
        <a href={`https://${c.linkedin}`} rel="me">
          {c.linkedin}
        </a>
      ),
    },
    {
      label: "GitHub",
      value: (
        <a href={`https://${c.github}`} rel="me">
          {c.github}
        </a>
      ),
    },
  ];
  return (
    <dl className="cv-contact mono" aria-label="Contact">
      {rows.map((row, i) => (
        <div key={row.label}>
          <dt>
            {row.label}
            <Sep>:</Sep>
          </dt>
          <dd>
            {row.value}
            {i < rows.length - 1 && <Sep> ·</Sep>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Punctuation the printed CV sets between a label and its value (", ", ": ",
 * " · "), hidden on screen, where the layout separates them. It is real text,
 * in the same run as the word before it, so a text extractor reads
 * "Email: …" and "Main engineer, Dimensione3" rather than "Email :".
 */
function Sep({ children }: { children: string }) {
  return <span className="cv-sep">{children}</span>;
}

function Outcomes({ items }: { items: string[] }) {
  return (
    <ul className="cv-outcomes">
      {items.map((item) => (
        <li key={item}>
          <TodoText text={item} />
        </li>
      ))}
    </ul>
  );
}
