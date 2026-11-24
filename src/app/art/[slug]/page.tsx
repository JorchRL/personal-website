// /art/<slug>: one painting (content/art/<slug>.md). The picture, large and
// whole, with the close-up viewer's switches above it (src/art/viewer/: the
// Lamp, a lamp over the paper that follows the pointer, and the Layers, the
// painting as a shadow box; both off until chosen, and their code loads only
// then), then its facts (year, size,
// paper, medium, paints and their pigments), an enquiry when it is his to
// part with, his note if he wrote one, and the next painting.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pigmentsCheck } from "@content/materials";
import {
  getAllArt,
  fanArtLabel,
  getArt,
  mediumLabel,
  paintsWithPigments,
  paperLabel,
  plateNo,
  sizeLabel,
  summary,
  yearLabel,
  type Painting,
} from "@/content/art";
import { Markdown } from "@/content/Markdown";
import { Inspect } from "@/art/viewer/Inspect";
import { Offer } from "@/art/Offer";
import { TodoText } from "@/content/TodoText";
import { stripTodos } from "@/content/todos";
import { breadcrumbJsonLd, visualArtworkJsonLd } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";
import { ART_PATH, artPath } from "@/seo/urls";
import { JsonLd } from "@/ui/JsonLd";
import { PageHead } from "@/ui/PageHead";
import { Prose } from "@/ui/Prose";
import "../art.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArt().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const painting = getArt((await params).slug);
  if (!painting) return {};
  const note = stripTodos(painting.body).split("\n")[0];
  return pageMetadata({
    title: painting.title,
    description: [summary(painting), note].filter(Boolean).join(" "),
    path: artPath(painting.slug),
    markdown: `${artPath(painting.slug)}.md`,
    image: `${artPath(painting.slug)}/opengraph-image`,
  });
}

// The painting fills the sheet's width, up to about 78% of the screen's height.
const SIZES = "(max-width: 700px) 100vw, (max-width: 1440px) 90vw, 1300px";

/** The picture, as the page shows it. */
function Picture({ p }: { p: Painting }) {
  return (
    <span className="viewer-box">
      <Image src={p.image} alt={p.alt} width={p.pixels.width} height={p.pixels.height} sizes={SIZES} preload fetchPriority="high" />
    </span>
  );
}

export default async function PaintingPage({ params }: Props) {
  const { slug } = await params;
  const all = getAllArt();
  const index = all.findIndex((p) => p.slug === slug);
  const painting = all[index];
  if (!painting) notFound();
  const next = all[(index + 1) % all.length];
  const no = plateNo(index);

  return (
    <article className="art-page">
      <JsonLd data={visualArtworkJsonLd(painting)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Art", path: ART_PATH },
          { name: painting.title, path: artPath(painting.slug) },
        ])}
      />
      <PageHead
        kind="article"
        label={
          <>
            <Link href={ART_PATH}>Art</Link> / {no} of {all.length}
            {painting.fanArt && <span className="fan-art">Fan art</span>}
          </>
        }
        title={<TodoText text={painting.title} />}
        titleClass={painting.title.length < 16 ? "short" : ""}
        fit={painting.title}
      >
        {painting.placeholder && (
          <p className="dek">
            <TodoText text={painting.placeholder} />
          </p>
        )}
        <figure
          className="art-plate"
          style={{ "--ratio": (painting.pixels.width / painting.pixels.height).toFixed(4) } as React.CSSProperties}
        >
          {painting.viewer ? (
            <>
              {/* Without JavaScript the switches do nothing, so they are hidden. */}
              <noscript>
                <style>{".inspect { display: none; }"}</style>
              </noscript>
              <Inspect viewer={painting.viewer}>
                <Picture p={painting} />
              </Inspect>
            </>
          ) : (
            <div className="well">
              <Picture p={painting} />
            </div>
          )}
          <figcaption className="mono">
            <span className="fig">Pl. {no}</span>
            <TodoText text={painting.title} />. {summary(painting)}
            {painting.viewer && (
              <span className="how">
                {" "}
                Close-up: with the Lamp, the pointer is a lamp over the paper, whose relief is estimated from the scan
                {painting.viewer.layers
                  ? "; with the Layers, the painting is a shadow box cut by a depth model, and its layers shift as the pointer moves"
                  : ""}
                .
              </span>
            )}
          </figcaption>
        </figure>
        <Facts painting={painting} />
        {painting.fanArt && <p className="fan-note mono">{fanArtLabel(painting)}</p>}
        <Offer painting={painting} />
      </PageHead>

      <div className="article-body grid">
        <aside className="margin mono" aria-label="About this painting">
          <dl>
            <dt>Painting</dt>
            <dd>
              {no} of {all.length}
            </dd>
            <dt>Also as</dt>
            <dd>
              <a href={`${artPath(painting.slug)}.md`} type="text/markdown">
                Markdown
              </a>
            </dd>
            <dt>Index</dt>
            <dd>
              <Link href={ART_PATH}>All paintings</Link>
            </dd>
          </dl>
        </aside>
        {painting.body && (
          <Prose>
            <Markdown source={painting.body} />
          </Prose>
        )}
      </div>

      <footer className="article-end">
        <nav className="post-nav" aria-label="Next painting">
          <ul className="grid">
            <li>
              <span className="label">Next painting →</span>
              <Link href={artPath(next.slug)}>
                <TodoText text={next.title} />
              </Link>
            </li>
          </ul>
          <p className="all">
            <Link className="more" href={ART_PATH}>
              All paintings
            </Link>
          </p>
        </nav>
      </footer>
    </article>
  );
}

/** Year · size · paper · medium, and the paints with their pigments when he named them. */
function Facts({ painting }: { painting: Painting }) {
  const paints = paintsWithPigments(painting);
  return (
    <dl className="facts art-facts" style={{ "--facts": 4 + (paints.length ? 1 : 0) + (painting.making ? 1 : 0) } as React.CSSProperties}>
      <div>
        <dt>Year</dt>
        <dd>
          <TodoText text={yearLabel(painting)} />
        </dd>
      </div>
      <div>
        <dt>Size</dt>
        <dd>{sizeLabel(painting)}</dd>
      </div>
      <div>
        <dt>Paper</dt>
        <dd>
          <TodoText text={paperLabel(painting)} />
        </dd>
      </div>
      <div>
        <dt>Medium</dt>
        <dd>
          {mediumLabel(painting)}
          {painting.fanArt && <span className="fan-art">Fan art</span>}
        </dd>
      </div>
      {painting.making && (
        <div>
          <dt>Making</dt>
          <dd>{painting.making}</dd>
        </div>
      )}
      {paints.length > 0 && (
        <div className="wide">
          <dt>Paints and pigments</dt>
          <dd className="mono">
            <ul>
              {paints.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            {pigmentsCheck && (
              <p className="check">
                <TodoText text={pigmentsCheck} />
              </p>
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}
