// Paintings: content/art/<slug>.md, newest first. Each names its picture
// under public/art/ (its size in pixels is read from the file) and its paper
// and paints by their keys in content/materials.ts. The file's body is an
// optional note in his words. The close-up viewer's maps, when `pnpm
// art:prepare` made them, are in public/art/<slug>/ (viewer.json lists them).

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { paints, paperFibre, papers, paperSurface, paperWeight, usualSheet, type PaperKey } from "@content/materials";
import { site } from "@content/site";
import { stripTodos } from "./todos";
import { ART_PATH } from "@/seo/urls";
import { sheetNo } from "@/ui/sections";
import { headerSize } from "./image-size";
import { artFrontmatter, markdownFiles, readContentFile, type ArtMeta } from "./schema";
import { readViewer, type Viewer } from "./viewer";

export type Painting = ArtMeta & {
  /** The note, as written (markdown); empty when there is none. */
  body: string;
  /** The picture's size in pixels, read from its file. */
  pixels: { width: number; height: number };
  /** The close-up viewer's maps (public/art/<slug>/), when they were made. */
  viewer?: Viewer;
};

const ART_DIR = path.join(process.cwd(), "content/art");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Reads every painting in `dir`, newest first. Throws on invalid frontmatter or a missing picture. */
export function readArt(dir: string, publicDir = PUBLIC_DIR): Painting[] {
  const art = markdownFiles(dir)
    .map((file): Painting => {
      const { slug, data, body } = readContentFile(file, artFrontmatter);
      const from = path.relative(process.cwd(), file);
      const viewer = readViewer(slug, publicDir, from);
      return {
        slug,
        ...data,
        body: body.trim(),
        pixels: pictureSize(data.image, from, publicDir),
        ...(viewer ? { viewer } : {}),
      };
    })
    // Newest first; a painting whose year is still a TODO goes first.
    .sort((a, b) => (knownYear(b) ?? 9999) - (knownYear(a) ?? 9999) || a.title.localeCompare(b.title));
  return art;
}

/** Its year, when he has given it. */
export const knownYear = (p: Pick<Painting, "year">): number | undefined => (typeof p.year === "number" ? p.year : undefined);

/** Its year as written: "2026", or its TODO. */
export const yearLabel = (p: Pick<Painting, "year">): string => String(p.year);

/** "2025–2026", or "2026": the years of these paintings that are known. */
export function yearSpan(art: Pick<Painting, "year">[]): string {
  const years = art.map(knownYear).filter((y) => y !== undefined);
  return years.length ? `${Math.min(...years)}–${Math.max(...years)}`.replace(/^(\d+)–\1$/, "$1") : "";
}

/** Whether the page offers an enquiry: his to part with, and not fan art. */
export const offersEnquiry = (p: Pick<Painting, "available" | "fanArt">): boolean => p.available && !p.fanArt;

/** Its title without a TODO, for subjects, machine forms and labels: its title, or "Untitled". */
export const titlePlain = (p: Pick<Painting, "title">): string => stripTodos(p.title) || "Untitled";

/** Fan art's label: "Fan art of Majora's Mask. Characters © Nintendo. Not for sale." Undefined for his own paintings. */
export function fanArtLabel(p: Pick<Painting, "fanArt" | "subject" | "owner">): string | undefined {
  if (!p.fanArt) return undefined;
  return `Fan art${p.subject ? ` of ${p.subject}` : ""}. ${p.owner ? `Characters © ${p.owner}. ` : ""}Not for sale.`;
}

/** The enquiry's mailto link, the painting named in the subject: "Painting: Blue study (2026)". */
export function enquiryHref(p: Pick<Painting, "title" | "year">): string {
  const year = knownYear(p);
  const subject = `Painting: ${titlePlain(p)}${year ? ` (${year})` : ""}`;
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;
}

/** Where prints are sold, when set and not fan art. */
export const printsLink = (p: Pick<Painting, "prints" | "fanArt">): string | undefined => (p.fanArt ? undefined : p.prints);

function pictureSize(src: string, from: string, publicDir: string) {
  const file = path.join(publicDir, src);
  if (!existsSync(file)) throw new Error(`${from}: image ${src} is not in public/ (public${src})`);
  const size = headerSize(readFileSync(file));
  if (!size) throw new Error(`${from}: image ${src} is not a JPEG, PNG or WebP this site can read`);
  return size;
}

export function getAllArt(): Painting[] {
  return readArt(ART_DIR);
}

/** A painting's number on Art's sheet: "4.1" for the newest while Art is Sheet 04. */
export const plateNo = (index: number) => `${Number(sheetNo(ART_PATH))}.${index + 1}`;

