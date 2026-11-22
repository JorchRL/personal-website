// The home document: the first screen, then the numbered sections (01
// Showcase, the deck of src/widgets/showcase; Two doors; Contact). Each
// widget's face is rendered here, on the server, so every text and link is in
// the HTML. Sizes map to column spans in globals.css (.cell-*); under 1100 px
// every cell is full width. Cells stay in registry order at every width, so
// keyboard focus follows the screen.

import { sections, widgets } from "./registry";

export function Grid() {
  const numbered = sections();
  return (
    <div className="doc grid">
      {widgets.map(({ manifest, Face }) => {
        const no = numbered.find((s) => s.slug === manifest.slug)?.no;
        return (
          <div key={manifest.slug} className={`cell cell-${manifest.size}`} data-widget={manifest.slug}>
            <Face no={no} />
          </div>
        );
      })}
    </div>
  );
}
