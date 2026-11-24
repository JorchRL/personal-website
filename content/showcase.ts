// The home page's showcase: the best things to show, one slide each, in this
// order. Edit by hand.
//
// Each item names something that exists on the site:
//   { kind: "now" }                      content/now.md (what he is building this month)
//   { kind: "work", slug: "…" }          a work page, content/work/<slug>.md
//   { kind: "post", slug: "…" }          a post, content/blog/<slug>
//   { kind: "art" }                      the paintings (content/art/): the newest
//                                        three, or the ones `slugs` names (three or four)
// Optional on any item: `tab`, a short name for the tab bar (the item's own
// name otherwise), and `note`, one line of his own shown on the slide.
// A slug that names nothing fails the build, naming the item.

export type ShowcaseItem = { tab?: string; note?: string } & (
  | { kind: "now" }
  | { kind: "work"; slug: string }
  | { kind: "post"; slug: string }
  | { kind: "art"; slugs?: string[] }
);

export const showcase: ShowcaseItem[] = [
  { kind: "work", slug: "whiz-study" },
  { kind: "work", slug: "twinteraction" },
  { kind: "work", slug: "the-lone-wander" },
  { kind: "work", slug: "plain-engine" },
  { kind: "art", slugs: ["towards-the-light-of-carcosa", "tangerines", "cherry-blossom"] },
];
