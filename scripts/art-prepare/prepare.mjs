// pnpm art:prepare <scan> --slug <slug> [options]
//
// Makes, from one scan of a painting, everything the site shows of it, on
// this machine (the scan is never uploaded anywhere; the depth model's
// weights are downloaded once into scripts/art-prepare/.model-cache/):
//
//   public/art/<slug>.jpg                      the picture the pages show (2400 px on
//                                              its long side; the site makes the smaller
//                                              sizes and the WebP copies)
//   public/art/<slug>/viewer.json              what the close-up viewer has
//   public/art/<slug>/lamp/<width>.webp        the scan for the Lamp: the viewer
//                                              estimates the paper's relief and normals
//                                              from it on the GPU (src/art/viewer/lamp/)
//   public/art/<slug>/layers/<width>/L<n>.webp the Layers' cut-out cards, back to front,
//                                              filled where they were never painted
//   public/art/<slug>/layers/<width>/paper.webp the bare paper, kept still at the front
//   public/art/<slug>/layers/<width>/colour.webp the painting with the paper filled in
//                                              (the depth field)
//   public/art/<slug>/layers/height.webp       the depth (16 bits in R and B) and the
//                                              layer of each pixel (G), lossless
//
// and, in .art-work/<slug>/ (not committed): the depth estimate and a
// preview of the layers (cuts.png), to check by eye.
//
// Options:
//   --dpi <n>            the scan's resolution (default 600): sets the sheet's size
//   --sheet <w>x<h>      the sheet's size in millimetres, instead of --dpi
//   --recipe <file>      the layers drawn by hand (default: recipes/<slug>.json when it
//                        exists; see labelsFromRecipe in layers.mjs)
//   --layers <n>         without a recipe, how many layers cut by depth, 2 to 5
//                        (default 4); 1 for the Lamp alone
//   --cuts <a,b,…>       without a recipe, the depth cuts (0 to 1, ascending) instead of
//                        the default ones; reuses the saved depth, so a re-cut is quick
//   --lamp-sizes <w,…>   the widths of the Lamp's scan (default 3072,2048)
//   --layer-sizes <w,…>  the widths of the cards (default 3072,1536)
//   --keep-picture       leave public/art/<slug>.* as it is (a placeholder's picture)

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import {
  card,
  cleanLabels,
  colourFilled,
  defaultCuts,
  depthsOf,
  estimateDepth,
  heightMap,
  labelsFromCuts,
  labelsFromRecipe,
  paperMask,
  preview,
  refineDepth,
} from "./layers.mjs";

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, "../..");

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: "string" },
    dpi: { type: "string", default: "600" },
    sheet: { type: "string" },
    recipe: { type: "string" },
    layers: { type: "string", default: "4" },
    cuts: { type: "string" },
    "lamp-sizes": { type: "string", default: "3072,2048" },
    "layer-sizes": { type: "string", default: "3072,1536" },
    "keep-picture": { type: "boolean", default: false },
  },
});

const fail = (msg) => {
  console.error(`art:prepare: ${msg}`);
  process.exit(1);
};
const cwd = process.env.INIT_CWD ?? process.cwd();

const scan = positionals[0] && path.resolve(cwd, positionals[0]);
if (!scan || !existsSync(scan)) fail("give the scan's path: pnpm art:prepare <scan.png> --slug <slug>");
const slug = opt.slug;
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail("give the painting's slug, e.g. --slug harbour-at-dusk");
const widths = (s, flag) => {
  const w = s.split(",").map(Number).filter((n) => n >= 256).sort((a, b) => b - a);
  if (!w.length) fail(`${flag}: widths of at least 256 px, e.g. 3072,2048`);
  return w;
};
const lampSizes = widths(opt["lamp-sizes"], "--lamp-sizes");
const layerSizes = widths(opt["layer-sizes"], "--layer-sizes");
const recipeFile = opt.recipe ? path.resolve(cwd, opt.recipe) : path.join(HERE, "recipes", `${slug}.json`);
const recipe = existsSync(recipeFile) ? JSON.parse(readFileSync(recipeFile, "utf8")) : null;
if (opt.recipe && !recipe) fail(`--recipe: ${recipeFile} is not there`);

