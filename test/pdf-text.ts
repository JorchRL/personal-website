// The text of a PDF printed by Chromium (public/cv.pdf), read the way a text
// extractor reads it: fonts through their ToUnicode maps, glyph runs in the
// order they are drawn. Enough for the PDFs this site makes (Type0 fonts,
// Identity-H, FlateDecode streams); not a general PDF reader.

import { inflateSync } from "node:zlib";

type Obj = { dict: string; stream?: Buffer };

function objects(pdf: Buffer): Map<number, Obj> {
  const text = pdf.toString("latin1");
  const found = new Map<number, Obj>();
  const head = /(\d+) 0 obj\s*/g;
  let m: RegExpExecArray | null;
  while ((m = head.exec(text))) {
    const start = m.index + m[0].length;
    const end = text.indexOf("endobj", start);
    const body = text.slice(start, end);
    const at = body.indexOf("stream");
    if (at >= 0 && /\/Length/.test(body.slice(0, at))) {
      const dict = body.slice(0, at);
      let from = start + at + "stream".length;
      if (text[from] === "\r") from++;
      if (text[from] === "\n") from++;
      const to = text.lastIndexOf("endstream", end);
      const raw = pdf.subarray(from, to);
      let stream: Buffer = raw;
      if (/\/FlateDecode/.test(dict)) {
        try {
          stream = inflateSync(raw);
        } catch {
          stream = raw;
        }
      }
      found.set(Number(m[1]), { dict, stream });
    } else {
      found.set(Number(m[1]), { dict: body });
    }
  }
  return found;
}

const ref = (s: string | undefined) => (s ? Number(s) : undefined);

/** A ToUnicode CMap: glyph code (hex) to text. */
function cmap(source: string): Map<string, string> {
  const map = new Map<string, string>();
  const utf16 = (hex: string) => {
    const bytes = Buffer.from(hex, "hex");
    let out = "";
    for (let i = 0; i + 1 < bytes.length; i += 2) out += String.fromCharCode(bytes.readUInt16BE(i));
    return out;
  };
  for (const block of source.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const [, src, dst] of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      map.set(src.toUpperCase(), utf16(dst));
    }
  }
  for (const block of source.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const [, lo, hi, dst] of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      const a = parseInt(lo, 16);
      const b = parseInt(hi, 16);
      const base = parseInt(dst, 16);
      for (let c = a; c <= b; c++) {
        map.set(c.toString(16).toUpperCase().padStart(lo.length, "0"), String.fromCharCode(base + (c - a)));
      }
    }
  }
  return map;
}

/** Every page's text, in drawing order; runs of text separated by spaces. */
export function pdfText(pdf: Buffer): string {
  const objs = objects(pdf);
  const fontMaps = new Map<number, Map<string, string>>();
  const fontMap = (n: number) => {
    if (!fontMaps.has(n)) {
      const to = ref(objs.get(n)?.dict.match(/\/ToUnicode (\d+) 0 R/)?.[1]);
      const stream = to !== undefined ? objs.get(to)?.stream : undefined;
      fontMaps.set(n, stream ? cmap(stream.toString("latin1")) : new Map());
    }
    return fontMaps.get(n)!;
  };

  const pages = [...objs.values()].filter((o) => /\/Type\s*\/Page(?!s)/.test(o.dict));
  const out: string[] = [];
  for (const page of pages) {
    let resources = page.dict;
    const resRef = ref(page.dict.match(/\/Resources (\d+) 0 R/)?.[1]);
    if (resRef !== undefined) resources = objs.get(resRef)?.dict ?? "";
    let fonts = resources.match(/\/Font\s*<<([\s\S]*?)>>/)?.[1] ?? "";
    const fontsRef = ref(resources.match(/\/Font (\d+) 0 R/)?.[1]);
    if (fontsRef !== undefined) fonts = objs.get(fontsRef)?.dict ?? "";
    const names = new Map([...fonts.matchAll(/\/(\S+?) (\d+) 0 R/g)].map(([, name, n]) => [name, Number(n)]));

    const contentRefs = (page.dict.match(/\/Contents\s*(\[[^\]]*\]|\d+ 0 R)/)?.[1] ?? "").match(/\d+(?= 0 R)/g) ?? [];
    for (const c of contentRefs) {
      const content = objs.get(Number(c))?.stream?.toString("latin1") ?? "";
      let map = new Map<string, string>();
      // Font changes, glyph strings and text blocks, in order.
      for (const tok of content.matchAll(/\/(\S+) [\d.]+ Tf|<([0-9a-fA-F]*)> ?Tj|\[([^\]]*)\] ?TJ|\bET\b/g)) {
        if (tok[1]) {
          const n = names.get(tok[1]);
          map = n !== undefined ? fontMap(n) : new Map();
        } else if (tok[0] === "ET") {
          out.push(" ");
        } else {
          const hexes = tok[2] !== undefined ? [tok[2]] : [...(tok[3] ?? "").matchAll(/<([0-9a-fA-F]*)>/g)].map((h) => h[1]);
          for (const hex of hexes) {
            for (let i = 0; i + 4 <= hex.length; i += 4) out.push(map.get(hex.slice(i, i + 4).toUpperCase()) ?? "");
          }
        }
      }
    }
    out.push("\n");
  }
  return out.join("").replace(/[ \t]+/g, " ");
}

/**
 * Every link target in the PDF: the /URI of each link annotation, in plain
 * objects or inside compressed object streams.
 */
export function pdfLinks(pdf: Buffer): string[] {
  const sources = [pdf.toString("latin1")];
  for (const obj of objects(pdf).values()) {
    if (obj.stream && /\/Type\s*\/ObjStm/.test(obj.dict)) sources.push(obj.stream.toString("latin1"));
  }
  const links: string[] = [];
  for (const source of sources) {
    for (const [, uri] of source.matchAll(/\/URI\s*\(((?:\\.|[^\\)])*)\)/g)) links.push(uri.replace(/\\(.)/g, "$1"));
  }
  return links;
}
