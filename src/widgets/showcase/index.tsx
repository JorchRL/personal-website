// 01 Showcase: a few of the best things to show (content/showcase.ts), one
// per slide, in a deck under a tab bar (src/widgets/Deck.tsx). Every slide is
// rendered here, on the server.

import { showcase } from "@content/showcase";
import { SectionHead, sub } from "@/ui/SectionHead";
import { Deck } from "../Deck";
import type { FaceProps, WidgetManifest } from "../types";
import { resolveShowcase } from "./items";
import { Slide } from "./Slide";

export const manifest: WidgetManifest = {
  slug: "showcase",
  title: "Showcase",
  description: "A few of his best things, one at a time.",
  size: "full",
  order: 20,
  section: { id: "showcase" },
};

export function Face({ no }: FaceProps) {
  const slides = resolveShowcase(showcase);
  return (
    <section className="sec showcase" id="showcase" aria-labelledby="h-showcase">
      <SectionHead no={no} id="showcase" title="Showcase" />
      <Deck
        label="Showcase"
        sections={slides.map((s, i) => ({ id: s.id, no: sub(no, i), title: s.tab, kind: s.label, aliases: s.aliases }))}
        panels={slides.map((s, i) => (
          <Slide key={s.id} slide={s} no={sub(no, i)} />
        ))}
      />
    </section>
  );
}
