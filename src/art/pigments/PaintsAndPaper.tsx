// /art's "Paints": a colour chart, one swatch per paint. Each swatch is a <details>: its summary is the swatch, its name and
// pigment codes; inside is the pigment's sheet (Colour Index name, chemistry,
// the maker's ratings, history, how it behaves, its sources). So with
// JavaScript off every swatch opens and closes, and all the text is in the page.
// PigmentChart (the live part) adds hover on a mouse, one sheet at a time in a
// drawer that slides out from under the chart over the page (so nothing moves),
// Escape and a Close button; it changes no text.

import { getSwatchCards, type CardRating, type Cited, type PaintCard } from "@/content/pigments";
import { TodoText } from "@/content/TodoText";
import { PigmentChart } from "./PigmentChart";
import { PaintSwatch, SwatchCopy } from "./Swatch";
import "./pigments.css";

const ROOT_ID = "paints-and-paper";

function Refs({ refs }: { refs: number[] }) {
  return <sup className="pig-ref">{refs.join(",")}</sup>;
}

function Fact({ fact }: { fact: Cited }) {
  return (
    <>
      {fact.text}
      <Refs refs={fact.refs} />
    </>
  );
}

/** A rating's marks: filled squares for its level out of its scale (one for granulation). */
function Marks({ rating }: { rating: CardRating }) {
  if (rating.level === null) return <span className="pig-marks none" aria-hidden="true">–</span>;
  return (
    <span className="pig-marks" aria-hidden="true">
      {Array.from({ length: rating.of }, (_, i) => (
        <i key={i} className={i < rating.level! ? "on" : undefined} />
      ))}
    </span>
  );
}

function Sources({ card }: { card: PaintCard }) {
  return (
    <div className="pig-sources">
      <span className="label">Sources</span>
      <ol className="mono">
        {card.sources.map((s) => (
          <li key={s.n}>
            <span className="n">{s.n}</span>
            <a href={s.url} rel="noopener" target="_blank">
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Head({ card, title }: { card: PaintCard; title: string }) {
  return (
    <div className="pig-sheet-head">
      <span className="label">
        Swatch <span className="pig-head-no">{card.no}</span> · {title}
      </span>
      <button type="button" className="pig-close mono" data-pig-close="">
        Close <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

function PaintSheet({ card }: { card: PaintCard }) {
  return (
    <div className="pig-sheet" role="group" aria-labelledby={`pig-${card.key}-name`}>
      {/* The sheet is the window under the chart; the drawer slides down inside it. */}
      <div className="pig-drawer">
        <Head card={card} title={card.maker} />
        <div className="pig-sheet-body">
          <figure className="pig-big">
            <SwatchCopy of={`pig-${card.key}-chip`} spec={card.swatch} className="pig-big-swatch" />
            <figcaption className="mono">
              {card.swatch.image ? "Scanned swatch" : "Masstone to wash, over a stripe of ink"}
            </figcaption>
          </figure>

          <div className="pig-id">
            <h3 id={`pig-${card.key}-name`}>{card.name}</h3>
            {card.pigments.map((p) => (
              <dl key={p.code} className="pig-chem">
                <dt className="label">Colour Index</dt>
                <dd>
                  <b className="mono pig-ci">{p.code}</b> {p.ciName}
                  {p.ciNumber && (
                    <>
                      {" · C.I. "}
                      <Fact fact={p.ciNumber} />
                    </>
                  )}
                  <span className="pig-common"> · {p.name}</span>
                </dd>
                <dt className="label">Chemistry</dt>
                <dd>
                  <Fact fact={p.chemical} />
                </dd>
                <dt className="label">Formula</dt>
                <dd className="pig-formula">
                  <Fact fact={p.formula} />
                </dd>
                <dt className="label">Class</dt>
                <dd>
                  <Fact fact={p.kind} />
                </dd>
                <dt className="label">History</dt>
                <dd>
                  <Fact fact={p.history} />
                </dd>
              </dl>
            ))}
          </div>

          <div className="pig-props-col">
            <table className="pig-props">
              <caption className="label">The maker’s ratings</caption>
              <tbody>
                {card.ratings.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="label">
                      {r.label}
                    </th>
                    <td>
                      <Marks rating={r} />
                    </td>
                    <td>
                      {r.words}
                      <Refs refs={r.refs} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pig-text">
              <span className="label">In water</span> <Fact fact={card.behaviour} />
            </p>
            {card.note && (
              <p className="pig-text">
                <span className="label">The paint</span> <Fact fact={card.note} />
              </p>
            )}
            {card.artistNote && (
              <p className="pig-text">
                <span className="label">From my painting:</span> {card.artistNote}
              </p>
            )}
            {card.check && (
              <p className="pig-text pig-check">
                <TodoText text={card.check} />
              </p>
            )}
          </div>
        </div>
        <Sources card={card} />
      </div>
    </div>
  );
}

export function PaintsAndPaper() {
  const cards = getSwatchCards();
  return (
    <section id={ROOT_ID} className="pig grid" aria-labelledby={`${ROOT_ID}-title`}>
      <h2 id={`${ROOT_ID}-title`} className="label pig-title">
        Paints
      </h2>
      {cards.some((card) => !card.swatch.image) && (
        <p className="mono pig-drawn">Open a swatch for its pigment. Swatches are drawn, not scanned: their colours are approximate.</p>
      )}
      {/* Without JavaScript the chart is a list: each swatch opens in place. */}
      <noscript>
        <style>{".pig-strip{grid-template-columns:1fr!important}.pig-cell{border-left:0!important}.pig-sum{display:grid!important;grid-template-columns:48px 1fr;column-gap:14px}.pig-sum .pig-chip{grid-row:span 3}.pig-sheet{position:static!important}.pig-close{display:none!important}"}</style>
      </noscript>
      <ol className="pig-strip" aria-label="Swatches: open one for its pigment">
        {cards.map((card) => (
          <li key={card.key} className="pig-cell">
            <details className="pig-item" id={`pig-${card.key}`}>
              <summary className="pig-sum">
                <span className="pig-chip">
                  <PaintSwatch id={`pig-${card.key}-chip`} spec={card.swatch} />
                </span>
                <span className="pig-no mono">{card.no}</span>
                <span className="pig-name">{card.name}</span>
                <span className="pig-code mono">{card.codes.join(" ")}</span>
              </summary>
              <PaintSheet card={card} />
            </details>
          </li>
        ))}
      </ol>
      <PigmentChart rootId={ROOT_ID} />
    </section>
  );
}