export function getArt(slug: string): Painting | undefined {
  return getAllArt().find((p) => p.slug === slug);
}

const cm = (n: number) => String(n);

/** Width and height in centimetres: its own, or the usual sheet turned the way its picture is. */
export function sizeCm(painting: Pick<Painting, "size" | "pixels">): { width: number; height: number } {
  if (painting.size) return painting.size;
  const long = Math.max(usualSheet.width, usualSheet.height);
  const short = Math.min(usualSheet.width, usualSheet.height);
  const upright = painting.pixels.height > painting.pixels.width;
  return upright ? { width: short, height: long } : { width: long, height: short };
}

/** "27 × 21.5 cm", or "About 27 × 21.5 cm" for the usual sheet. */
export function sizeLabel(painting: Pick<Painting, "size" | "pixels">): string {
  const { width, height } = sizeCm(painting);
  return `${painting.size ? "" : "About "}${cm(width)} × ${cm(height)} cm`;
}

const knownPaper = (p: Pick<Painting, "paper">): PaperKey | undefined =>
  Object.hasOwn(papers, p.paper) ? (p.paper as PaperKey) : undefined;

/** What every paper is: "100% cotton, 300 gsm (140 lb), cold press". */
const paperSpec = `${paperFibre}, ${paperWeight}, ${paperSurface}`;

/** "Arches, 100% cotton, 300 gsm (140 lb), cold press"; while the paper is a TODO, the rest and the TODO. */
export function paperLabel(painting: Pick<Painting, "paper">): string {
  const key = knownPaper(painting);
  return key ? `${papers[key]}, ${paperSpec}` : `${capital(paperSpec)}. ${painting.paper}`;
}

/** The paper without a TODO, for machine forms and summaries: "Arches, 100% cotton, 300 gsm (140 lb), cold press", or the same without the name. */
export function paperPlain(painting: Pick<Painting, "paper">): string {
  const key = knownPaper(painting);
  return key ? `${papers[key]}, ${paperSpec}` : paperSpec;
}

/** Its own `medium`, or "Watercolour", or "Watercolour and gouache" when a gouache is among its paints. */
export function mediumLabel(painting: Pick<Painting, "paints" | "medium">): string {
  if (painting.medium) return painting.medium;
  const gouache = (painting.paints ?? []).some((key) => paints[key].medium === "gouache");
  return gouache ? "Watercolour and gouache" : "Watercolour";
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Its paints' names, as listed ("Ultramarine blue", "White gouache"). */
export function paintNames(painting: Pick<Painting, "paints">): string[] {
  return (painting.paints ?? []).map((key) => capital(paints[key].name));
}

/** Its paints with their pigments' codes: "Ultramarine blue (PB29)", "New gamboge (PY97, PY110)". */
export function paintsWithPigments(painting: Pick<Painting, "paints">): string[] {
  return (painting.paints ?? []).map((key) => `${capital(paints[key].name)} (${paints[key].pigments.join(", ")})`);
}

/** One sentence that says what it is, without TODOs: "Watercolour on Arches, 100% cotton, 300 gsm (140 lb), cold press, about 27 × 21.5 cm, 2026." */
export function summary(p: Painting): string {
  const year = knownYear(p);
  return `${mediumLabel(p)} on ${paperPlain(p)}, ${sizeLabel(p).replace(/^About/, "about")}${year ? `, ${year}` : ""}.`;
}

/** His paints, one line per maker's kind. From content/materials.ts. */
export function paintsLines(): string[] {
  const groups = new Map<string, string[]>();
  for (const paint of Object.values(paints)) {
    const kind = `${paint.maker} ${paint.medium === "watercolour" ? "watercolours" : paint.medium}`;
    groups.set(kind, [...(groups.get(kind) ?? []), paint.name]);
  }
  // One paint of its kind reads as a name ("Royal Talens white gouache" if one were called so); more, as a list.
  return [...groups].map(([kind, names]) =>
    names.length === 1 && names[0].endsWith(kind.split(" ").pop()!)
      ? `${kind.split(" ").slice(0, -1).join(" ")} ${names[0]}.`
      : `${kind}: ${names.join(", ")}.`,
  );
}

/** What he paints with, said once for the gallery: his paints, then the paper. */
export function materialsLines(): string[] {
  const paperNames = Object.values(papers);
  const sheet = `${cm(usualSheet.width)} × ${cm(usualSheet.height)} cm`;
  return [...paintsLines(), `On ${paperFibre} paper, ${paperNames.join(" or ")}, ${paperWeight}, ${paperSurface}, about ${sheet}.`];
}
