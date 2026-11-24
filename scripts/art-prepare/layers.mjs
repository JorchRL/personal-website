// The layers of the close-up viewer's "Layers" effect: the painting cut into a
// few flat cards at depths in a shadow box, the bare paper kept still in front.
//
// 1. Depth: Depth Anything V2 (small), run here with onnxruntime on the scan at
//    1536 px wide. Only the model's weights are downloaded (once, into
//    .model-cache/); the scan never leaves this machine.
// 2. The bare paper (bright, unsaturated, reached from the sheet's border) is
//    found, and a guided filter snaps the depth's edges to the painting's own
//    edges (the ink lines); the depth is then stretched to 0..1 inside it.
// 3. Labels: with a recipe (recipes/<slug>.json), rough regions drawn by hand
//    and cut more precisely by depth thresholds; without one, cuts at depth
//    quantiles. Specks are cleaned away and small islands dropped. A layer
//    may also take its backlit rim (warm or dark-neutral pixels around it).
// 4. Each card keeps its own pixels (a little more, so the ink outline goes
//    with the object in front) and reaches under the cards in front; what was
//    never painted there is filled by smearing the colours around it
//    (push-pull). The depth, filled under the paper, goes into height.webp
//    (16 bits in R and B, the layer in G) for the lighting and the depth field.
//
// All radii are authored at 1536 px wide and scaled (s).

import { existsSync } from "node:fs";
import sharp from "sharp";
import { dilate, erode, gauss, guided, polyMask, pushPull } from "./planes.mjs";

const MODEL = "onnx-community/depth-anything-v2-small";

/** Runs the depth model on the scan at 1536 px wide; returns a sharp PNG of depth (near = 1) at that size. */
export async function estimateDepth(scan, cacheDir) {
  const { AutoModel, AutoProcessor, RawImage, env } = await import("@huggingface/transformers");
  env.cacheDir = cacheDir;
  env.allowRemoteModels = !existsSync(`${cacheDir}/${MODEL}/onnx/model.onnx`);
  const model = await AutoModel.from_pretrained(MODEL, { dtype: "fp32" });
  const processor = await AutoProcessor.from_pretrained(MODEL);
  const { data, info } = await sharp(scan).rotate().flatten({ background: "#ffffff" }).resize(1536).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const SIZE = 518 * 2; // the long side for the model, a multiple of 14 (its patch size)
  const iw = Math.round((W >= H ? SIZE : (SIZE * W) / H) / 14) * 14;
  const ih = Math.round((W >= H ? (SIZE * H) / W : SIZE) / 14) * 14;
  processor.image_processor.size = { width: iw, height: ih };
  processor.image_processor.keep_aspect_ratio = false;
  processor.image_processor.do_resize = true;
  const image = new RawImage(new Uint8ClampedArray(data), W, H, 3);
  const { predicted_depth } = await model(await processor(image));
  const [, h, w] = predicted_depth.dims;
  const d = predicted_depth.data;
  let lo = Infinity, hi = -Infinity;
  for (const v of d) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const bytes = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) bytes[i] = Math.round((255 * (d[i] - lo)) / (hi - lo));
  return sharp(bytes, { raw: { width: w, height: h, channels: 1 } }).resize(W, H, { kernel: "cubic" }).png();
}

/** The bare paper: bright, unsaturated pixels flood-filled from the image border, specks closed. 0..1. */
export function paperMask(R, G, B, W, H) {
  const N = W * H, s = W / 1536;
  const paperLike = (i) => {
    const mx = Math.max(R[i], G[i], B[i]), mn = Math.min(R[i], G[i], B[i]);
    return mx > 0.72 && mx - mn < 0.16;
  };
  const paper = new Float32Array(N);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (paper[i] || !paperLike(i)) continue;
    paper[i] = 1;
    const x = i % W, y = (i / W) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - W);
    if (y < H - 1) stack.push(i + W);
  }
  const paperS = gauss(paper, W, H, Math.round(1.5 * s));
  for (let i = 0; i < N; i++) paperS[i] = Math.min(1, Math.max(0, (paperS[i] - 0.35) / 0.3));
  return paperS;
}

/** The depth (raw bytes at W × H), edge-snapped to the painting and stretched to 0..1 inside it. */
export function refineDepth(raw, L, paperS, W, H) {
  const N = W * H, s = W / 1536;
  let D = new Float32Array(N);
  for (let i = 0; i < N; i++) D[i] = raw[i] / 255;
  D = guided(L, D, W, H, Math.round(6 * s), 2e-3);
  const vals = [];
  for (let i = 0; i < N; i += 7) if (paperS[i] < 0.5) vals.push(D[i]);
  vals.sort((a, b) => a - b);
  const lo = vals[Math.floor(vals.length * 0.01)], hi = vals[Math.floor(vals.length * 0.995)];
  for (let i = 0; i < N; i++) D[i] = Math.min(1, Math.max(0, (D[i] - lo) / (hi - lo)));
  return D;
}

