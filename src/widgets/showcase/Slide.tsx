// One slide of the showcase, as the sheet prints it: the figure on the left
// (a picture in a ruled frame; a work without one, its empty frame crossed
// corner to corner with what to record; Now, its dated lines), and on the
// right the kind and number, the name, the facts line, a line or two of the
// item's own description and the link to its page. Every slide has the same
// frame, so the deck's height changes little from one to the next.

import Link from "next/link";
import { Markdown } from "@/content/Markdown";
import { TodoText } from "@/content/TodoText";
import type { Slide as SlideData } from "./items";

export function Slide({ slide, no }: { slide: SlideData; no: string }) {
  return (
    <article className="slide" id={slide.id} aria-labelledby={`h-${slide.id}`} data-kind={slide.kind}>
      {slide.aliases.map((alias) => (
        <span key={alias} id={alias} className="alias" aria-hidden="true" />
      ))}
      <Figure slide={slide} />
      <div className="slide-text">
        <p className="slide-kind label">
          <b>{no}</b> {slide.label}
        </p>
        <h3 className="slide-title" id={`h-${slide.id}`}>
          <TodoText text={slide.title} />
        </h3>
        {slide.facts.length > 0 && (
          <p className="slide-facts mono">
            {slide.facts.map((fact, i) => (
              <span key={i}>
                {i > 0 && " · "}
                <TodoText text={fact} />
              </span>
            ))}
          </p>
        )}
        {slide.note && <p className="slide-note">{slide.note}</p>}
        {slide.text && (
          <p className="slide-lead">
            <TodoText text={slide.text} />
          </p>
        )}
        {slide.href && (
          <Link className="more" href={slide.href}>
            Open<span className="sr-only"> {slide.title}</span>
          </Link>
        )}
      </div>
    </article>
  );
}

function Figure({ slide }: { slide: SlideData }) {
  const { figure } = slide;
  if (figure.type === "image") {
    return (
      <figure className="slide-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={figure.src}
          alt={figure.alt}
          width={figure.width}
          height={figure.height}
          loading="lazy"
          decoding="async"
        />
      </figure>
    );
  }
  if (figure.type === "missing") {
    return (
      <figure className="slide-frame empty">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <line x1="0" y1="0" x2="100" y2="100" />
          <line x1="100" y1="0" x2="0" y2="100" />
        </svg>
        <figcaption className="slide-todo mono">
          <span className="mark">No recording yet</span>
          <TodoText text={figure.todo} />
        </figcaption>
      </figure>
    );
  }
  return (
    <div className="slide-frame now">
      <div className="slide-now">
        <Markdown source={figure.body} />
      </div>
    </div>
  );
}
