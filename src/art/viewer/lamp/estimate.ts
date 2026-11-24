// Estimates a height map + normal map of the sheet from ONE flat scan.
// Everything here is a guess dressed up with paper physics; see NOTES.md.
//
// Frames: every texture is in image frame, texel (0,0) = top-left of the scan,
// x right, y DOWN, z up out of the paper. Heights are in millimetres.

import { GL, type Target } from '../gl';

const H = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 o;
`;

// 1. Per-pixel features from the scan.
const FEAT = H + `
uniform sampler2D uScan;
void main() {
  vec3 lin = texelFetch(uScan, ivec2(gl_FragCoord.xy), 0).rgb;
  vec3 g = pow(lin, vec3(1.0 / 2.2));             // perceptual values
  float Y = dot(g, vec3(0.299, 0.587, 0.114));
  float chroma = max(g.r, max(g.g, g.b)) - min(g.r, min(g.g, g.b));
  float paper = smoothstep(0.76, 0.9, Y) * smoothstep(0.14, 0.05, chroma);
  float neutralDark = smoothstep(0.34, 0.12, Y) * smoothstep(0.22, 0.08, chroma);
  o = vec4(Y, chroma, paper, neutralDark);
}`;

// Separable gaussian.
const BLUR = H + `
uniform sampler2D uSrc;
uniform vec2 uDir;
uniform float uSigma;
void main() {
  ivec2 size = textureSize(uSrc, 0);
  ivec2 p = ivec2(gl_FragCoord.xy);
  int r = int(ceil(uSigma * 3.0));
  vec4 acc = vec4(0.0); float wsum = 0.0;
  for (int i = -r; i <= r; i++) {
    float w = exp(-0.5 * float(i * i) / (uSigma * uSigma));
    ivec2 q = clamp(p + ivec2(uDir) * i, ivec2(0), size - 1);
    acc += texelFetch(uSrc, q, 0) * w; wsum += w;
  }
  o = acc / wsum;
}`;

// 4x4 box downsample.
const DOWN4 = H + `
uniform sampler2D uSrc;
void main() {
  ivec2 size = textureSize(uSrc, 0);
  ivec2 b = ivec2(gl_FragCoord.xy) * 4;
  vec4 acc = vec4(0.0);
  for (int y = 0; y < 4; y++) for (int x = 0; x < 4; x++)
    acc += texelFetch(uSrc, min(b + ivec2(x, y), size - 1), 0);
  o = acc / 16.0;
}`;

// 2. Masks: ink lines, gouache highlights, painted area, fine high-pass.
const MASKS = H + `
uniform sampler2D uFeat, uSmall, uMid, uBig;
uniform vec2 uRes;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec4 f = texelFetch(uFeat, ivec2(gl_FragCoord.xy), 0);
  vec4 s = texelFetch(uSmall, ivec2(gl_FragCoord.xy), 0);
  vec4 m = texture(uMid, uv);
  vec4 b = texture(uBig, uv);
  float Y = f.r, chroma = f.g;
  float painted = 1.0 - smoothstep(0.45, 0.85, b.b);
  // Ink: thin, dark, neutral, clearly darker than its neighbourhood.
  float ink = smoothstep(0.06, 0.2, m.r - Y) * f.a;
  // Gouache: thin bright neutral strokes sitting inside paint.
  float gouache = smoothstep(0.66, 0.85, Y) * smoothstep(0.2, 0.08, chroma)
                * smoothstep(0.1, 0.28, Y - m.r) * painted;
  float hp = Y - s.r;
  o = vec4(ink, gouache, painted, hp);
}`;

// 3. Height in mm: r = fine relief, g = cockling, b = gloss, a = ink.
const HEIGHT = H + `
uniform sampler2D uMask, uBig;
uniform vec2 uRes, uSheetMM;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash2(vec2 p) { return vec2(hash(p), hash(p + 17.17)); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
// Rounded felt bumps of cold-pressed cotton paper: 1 - F1^2 of a jittered grid.
float bumps(vec2 p) {
  vec2 i = floor(p), f = fract(p); float d = 9.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(x, y); vec2 c = g + 0.15 + 0.7 * hash2(i + g) - f;
    d = min(d, dot(c, c));
  }
  return 1.0 - clamp(d * 1.4, 0.0, 1.0);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 mm = uv * uSheetMM;
  vec4 k = texelFetch(uMask, ivec2(gl_FragCoord.xy), 0);
  float ink = k.r, gouache = k.g, painted = k.b, hp = k.a;

  // Cotton paper tooth (procedural, mm).
  vec2 w = vec2(fbm(mm * 0.35), fbm(mm * 0.35 + 9.0)) * 1.2;           // irregular felt
  float tooth = 0.62 * bumps((mm + w) / 1.15) + 0.28 * bumps((mm - w) / 0.48 + 3.0)
              + 0.25 * fbm(mm / 0.16);
  tooth = (tooth - 0.6) * 0.085;

  // Granulation: pigment settles in the valleys, so darker reads as lower.
  float grain = clamp(hp, -0.12, 0.12) * 0.45 * mix(0.35, 1.0, painted) * (1.0 - smoothstep(0.0, 0.3, ink));

  float fine = (tooth + grain) * (1.0 - 0.75 * gouache)
             + ink * 0.012 + gouache * 0.028;

  // Cockling: the wet, taped painted area buckles in slow waves; margins stay flat.
  vec2 edge = min(mm, uSheetMM - mm);
  float edgeFade = smoothstep(2.0, 18.0, min(edge.x, edge.y));
  float wet = painted;
  vec2 q = mm / 55.0;
  float waves = sin(dot(mm, vec2(0.11, 0.06)) + 2.4 * fbm(q)) * 0.6 + (fbm(q * 1.7 + 3.0) - 0.5) * 1.4;
  float cockle = waves * 0.55 * mix(0.25, 1.0, wet) * edgeFade;

  float gloss = clamp(gouache * 1.2, 0.0, 1.0);
  o = vec4(fine, cockle, gloss, ink);
}`;

// 4. Normals from heights (Sobel). Output xyz normal, a = gloss.
const NORMAL = H + `
uniform sampler2D uHeight;
uniform float uTexelMM;
float hF(ivec2 p, ivec2 s) { return texelFetch(uHeight, clamp(p, ivec2(0), s - 1), 0).r; }
float hC(ivec2 p, ivec2 s) { return texelFetch(uHeight, clamp(p, ivec2(0), s - 1), 0).g; }
void main() {
  ivec2 s = textureSize(uHeight, 0);
  ivec2 p = ivec2(gl_FragCoord.xy);
  float tl = hF(p + ivec2(-1,-1), s), t = hF(p + ivec2(0,-1), s), tr = hF(p + ivec2(1,-1), s);
  float l = hF(p + ivec2(-1, 0), s),                              r = hF(p + ivec2(1, 0), s);
  float bl = hF(p + ivec2(-1, 1), s), b = hF(p + ivec2(0, 1), s), br = hF(p + ivec2(1, 1), s);
  float dx = ((tr + 2.0 * r + br) - (tl + 2.0 * l + bl)) / (8.0 * uTexelMM);
  float dy = ((bl + 2.0 * b + br) - (tl + 2.0 * t + tr)) / (8.0 * uTexelMM);
  dx += (hC(p + ivec2(4, 0), s) - hC(p - ivec2(4, 0), s)) / (8.0 * uTexelMM);
  dy += (hC(p + ivec2(0, 4), s) - hC(p - ivec2(0, 4), s)) / (8.0 * uTexelMM);
  vec3 n = normalize(vec3(-dx, -dy, 1.0));
  o = vec4(n, texelFetch(uHeight, p, 0).b);
}`;

export type Surface = { height: Target; normal: Target; w: number; h: number };

export function estimateSurface(g: GL, scan: WebGLTexture, w: number, h: number, sheetMM: [number, number]): Surface {
  const feat = g.target(w, h);
  g.pass(FEAT, feat, { uScan: { tex: scan } });

  const blur = (src: Target, sigma: number) => {
    const tmp = g.target(src.w, src.h);
    const out = g.target(src.w, src.h);
    g.pass(BLUR, tmp, { uSrc: { tex: src.tex }, uDir: [1, 0], uSigma: sigma });
    g.pass(BLUR, out, { uSrc: { tex: tmp.tex }, uDir: [0, 1], uSigma: sigma });
    g.free(tmp);
    return out;
  };
  const down = (src: Target) => {
    const out = g.target(Math.ceil(src.w / 4), Math.ceil(src.h / 4));
    g.pass(DOWN4, out, { uSrc: { tex: src.tex } });
    return out;
  };

  const small = blur(feat, 2.0);
  const quarter = down(feat);
  const mid = blur(quarter, 3.0);           // ~12 px at full res
  const sixteenth = down(quarter);
  const big = blur(sixteenth, 4.0);          // ~64 px ≈ 5.5 mm

  const mask = g.target(w, h);
  g.pass(MASKS, mask, { uFeat: { tex: feat.tex }, uSmall: { tex: small.tex }, uMid: { tex: mid.tex }, uBig: { tex: big.tex }, uRes: [w, h] });
  const maskB = blur(mask, 1.0);
  g.free(mask); g.free(small); g.free(feat); g.free(quarter); g.free(mid); g.free(sixteenth);

  const height = g.target(w, h, { mips: true });
  g.pass(HEIGHT, height, { uMask: { tex: maskB.tex }, uBig: { tex: big.tex }, uRes: [w, h], uSheetMM: sheetMM });
  g.mipmaps(height.tex);

  const normal = g.target(w, h, { mips: true });
  g.pass(NORMAL, normal, { uHeight: { tex: height.tex }, uTexelMM: sheetMM[0] / w });
  g.mipmaps(normal.tex);
  g.free(maskB); g.free(big);

  return { height, normal, w, h };
}