/** Default cuts for n layers: depth quantiles inside the painting, so each card holds a fair share. */
export function defaultCuts(D, paperS, n) {
  const vals = [];
  for (let i = 0; i < D.length; i += 5) if (paperS[i] < 0.5) vals.push(D[i]);
  vals.sort((a, b) => a - b);
  const shares = { 2: [0.55], 3: [0.45, 0.78], 4: [0.4, 0.68, 0.87], 5: [0.35, 0.58, 0.76, 0.9] }[n] ?? [0.5];
  return shares.map((q) => Number(vals[Math.floor(vals.length * q)].toFixed(3)));
}

function keepBig(m, W, H, minFrac) {
  const N = W * H, seen = new Uint8Array(N), out = new Float32Array(N), q = new Int32Array(N);
  for (let s0 = 0; s0 < N; s0++) {
    if (!m[s0] || seen[s0]) continue;
    let head = 0, tail = 0;
    q[tail++] = s0; seen[s0] = 1;
    while (head < tail) {
      const i = q[head++], x = i % W;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
        if (j >= 0 && j < N && m[j] && !seen[j]) { seen[j] = 1; q[tail++] = j; }
      }
    }
    if (tail >= minFrac * N) for (let k = 0; k < tail; k++) out[q[k]] = 1;
  }
  return out;
}

/**
 * A recipe, for labels drawn by hand (recipes/<slug>.json):
 *   regions  { name: [[x, y], …] } rough polygons, in pixels of the scan at 1536 px wide
 *   rules    [{ layer, region, above }] tried in order; the first whose region holds the
 *            pixel and whose depth is above `above` gives the layer (else layer 0, the back)
 *   layers   [{ name, depth, clean?, outline?, rim? }] back to front: `depth` in the box
 *            (0 the back, 1 the paper's plane); `clean` the speck radius (3); `outline` how
 *            far the card reaches over its edge (3); `rim` takes its backlit rim
 *   focus    the layer in focus when the effect starts
 */
export function labelsFromRecipe(recipe, D, paperS, W, H) {
  const N = W * H, s = W / 1536;
  const regions = Object.fromEntries(Object.entries(recipe.regions).map(([name, pts]) => [name, polyMask(pts.map(([x, y]) => [x * s, y * s]), W, H)]));
  const label = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (paperS[i] > 0.5) continue;
    for (const rule of recipe.rules) {
      if (regions[rule.region][i] && D[i] > rule.above) { label[i] = rule.layer; break; }
    }
  }
  return label;
}

/** Labels from depth cuts alone: each cut splits a layer from the one behind it. */
export function labelsFromCuts(cuts, D, paperS, W, H) {
  const N = W * H, label = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (paperS[i] > 0.5) continue;
    let k = 0;
    while (k < cuts.length && D[i] > cuts[k]) k++;
    label[i] = k;
  }
  return label;
}

/** Each layer's depth for cut labels: where its pixels sit, spread over the front 60% of the box. */
export function depthsOf(label, D, paperS, n) {
  const sum = new Float64Array(n), count = new Float64Array(n);
  for (let i = 0; i < D.length; i++) if (paperS[i] < 0.5) { sum[label[i]] += D[i]; count[label[i]]++; }
  const depths = [...sum].map((v, k) => (k === 0 ? 0 : Number((0.35 + 0.55 * (v / Math.max(1, count[k]))).toFixed(3))));
  for (let k = 1; k < n; k++) depths[k] = Math.max(depths[k], depths[k - 1] + 0.08);
  return depths.map((d) => Math.min(0.95, d));
}

/** Cleans the labels per layer (open, close, drop islands), grabs rims, and returns the final labels. */
export function cleanLabels(label, layers, R, G, B, L, paperS, W, H) {
  const N = W * H, s = W / 1536, n = layers.length;
  const cleanLayer = (id, r) => {
    let m = new Float32Array(N);
    for (let i = 0; i < N; i++) m[i] = label[i] === id ? 1 : 0;
    m = dilate(erode(m, W, H, r), W, H, r); // open
    m = erode(dilate(m, W, H, r), W, H, r); // close
    return m;
  };
  const masks = [null];
  for (let k = 1; k < n; k++) masks.push(keepBig(cleanLayer(k, Math.round((layers[k].clean ?? 3) * s)), W, H, 0.002));
  // A backlit rim several px wide that the depth model leaves on what is behind: take the
  // warm or dark-neutral pixels in a band around the layer, so the rim travels with it.
  for (let k = 1; k < n; k++) {
    if (!layers[k].rim) continue;
    const band = dilate(masks[k], W, H, Math.round(14 * s));
    for (let i = 0; i < N; i++) {
      if (!band[i] || masks[k][i] || paperS[i] > 0.5) continue;
      const warm = R[i] - B[i] > 0.13 && L[i] < 0.78;
      const ink = L[i] < 0.22 && R[i] >= B[i] - 0.04;
      if (warm || ink) masks[k][i] = 1;
    }
    masks[k] = erode(dilate(masks[k], W, H, Math.round(2 * s)), W, H, Math.round(2 * s));
  }
  const out = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    let l = 0;
    for (let k = 1; k < n; k++) if (masks[k][i]) l = k; // later wins (front)
    out[i] = l;
  }
  return out;
}

