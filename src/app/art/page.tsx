// /art: the paintings (content/art/), newest first, as plates on a contact
// sheet: each picture at its own shape, in rows that fill the sheet's width,
// with its number, title and year under it. The head says once what he
// paints with (content/materials.ts).

import Image from "next/image";
import Link from "next/link";
import { gallery } from "@content/gallery";
import { PaintsAndPaper } from "@/art/pigments/PaintsAndPaper";
import {
  getAllArt,
  knownYear,
  plateNo,
} from "@/content/art";
import { TodoText } from "@/content/TodoText";
import { pageMetadata } from "@/seo/metadata";
import { ART_PATH, artPath } from "@/seo/urls";
import { PageHead } from "@/ui/PageHead";
import { sheetLabel } from "@/ui/sections";
import "./art.css";

export const metadata = pageMetadata({
  title: "Art",
  description: gallery.summary,
  path: ART_PATH,
});

// How wide a plate shows (measured, art.css): on a phone the whole width
// inside the 16 px margins; on a tablet a plate can take most of a row; from
// 1100 px, rows about 330 px tall make a plate up to about 38% of the screen,
// and the sheet stops growing at 1440 px, so no plate is wider than about
// 520 px. The first plate is the page's largest paint on a phone, so its file
// should be no bigger than it shows.
const SIZES = "(max-width: 700px) calc(100vw - 32px), (max-width: 1100px) 70vw, (max-width: 1440px) 38vw, 520px";

export default function ArtIndex() {
  const art = getAllArt();
  return (
    <>
      <PageHead
        label={sheetLabel("/art")}
        status={art.length === 1 ? "1 painting" : `${art.length} paintings`}
        title="Art"
        aside={gallery.intro}
      />

      <section className="sec bare art-sheet" aria-label="Paintings">
        <ol className="plates">
          {art.map((p, i) => (
            <li
              key={p.slug}
              className="plate-cell"
              style={{ "--ratio": (p.pixels.width / p.pixels.height).toFixed(4) } as React.CSSProperties}
            >
              <Link href={artPath(p.slug)}>
                <span className="plate-pic">
                  <Image
                    src={p.image}
                    alt={p.alt}
                    width={p.pixels.width}
                    height={p.pixels.height}
                    sizes={SIZES}
                    // The first row shows on the first screen of a wide one.
                    preload={i === 0}
                    fetchPriority={i === 0 ? "high" : undefined}
                    loading={i === 0 ? undefined : "lazy"}
                  />
                </span>
                <span className="plate-cap mono">
                  <b>{plateNo(i)}</b>
                  <span className="t">
                    <TodoText text={p.title} />
                  </span>
                  {p.placeholder && <mark className="todo">Placeholder</mark>}
                  {p.fanArt && <span className="fan-art">Fan art</span>}
                  <span className="y">{knownYear(p) ?? <mark className="todo">Year</mark>}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* What he paints with, a swatch per paint (src/art/pigments/). */}
      <PaintsAndPaper />
    </>
  );
}
