// A heading's id, from its text, the way GitHub makes one: lower case, letters,
// digits, spaces and hyphens kept, spaces turned into hyphens. Work pages give
// their h2–h6 these ids (Markdown.tsx), and links from other pages to a
// section use them (test/content.test.ts checks every such link resolves).

export function headingId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

/** The ids of a markdown body's headings (## and deeper), in order, outside code fences. */
export function headingIds(markdown: string): string[] {
  const seen = new Map<string, number>();
  const ids: string[] = [];
  let fence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) fence = !fence;
    const m = !fence && line.match(/^#{2,6}\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = m[1].replace(/\*\*|__|[*_`]/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    const id = headingId(text);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    ids.push(n ? `${id}-${n}` : id);
  }
  return ids;
}