/** The painting with the paper area filled in (the depth field's colour), as planes. */
export function colourFilled(R, G, B, paperS, W, H) {
  const N = W * H, s = W / 1536;
  const notPaper = new Float32Array(N);
  for (let i = 0; i < N; i++) notPaper[i] = paperS[i] < 0.02 ? 1 : 0;
  const notPaperE = erode(notPaper, W, H, Math.round(2 * s)); // drop the deckled fringe
  const [r, g, b] = pushPull([R, G, B], notPaperE, W, H);
  const keep = gauss(notPaperE, W, H, Math.round(1 * s));
  for (let i = 0; i < N; i++) {
    const k = keep[i];
    r[i] = R[i] * k + r[i] * (1 - k);
    g[i] = G[i] * k + g[i] * (1 - k);
    b[i] = B[i] * k + b[i] * (1 - k);
  }
  return { planes: [r, g, b], notPaperE };
}

/**
 * Card k's colour and alpha, as planes. Each keeps its own pixels (dilated by `outline`
 * so ink outlines belong to the front object) and extends EXT px under the layers in
 * front of it, filled by smearing.
 */
export function card(k, label, layer, paperS, notPaperE, R, G, B, W, H) {
  const N = W * H, s = W / 1536;
  const EXT = Math.round(28 * s);
  const own = new Float32Array(N), front = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    own[i] = label[i] === k ? 1 : 0;
    front[i] = label[i] > k || paperS[i] > 0.02 ? 1 : 0;
  }
  // known colour samples: own pixels away from other layers' ink edges
  const src = k === 0 ? erode(own.map((v, i) => v * notPaperE[i]), W, H, Math.round(9 * s)) : erode(own, W, H, Math.round(1 * s));
  const [r, g, b] = pushPull([R, G, B], src, W, H);
  const ownD = dilate(own, W, H, Math.round((layer.outline ?? 3) * s));
  const keep = gauss((k === 0 ? own : ownD).map((v, i) => v * notPaperE[i]), W, H, Math.round(1 * s));
  for (let i = 0; i < N; i++) {
    const q = keep[i];
    r[i] = R[i] * q + r[i] * (1 - q);
    g[i] = G[i] * q + g[i] * (1 - q);
    b[i] = B[i] * q + b[i] * (1 - q);
  }
  let a;
  if (k === 0) a = new Float32Array(N).fill(1);
  else {
    const ext = dilate(own, W, H, EXT), extP = dilate(own, W, H, EXT * 2.5);
    const raw = new Float32Array(N);
    for (let i = 0; i < N; i++) raw[i] = Math.max(ownD[i], ext[i] * front[i], extP[i] * (paperS[i] > 0.02 ? 1 : 0));
    a = gauss(raw, W, H, Math.round(1 * s));
  }
  return [r, g, b, a];
}

/**
 * height.webp: the depth with the paper area pulled from the painting (so the field
 * continues under the frame), at most 1536 px wide. 8 bits band when normals are taken
 * from them, so the depth is split into hi (R) and lo (B); G is the layer × 51.
 */
export function heightMap(D, label, paperS, W, H) {
  const N = W * H;
  const w = new Float32Array(N);
  for (let i = 0; i < N; i++) w[i] = 1 - paperS[i] > 0.99 ? 1 : 0;
  const [Df] = pushPull([D], w, W, H);
  const f = Math.max(1, Math.round(W / 1536)), w2 = Math.floor(W / f), h2 = Math.floor(H / f), N2 = w2 * h2;
  const buf = Buffer.alloc(N2 * 3);
  for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
    let sd = 0;
    for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) sd += Df[(y * f + dy) * W + x * f + dx];
    const i = y * w2 + x, c = y * f * W + x * f;
    const v = Math.min(1, Math.max(0, sd / (f * f))) * 255, fl = Math.floor(Math.min(254.999, v));
    buf[i * 3] = fl;
    buf[i * 3 + 1] = Math.round(label[c] * 0.2 * 255);
    buf[i * 3 + 2] = Math.min(255, Math.round((v - fl) * 255));
  }
  return { buf, width: w2, height: h2 };
}

/** A preview of the labels over the painting, one colour a layer, white for the paper. */
export function preview(label, paperS, R, G, B, N) {
  const cols = [[40, 60, 200], [255, 200, 0], [255, 40, 160], [60, 200, 90], [255, 90, 30], [140, 80, 220]];
  const out = Buffer.alloc(N * 3);
  for (let i = 0; i < N; i++) {
    const c = paperS[i] > 0.5 ? [255, 255, 255] : cols[label[i] % cols.length];
    out[i * 3] = Math.round(255 * (0.45 * R[i]) + 0.55 * c[0]);
    out[i * 3 + 1] = Math.round(255 * (0.45 * G[i]) + 0.55 * c[1]);
    out[i * 3 + 2] = Math.round(255 * (0.45 * B[i]) + 0.55 * c[2]);
  }
  return out;
}
