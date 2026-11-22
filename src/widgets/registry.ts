// The home document's widgets, in document order. Adding a widget: a folder
// in src/widgets/<slug>/ and one line in the list below (with its import).

import type { WidgetModule } from "./types";
import * as intro from "./intro";
import * as showcase from "./showcase";
import * as doors from "./doors";
import * as contact from "./contact";

const all: WidgetModule[] = [intro, showcase, doors, contact];

/** The widgets in the home document, in order. */
export const widgets: WidgetModule[] = [...all].sort((a, b) => a.manifest.order - b.manifest.order);

/** The home document's sections, numbered: what its "On this page" index lists. */
export function sections(): { slug: string; id: string; no: string; title: string }[] {
  let n = 0;
  return widgets.flatMap(({ manifest }) => {
    if (!manifest.section) return [];
    const no = manifest.section.mark ?? String(++n).padStart(2, "0");
    return [{ slug: manifest.slug, id: manifest.section.id, no, title: manifest.title }];
  });
}
