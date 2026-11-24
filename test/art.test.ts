// The paintings (content/art/<slug>.md): every one reads, names real
// materials and a real picture, and a placeholder painting cannot reach
// production unnoticed.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it } from "vitest";
import { paints, papers } from "@content/materials";
import { site } from "@content/site";
import { Offer } from "@/art/Offer";
import {
  enquiryHref,
  fanArtLabel,
  getAllArt,
  knownYear,
  materialsLines,
  mediumLabel,
  offersEnquiry,
  paintNames,
  paintsWithPigments,
  paperLabel,
  paperPlain,
  plateNo,
  printsLink,
  readArt,
  sizeLabel,
  type Painting,
} from "@/content/art";
import { shownSections } from "@/ui/sections";

const root = process.cwd();
const art = getAllArt();

describe("the paintings", () => {
  it("each read, with alt text and a picture found in public/art/", () => {
    expect(art.length).toBeGreaterThan(0);
    for (const p of art) {
      expect(p.alt.length, p.slug).toBeGreaterThan(10);
      expect(p.pixels.width, p.slug).toBeGreaterThan(0);
    }
  });

  it("are numbered on Art's sheet: its number in the running head, then the painting's", () => {
    const sheet = Number(shownSections().find((s) => s.href === "/art")?.no);
    expect(plateNo(0)).toBe(`${sheet}.1`);
  });

  it("run newest first, a painting whose year is still a TODO first", () => {
    const years = art.map((p) => knownYear(p) ?? 9999);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it("name paper and paints from content/materials.ts (or a TODO for the paper)", () => {
    for (const p of art) {
      if (!p.paper.startsWith("TODO(jorge): ")) expect(Object.keys(papers), p.slug).toContain(p.paper);
      for (const key of p.paints ?? []) expect(Object.keys(paints), p.slug).toContain(key);
    }
  });
});

describe("a painting's facts", () => {
  const painting = { size: undefined, pixels: { width: 2000, height: 1600 }, paper: "arches" as const };

  it("give the usual sheet turned the way the picture is, or its own size", () => {
    expect(sizeLabel(painting)).toBe("About 27 × 21.5 cm");
    expect(sizeLabel({ ...painting, pixels: { width: 1600, height: 2000 } })).toBe("About 21.5 × 27 cm");
    expect(sizeLabel({ ...painting, size: { width: 38, height: 28 } })).toBe("38 × 28 cm");
  });

  it("name the paper, the medium and the paints", () => {
    expect(paperLabel(painting)).toBe("Arches, 100% cotton, 300 gsm (140 lb), cold press");
    expect(paperLabel({ paper: "TODO(jorge): which paper" })).toBe("100% cotton, 300 gsm (140 lb), cold press. TODO(jorge): which paper");
    expect(paperPlain({ paper: "TODO(jorge): which paper" })).toBe("100% cotton, 300 gsm (140 lb), cold press");
    expect(mediumLabel({ paints: ["white-gouache"], medium: "Watercolour and ink" })).toBe("Watercolour and ink");
    expect(paintsWithPigments({ paints: ["ultramarine-blue", "new-gamboge"] })).toEqual([
      "Ultramarine blue (PB29)",
      "New gamboge (PY97, PY110)",
    ]);
    expect(mediumLabel({ paints: ["ultramarine-blue"] })).toBe("Watercolour");
    expect(mediumLabel({ paints: ["ultramarine-blue", "white-gouache"] })).toBe("Watercolour and gouache");
    expect(paintNames({ paints: ["paynes-grey", "burnt-sienna"] })).toEqual(["Payne's grey", "Burnt sienna"]);
  });

  it("say once, for the gallery, what he paints with", () => {
    expect(materialsLines()).toEqual([
      "Daniel Smith watercolours: ultramarine blue, phthalo blue, alizarin crimson, quinacridone red, hansa yellow light, new gamboge, buff titanium, Payne's grey, burnt sienna.",
      "Royal Talens Extra Fine titanium white gouache.",
      "On 100% cotton paper, Baohong or Arches, 300 gsm (140 lb), cold press, about 27 × 21.5 cm.",
    ]);
  });
});

describe("a painting's file", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "art-"));
  const publicDir = path.join(dir, "public");
  mkdirSync(path.join(publicDir, "art"), { recursive: true });
  const jpeg = readFileSync(path.join(root, "public", art[0].image));
  writeFileSync(path.join(publicDir, "art/one.jpg"), jpeg);
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const write = (frontmatter: string) => {
    const content = path.join(dir, `content-${Math.random().toString(36).slice(2)}`);
    mkdirSync(content);
    writeFileSync(path.join(content, "one.md"), `---\n${frontmatter}\n---\n`);
    return () => readArt(content, publicDir);
  };
  const good = "title: One\nyear: 2026\nimage: /art/one.jpg\nalt: A test picture.\npaper: arches\navailable: false";

  it("reads a valid one", () => {
    expect(write(good)()[0]).toMatchObject({ slug: "one", title: "One", paper: "arches", available: false, fanArt: false });
  });

  it("takes a TODO for a missing year or paper", () => {
    const todo = good
      .replace("year: 2026", 'year: "TODO(jorge): the year"')
      .replace("paper: arches", 'paper: "TODO(jorge): which paper"');
    expect(write(todo)()[0]).toMatchObject({ year: "TODO(jorge): the year", paper: "TODO(jorge): which paper" });
  });

  it("asks fan art for its subject and owner, and labels it", () => {
    expect(write(`${good}\nfanArt: true`)).toThrow(/fan art needs it/);
    const fan = write(`${good}\nfanArt: true\nsubject: Majora's Mask\nowner: Nintendo`)()[0];
    expect(fanArtLabel(fan)).toBe("Fan art of Majora's Mask. Characters © Nintendo. Not for sale.");
    expect(fanArtLabel({ fanArt: false })).toBeUndefined();
    expect(write(good)()[0].making).toBeUndefined();
    expect(write(`${good}\nmaking: Two sittings.`)()[0].making).toBe("Two sittings.");
  });

  it("takes prints only as an https link", () => {
    expect(write(`${good}\nprints: http://example.com`)).toThrow(/prints: must be an https:\/\/ link/);
    expect(write(`${good}\nprints: https://example.com/prints`)()[0].prints).toBe("https://example.com/prints");
  });

  it("fails the build on a paint or paper that is not in content/materials.ts, listing the keys", () => {
    expect(write(`${good}\npaints: [ultramarine-blu]`)).toThrow(/paints\.0: must be one of the paints in content\/materials\.ts: ultramarine-blue/);
    expect(write(good.replace("arches", "fabriano"))).toThrow(/paper: must be one of the papers in content\/materials\.ts: baohong, arches/);
  });

  it("fails without alt text, without `available`, or with a picture that is not there", () => {
    expect(write(good.replace("alt: A test picture.\n", ""))).toThrow(/alt:/);
    expect(write(good.replace("\navailable: false", ""))).toThrow(/available:/);
    expect(write(good.replace("/art/one.jpg", "/art/two.jpg"))).toThrow(/image \/art\/two\.jpg is not in public\//);
  });

  it("marks a placeholder with a TODO(jorge), and nothing else", () => {
    expect(write(`${good}\nplaceholder: "a dummy"`)).toThrow(/placeholder: must be "TODO\(jorge\): …"/);
  });
});

