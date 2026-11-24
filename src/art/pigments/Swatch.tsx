// A paint's swatch, drawn as a maker's colour chart draws one: a brushed patch,
// full strength (masstone) at the top thinning to a pale wash at the bottom,
// over a stripe of ink, so a transparent paint vanishes on the stripe and an
// opaque one veils it. Granulating paints get specks of their own colour, and
// every patch a soft, uneven edge (an SVG filter: displaced edge, mottled
// alpha, darker rim). Plain SVG, drawn by the browser: no script. A scanned
// swatch (`swatchImage` in content/pigments.ts) is shown instead when set.

import type { SwatchImage, SwatchSpec } from "@/content/pigments";

const W = 120;
const H = 150;
/** The ink stripe across the chart, in the swatch's units. */
const STRIPE = { y: 31, h: 9 };

/** A small seeded random generator (mulberry32), so a swatch's edge is the same on every build. */
function random(seedText: string) {
  let seed = 0;
  for (const ch of seedText) seed = (Math.imul(seed, 31) + ch.charCodeAt(0)) | 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A brushed rectangle: corners a little off square, edges wavering, the bottom (where the brush ran dry) the most. */
function patchPath(seed: string, inset = 7): string {
  const r = random(seed);
  const j = (amount: number) => (r() - 0.5) * 2 * amount;
  const x0 = inset + j(1.5);
  const x1 = W - inset + j(1.5);
  const y0 = inset + j(1);
  const y1 = H - inset - 2 + j(2);
  const pts: [number, number][] = [];
  for (let x = x0; x < x1; x += 9) pts.push([x, y0 + j(0.9)]);
  for (let y = y0; y < y1; y += 11) pts.push([x1 + j(1.1), y]);
  for (let x = x1; x > x0; x -= 7) pts.push([x, y1 + j(2.6)]);
  for (let y = y1; y > y0; y -= 11) pts.push([x0 + j(1.1), y]);
  // Smooth through the midpoints, so the edge reads as painted, not plotted.
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const n = pts.length;
  const start = mid(pts[n - 1], pts[0]);
  let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % n]);
    d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

/** Relative luminance of a #rrggbb colour, 0 to 1. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function Scan({ image, className }: { image: SwatchImage; className?: string }) {
  // The name is in the text beside it, so the picture is decorative.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={image.src} width={image.width} height={image.height} alt="" loading="lazy" decoding="async" />;
}

/** `id` must be unique on the page: the swatch's filters and gradient are named after it. */
export function PaintSwatch({ id, spec, className }: { id: string; spec: SwatchSpec; className?: string }) {
  if (spec.image) return <Scan image={spec.image} className={className} />;
  const { look, granulating, cover } = spec;
  const seed = [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 97;
  const pale = luminance(look.masstone) > 0.85;
  const rim = pale ? "#b9bdbd" : look.masstone;
  return (
    <svg id={id} className={className} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.masstone} />
          <stop offset="0.22" stopColor={look.masstone} />
          <stop offset="0.6" stopColor={look.mid} />
          <stop offset="1" stopColor={look.wash} />
        </linearGradient>
        <filter id={`${id}-f`} x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={seed} result="flow" />
          <feDisplacementMap in="SourceGraphic" in2="flow" scale="5" xChannelSelector="R" yChannelSelector="G" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.035" numOctaves={2} seed={seed + 1} result="m" />
          <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 0.5" result="mottle" />
          <feComposite in="shape" in2="mottle" operator="in" result="paint" />
          {granulating ? (
            <>
              {/* Pigment settles in the paper's hollows: fine grain, gathered in clumps by a coarser noise. */}
              <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={seed + 2} result="grain" />
              <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves={1} seed={seed + 3} result="clumps" />
              <feComposite in="grain" in2="clumps" operator="arithmetic" k1="0" k2="0.65" k3="0.55" k4="0" result="hollows" />
              <feColorMatrix in="hollows" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4 0 0 0 -1.95" result="specks" />
              <feComposite in="paint" in2="specks" operator="in" result="settled" />
              <feComponentTransfer in="settled" result="dark">
                <feFuncR type="linear" slope="0.62" />
                <feFuncG type="linear" slope="0.62" />
                <feFuncB type="linear" slope="0.66" />
                <feFuncA type="linear" slope="0.9" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="paint" />
                <feMergeNode in="dark" />
              </feMerge>
            </>
          ) : (
            <feMerge>
              <feMergeNode in="paint" />
            </feMerge>
          )}
        </filter>
        <clipPath id={`${id}-c`}>
          <rect x="0" y={STRIPE.y} width={W} height={STRIPE.h} />
        </clipPath>
      </defs>
      <g id={`${id}-p`} filter={`url(#${id}-f)`}>
        <path d={patchPath(id)} fill={`url(#${id}-g)`} stroke={rim} strokeOpacity={pale ? 0.8 : 0.45} strokeWidth="1.6" />
      </g>
      {/* The ink stripe: under the paint, so only what the paint hides of it is lighter. */}
      <rect className="pig-stripe" x="0" y={STRIPE.y} width={W} height={STRIPE.h} />
      {cover > 0 && <use href={`#${id}-p`} clipPath={`url(#${id}-c)`} opacity={cover} />}
    </svg>
  );
}

/**
 * The swatch drawn by `<PaintSwatch id={of}>` elsewhere on the page, again (the
 * sheet's large swatch): an SVG `<use>` of it, so its brushed edge, filters and
 * specks are written into the page once, and both show the same patch.
 */
export function SwatchCopy({ of, spec, className }: { of: string; spec: SwatchSpec; className?: string }) {
  if (spec.image) return <Scan image={spec.image} className={className} />;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <use href={`#${of}`} width={W} height={H} />
    </svg>
  );
}
