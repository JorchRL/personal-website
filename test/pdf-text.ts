// The text of public/cv.pdf (typeset by XeTeX through Tectonic, pnpm cv:pdf),
// read the way a text extractor reads it: fonts through their ToUnicode maps,
// glyph runs in the order they are drawn, objects inside compressed object
// streams included. Word spaces are kerns and line moves, read as spaces, so
// a word can also be split by a font change ("**90+**." reads "90+ ."):
// compare text with `squash`. Enough for the PDFs this site makes (Type0
// fonts, Identity-H, FlateDecode streams); not a general PDF reader.

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
  // Objects packed in object streams (PDF 1.5): "num offset" pairs, then the bodies.
  for (const obj of [...found.values()]) {
    if (!obj.stream || !/\/Type\s*\/ObjStm/.test(obj.dict)) continue;
    const first = Number(obj.dict.match(/\/First (\d+)/)?.[1] ?? 0);
    const data = obj.stream.toString("latin1");
    const pairs = (data.slice(0, first).match(/\d+/g) ?? []).map(Number);
    for (let i = 0; i < pairs.length; i += 2) {
      const end = i + 3 < pairs.length ? first + pairs[i + 3] : data.length;
      found.set(pairs[i], { dict: data.slice(first + pairs[i + 1], end) });
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
      // Font changes, glyph strings, line moves and text blocks, in order.
      const glyphs = (hex: string) => {
        for (let i = 0; i + 4 <= hex.length; i += 4) out.push(map.get(hex.slice(i, i + 4).toUpperCase()) ?? "");
      };
      for (const tok of content.matchAll(/\/(\S+) [\d.]+ Tf|<([0-9a-fA-F]*)> ?Tj|\[([^\]]*)\] ?TJ|\b(?:ET|Td|TD|T\*)\b/g)) {
        if (tok[1]) {
          const n = names.get(tok[1]);
          map = n !== undefined ? fontMap(n) : new Map();
        } else if (tok[2] !== undefined) {
          glyphs(tok[2]);
        } else if (tok[3] !== undefined) {
          // In a TJ array, a gap of a fifth of an em or more is a word space.
          for (const [, hex, kern] of tok[3].matchAll(/<([0-9a-fA-F]*)>|(-?[\d.]+)/g)) {
            if (hex !== undefined) glyphs(hex);
            else if (Number(kern) <= -200) out.push(" ");
          }
        } else {
          out.push(" ");
        }
      }
    }
    out.push("\n");
  }
  return out.join("").replace(/[ \t]+/g, " ");
}

/** The PDF's text with every space and line break taken out, for comparing. */
export function squash(text: string): string {
  return text.replace(/\s+/g, "");
}

/** How many pages the PDF has. */
export function pdfPageCount(pdf: Buffer): number {
  return [...objects(pdf).values()].filter((o) => /\/Type\s*\/Page(?!s)/.test(o.dict)).length;
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