// The rule: a placeholder painting (a dummy, not one of Jorge's) must never
// reach production unnoticed. Its `placeholder` field is a TODO(jorge), so the
// TODO gate fails a production build while it is left, naming the file; and a
// picture named *.placeholder.* is a dummy, so the painting that shows it
// must be marked a placeholder.
describe("a placeholder painting cannot reach production unnoticed", () => {
  const placeholders = art.filter((p) => p.placeholder);

  it("shows a placeholder picture only on a painting marked placeholder", () => {
    for (const p of art) {
      if (/\.placeholder\.\w+$/.test(p.image)) expect(p.placeholder, `${p.slug} shows ${p.image}`).toBeDefined();
    }
  });

  it("carries a TODO(jorge) in its file, which the TODO gate counts", () => {
    for (const p of placeholders) {
      expect(readFileSync(path.join(root, "content/art", `${p.slug}.md`), "utf8")).toMatch(/placeholder: "TODO\(jorge\): /);
    }
  });

  it("fails a production build (VERCEL_ENV=production) while one is left, naming each", () => {
    const gate = spawnSync(process.execPath, ["scripts/todo-report.mjs", "--gate"], {
      cwd: root,
      env: { ...process.env, VERCEL_ENV: "production", STRICT_TODOS: "", STRICT_DRAFTS: "" },
      encoding: "utf8",
    });
    if (placeholders.length === 0) return;
    expect(gate.status).toBe(1);
    for (const p of placeholders) expect(gate.stderr).toContain(`content/art/${p.slug}.md`);
  });

  it("keeps every picture and viewer folder in public/art/ in use, so a replaced placeholder's files are not left behind", () => {
    const used = new Set(art.flatMap((p) => [p.image, `/art/${p.slug}`]));
    for (const file of readdirSync(path.join(root, "public/art"))) expect(used, file).toContain(`/art/${file}`);
  });
});

// Fan art (someone else's character) is never offered or printed, and an
// enquiry is offered only for a painting that is his to part with.
describe("the enquiry and the print", () => {
  const base: Pick<Painting, "available" | "fanArt" | "prints" | "title" | "year"> = {
    available: false,
    fanArt: false,
    title: "Blue study",
    year: 2026,
  };
  const html = (p: typeof base) => renderToStaticMarkup(createElement(Offer, { painting: p }));
  const all = [false, true].flatMap((available) =>
    [false, true].flatMap((fanArt) => [undefined, "https://prints.example/blue"].map((prints) => ({ ...base, available, fanArt, prints }))),
  );

  it("never shows an enquiry or a print link on fan art", () => {
    for (const p of all.filter((p) => p.fanArt)) {
      expect(html(p), JSON.stringify(p)).toBe("");
      expect(offersEnquiry(p)).toBe(false);
      expect(printsLink(p)).toBeUndefined();
    }
    for (const p of art.filter((p) => p.fanArt)) expect(html(p), p.slug).toBe("");
  });

  it("offers an enquiry only when the painting is available, naming it in the subject", () => {
    for (const p of all) {
      expect(html(p).includes("data-enquiry"), JSON.stringify(p)).toBe(p.available && !p.fanArt);
    }
    const offered = html({ ...base, available: true });
    expect(offered).toContain("Interested in this painting?");
    expect(offered).toContain(`href="mailto:${site.email}?subject=Painting%3A%20Blue%20study%20(2026)"`);
    expect(enquiryHref({ title: "TODO(jorge): a title", year: "TODO(jorge): a year" })).toBe(
      `mailto:${site.email}?subject=Painting%3A%20Untitled`,
    );
    for (const p of art) expect(html(p).includes("data-enquiry"), p.slug).toBe(p.available && !p.fanArt);
  });

  it("links a print only when its link is set", () => {
    for (const p of all) expect(html(p).includes("data-prints"), JSON.stringify(p)).toBe(!!p.prints && !p.fanArt);
    expect(html({ ...base, prints: "https://prints.example/blue" })).toContain('href="https://prints.example/blue"');
  });
});

describe("the close-up viewer's files (public/art/<slug>/)", () => {
  // They load only when a visitor turns an effect on, and then only one size
  // of one effect's files (about 2 to 3 MB); on disk, every size of both.
  it("are read for each painting that has them, and kept to a reasonable size", () => {
    for (const p of art.filter((p) => p.viewer)) {
      const dir = path.join(root, "public/art", p.slug);
      const bytes = readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((e) => e.isFile())
        .reduce((sum, e) => sum + statSync(path.join(e.parentPath, e.name)).size, 0);
      expect(bytes, `${p.slug}: ${(bytes / 1e6).toFixed(1)} MB`).toBeLessThan(12e6);
      expect(p.viewer!.lamp.length, p.slug).toBeGreaterThan(0);
    }
  });
});