const outDir = path.join(ROOT, "public/art", slug);
const workDir = path.join(ROOT, ".art-work", slug);
mkdirSync(workDir, { recursive: true });
const t0 = performance.now();
const step = (what) => console.log(`  ${((performance.now() - t0) / 1000).toFixed(1).padStart(5)} s  ${what}`);

// ---- the scan and the sheet
const meta = await sharp(scan).metadata();
const sheetMM = opt.sheet
  ? opt.sheet.split("x").map(Number)
  : [(meta.width / Number(opt.dpi)) * 25.4, (meta.height / Number(opt.dpi)) * 25.4];
if (sheetMM.length !== 2 || sheetMM.some((v) => !(v > 0))) fail("--sheet: width x height in mm, e.g. 268x210");
console.log(`art:prepare ${slug}: ${path.basename(scan)}, ${meta.width} × ${meta.height} px, sheet ${sheetMM.map((v) => v.toFixed(1)).join(" × ")} mm`);
const flat = () => sharp(scan, { limitInputPixels: false }).rotate().flatten({ background: "#ffffff" });
const heightFor = (w) => Math.round((meta.height * w) / meta.width);

// ---- the picture the pages show
if (!opt["keep-picture"]) {
  const file = path.join(ROOT, "public/art", `${slug}.jpg`);
  await flat().resize(2400, 2400, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(file);
  step(`picture: public/art/${slug}.jpg`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(path.join(outDir, "lamp"), { recursive: true });

// ---- the Lamp: the scan itself, at the sizes the viewer estimates the relief from
const lamp = [];
for (const w of lampSizes.filter((w) => w <= meta.width)) {
  await flat().resize(w, heightFor(w), { fit: "fill" }).removeAlpha().webp({ quality: 92, effort: 5 }).toFile(path.join(outDir, "lamp", `${w}.webp`));
  lamp.push({ width: w, height: heightFor(w) });
}
if (!lamp.length) fail(`the scan is narrower (${meta.width} px) than every --lamp-sizes width`);
step(`lamp: ${lamp.map((s) => `${s.width} px`).join(", ")}`);

// ---- the Layers
const wanted = Number(opt.layers);
let layers = null;
if (recipe || wanted >= 2 || opt.cuts) {
  const W = Math.min(layerSizes[0], meta.width), H = heightFor(W), N = W * H;
  const { data: rgb } = await flat().resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const R = new Float32Array(N), G = new Float32Array(N), B = new Float32Array(N), L = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    R[i] = rgb[i * 3] / 255; G[i] = rgb[i * 3 + 1] / 255; B[i] = rgb[i * 3 + 2] / 255;
    L[i] = 0.3 * R[i] + 0.55 * G[i] + 0.15 * B[i];
  }
  step(`layers: working at ${W} × ${H}`);

  const depthFile = path.join(workDir, "depth.png");
  if (!existsSync(depthFile) || statSync(depthFile).mtimeMs < statSync(scan).mtimeMs) {
    step("depth: running the model on this machine…");
    await (await estimateDepth(scan, path.join(HERE, ".model-cache"))).toFile(depthFile);
  }
  const { data: raw } = await sharp(depthFile).greyscale().resize(W, H, { kernel: "cubic" }).raw().toBuffer({ resolveWithObject: true });
  const paperS = paperMask(R, G, B, W, H);
  const D = refineDepth(raw, L, paperS, W, H);
  step("paper found, depth refined");

  let label, cards, focus, cuts = null;
  if (recipe) {
    label = labelsFromRecipe(recipe, D, paperS, W, H);
    cards = recipe.layers;
    focus = recipe.focus ?? Math.min(2, cards.length - 1);
  } else {
    cuts = opt.cuts ? opt.cuts.split(",").map(Number) : defaultCuts(D, paperS, Math.min(5, Math.max(2, wanted)));
    if (cuts.some((c, i) => !(c > 0 && c < 1) || (i && c <= cuts[i - 1]))) fail("--cuts: numbers between 0 and 1, ascending, e.g. 0.3,0.6,0.85");
    label = labelsFromCuts(cuts, D, paperS, W, H);
    cards = depthsOf(label, D, paperS, cuts.length + 1).map((depth, k) => ({ name: `layer ${k}`, depth }));
    focus = Math.min(2, cards.length - 1);
  }
  if (cards.length < 2 || cards.length > 6) fail(`${cards.length} layers: the viewer takes 2 to 6`);
  label = cleanLabels(label, cards, R, G, B, L, paperS, W, H);
  await sharp(preview(label, paperS, R, G, B, N), { raw: { width: W, height: H, channels: 3 } }).resize(1536).png().toFile(path.join(workDir, "cuts.png"));
  writeFileSync(path.join(workDir, "cuts.json"), JSON.stringify({ recipe: recipe ? path.relative(ROOT, recipeFile) : null, cuts, layers: cards }, null, 2) + "\n");
  step(`labels: ${cards.length} layers${recipe ? ` from ${path.relative(ROOT, recipeFile)}` : `, cuts ${cuts.join(", ")}`} (preview: .art-work/${slug}/cuts.png)`);

  const sets = layerSizes.filter((w) => w <= W);
  if (!sets.includes(W)) sets.unshift(W);
  const encode = async (planes, name, webp) => {
    const ch = planes.length, buf = Buffer.alloc(N * ch);
    for (let i = 0; i < N; i++) for (let c = 0; c < ch; c++) buf[i * ch + c] = Math.round(255 * Math.min(1, Math.max(0, planes[c][i])));
    for (const w of sets) {
      const dir = path.join(outDir, "layers", String(w));
      mkdirSync(dir, { recursive: true });
      let img = sharp(buf, { raw: { width: W, height: H, channels: ch } });
      if (w !== W) img = img.resize(w, heightFor(w), { fit: "fill" });
      await img.webp(webp).toFile(path.join(dir, name));
    }
  };
  const { buf: hbuf, width: hw, height: hh } = heightMap(D, label, paperS, W, H);
  mkdirSync(path.join(outDir, "layers"), { recursive: true });
  await sharp(hbuf, { raw: { width: hw, height: hh, channels: 3 } }).webp({ lossless: true, effort: 6 }).toFile(path.join(outDir, "layers", "height.webp"));
  const { planes: colour, notPaperE } = colourFilled(R, G, B, paperS, W, H);
  await encode(colour, "colour.webp", { quality: 90 });
  await encode([R, G, B, paperS], "paper.webp", { quality: 90, alphaQuality: 100 });
  step("height, colour and paper");
  for (let k = 0; k < cards.length; k++) {
    await encode(card(k, label, cards[k], paperS, notPaperE, R, G, B, W, H), `L${k}.webp`, { quality: 88, alphaQuality: 100 });
    step(`card L${k} (${cards[k].name}) at depth ${cards[k].depth}`);
  }
  layers = {
    sizes: sets.map((w) => ({ width: w, height: heightFor(w) })).sort((a, b) => a.width - b.width),
    height: { width: hw, height: hh },
    cards: cards.map(({ name, depth }) => ({ name, depth })),
    focus,
  };
}

const manifest = {
  version: 2,
  relief: "estimated",
  sheetMM: sheetMM.map((v) => Number(v.toFixed(2))),
  lamp: [...lamp].sort((a, b) => a.width - b.width),
  ...(layers ? { layers } : {}),
};
writeFileSync(path.join(outDir, "viewer.json"), JSON.stringify(manifest, null, 2) + "\n");

// ---- what was written
const bytes = (dir) => readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).reduce((s, e) => s + statSync(path.join(e.parentPath, e.name)).size, 0);
const mb = (n) => `${(n / 1e6).toFixed(2)} MB`;
console.log(`  public/art/${slug}/lamp/: ${mb(bytes(path.join(outDir, "lamp")))}`);
if (layers) console.log(`  public/art/${slug}/layers/: ${mb(bytes(path.join(outDir, "layers")))}`);
console.log(`  public/art/${slug}/ in all: ${mb(bytes(outDir))}`);
console.log(`Done in ${((performance.now() - t0) / 1000).toFixed(0)} s.${layers ? ` Check the layers in .art-work/${slug}/cuts.png.` : ""}`);
