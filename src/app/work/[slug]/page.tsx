import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cvEntryPath, cvSlugs } from "@/content/cv";
import { getAllWork, getWork, type Work } from "@/content/work";
import { Markdown } from "@/content/Markdown";
import { TodoText } from "@/content/TodoText";
import { breadcrumbJsonLd } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";
import { workPath } from "@/seo/urls";
import { Closing } from "@/ui/Closing";
import { JsonLd } from "@/ui/JsonLd";
import { PageHead } from "@/ui/PageHead";
import { Prose } from "@/ui/Prose";
import "../work.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWork().map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = getWork((await params).slug);
  if (!work) return {};
  return pageMetadata({
    title: work.title,
    description: work.description,
    path: `/work/${work.slug}`,
    markdown: `/work/${work.slug}.md`,
    image: `/work/${work.slug}/opengraph-image`,
  });
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const all = getAllWork();
  const index = all.findIndex((w) => w.slug === slug);
  const work = all[index];
  if (!work) notFound();
  const next = all[(index + 1) % all.length];

  return (
    <article className="work-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Work", path: "/work" },
          { name: work.title, path: workPath(work.slug) },
        ])}
      />
      <PageHead
        kind="article"
        label={
          <>
            <Link href="/work">Work</Link> / 1.{index + 1} of {all.length}
          </>
        }
        status={<TodoText text={work.period} />}
        title={<TodoText text={work.title} />}
        titleClass={work.title.length < 16 ? "short" : ""}
        fit={work.title}
      >
        <p className="dek">
          <TodoText text={work.description} />
        </p>
        <Figure work={work} />
        <Facts work={work} />
      </PageHead>

      <div className="article-body grid">
        <aside className="margin mono" aria-label="About this project">
          <dl>
            <dt>Project</dt>
            <dd>
              1.{index + 1} of {all.length}
            </dd>
            <dt>Also as</dt>
            <dd>
              <a href={`/work/${work.slug}.md`} type="text/markdown">
                Markdown
              </a>
            </dd>
            <dt>Index</dt>
            <dd>
              <Link href="/work">All work</Link>
            </dd>

          </dl>
        </aside>
        <Prose>
          <Markdown source={work.body} headingIds />
        </Prose>
      </div>

      <footer className="article-end">
        {/* Its CV button opens this project's entry on the CV, where it has one. */}
        <Closing label="Built by" cv={cvSlugs().includes(work.slug) ? cvEntryPath(work.slug) : undefined} />
        <nav className="post-nav" aria-label="Next project">
          <ul className="grid">
            <li>
              <span className="label">Next project →</span>
              <Link href={`/work/${next.slug}`}>
                <TodoText text={next.title} />
              </Link>
            </li>
          </ul>
          <p className="all">
            <Link className="more" href="/work">
              All work
            </Link>
          </p>
        </nav>
      </footer>
    </article>
  );
}

/**
 * What the page opens with: the work's picture or video, or, until one
 * exists, an empty frame (crossed, as a drawing marks a space to fill) with
 * a TODO naming what to record.
 */
function Figure({ work }: { work: Work }) {
  const figure = work.figure;
  if (figure && typeof figure === "object") {
    const video = /\.(mp4|webm)$/i.test(figure.src);
    return (
      <figure className="plate work-fig">
        <div className="frame" style={{ aspectRatio: `${figure.width} / ${figure.height}` }}>
          {video ? (
            <video src={figure.src} poster={figure.poster} width={figure.width} height={figure.height} controls muted playsInline preload="none">
              {figure.alt}
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} />
          )}
        </div>
        {figure.caption && (
          <figcaption className="mono">
            <span className="fig">Fig. 1</span> {figure.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  const todo = figure ?? "TODO(jorge): a video, a playable build or a screenshot of this work";
  return (
    <figure className="plate work-fig empty">
      <div className="frame" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          <line x1="0" y1="0" x2="100" y2="100" />
          <line x1="100" y1="0" x2="0" y2="100" />
        </svg>
        <span className="mark mono">No recording yet</span>
      </div>
      <figcaption className="mono">
        <span className="fig">Fig. 1</span> <TodoText text={todo} />
      </figcaption>
    </figure>
  );
}

/** Role · team · timeline · engine or stack, and the links. */
function Facts({ work }: { work: Work }) {
  const links = work.links ?? [];
  const count = 3 + (work.team ? 1 : 0) + (links.length ? 1 : 0);
  return (
    <dl className="facts work-facts" style={{ "--facts": count } as React.CSSProperties}>
      <div>
        <dt>Role</dt>
        <dd>
          <TodoText text={work.role} />
        </dd>
      </div>
      {work.team && (
        <div>
          <dt>Team</dt>
          <dd>
            <TodoText text={work.team} />
          </dd>
        </div>
      )}
      {/* On a phone the facts sit two to a row: the timeline takes a whole
          row when it would otherwise sit alone beside an empty cell. */}
      <div className={work.team && !links.length ? "wide" : ""}>
        <dt>Timeline</dt>
        <dd>
          <TodoText text={work.period} />
        </dd>
      </div>
      <div className={links.length ? "" : "wide"}>
        <dt>Engine and stack</dt>
        <dd className="mono">
          <ul>
            {work.stack.map((item) => (
              <li key={item}>
                <TodoText text={item} />
              </li>
            ))}
          </ul>
        </dd>
      </div>
      {links.length > 0 && (
        <div className="wide">
          <dt>Links</dt>
          <dd>
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <a className="ext" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
    </dl>
  );
}
