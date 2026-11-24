// What each paint in content/materials.ts is made of, and how it behaves: the
// pigments behind the swatches on /art. Every fact names its sources (keys of
// `sources`, below), and the swatch's panel lists them as links.
//
// Two levels:
// - `pigments`, by Colour Index code (PB29 is Pigment Blue 29): the
//   chemistry and history, shared by every paint that uses the pigment.
// - `paintFacts`, by paint key: the maker's ratings for that paint (most are
//   Daniel Smith's own pages), one sentence on how it behaves, and the colours
//   of its generated swatch.
//
// `look` is an approximate screen colour for the generated swatch, not a
// measurement. To show a scanned swatch instead, put the file under
// public/art/swatches/ (PNG, JPEG or WebP) and set `swatchImage` to its path,
// e.g. "/art/swatches/ultramarine-blue.jpg"; the generated one is then not drawn.

import type { PaintKey, PaperKey } from "./materials";

export const sources = {
  // Daniel Smith's own page for each paint: pigments, lightfastness,
  // transparency, staining, granulation and the maker's description.
  "ds-ultramarine-blue": { label: "Daniel Smith: Ultramarine Blue", url: "https://danielsmith.com/color-stories/watercolors/ultramarine-blue-watercolor/" },
  "ds-phthalo-blue-gs": { label: "Daniel Smith: Phthalo Blue (Green Shade)", url: "https://danielsmith.com/color-stories/watercolors/phthalo-blue-green-shade-watercolor" },
  "ds-alizarin-crimson": { label: "Daniel Smith: Alizarin Crimson", url: "https://danielsmith.com/color-stories/watercolors/alizarin-crimson-watercolor/" },
  "ds-quinacridone-red": { label: "Daniel Smith: Quinacridone Red", url: "https://danielsmith.com/color-stories/watercolors/quinacridone-red-watercolor/" },
  "ds-hansa-yellow-light": { label: "Daniel Smith: Hansa Yellow Light", url: "https://danielsmith.com/color-stories/watercolors/hansa-yellow-light-watercolor/" },
  "ds-new-gamboge": { label: "Daniel Smith: New Gamboge", url: "https://danielsmith.com/color-stories/watercolors/new-gamboge-watercolor/" },
  "ds-buff-titanium": { label: "Daniel Smith: Buff Titanium", url: "https://danielsmith.com/color-stories/watercolors/buff-titanium-watercolor/" },
  "ds-paynes-gray": { label: "Daniel Smith: Payne's Gray", url: "https://danielsmith.com/color-stories/watercolors/paynes-gray-watercolor/" },
  "ds-burnt-sienna": { label: "Daniel Smith: Burnt Sienna", url: "https://danielsmith.com/color-stories/watercolors/burnt-sienna-watercolor/" },

  // Bruce MacEvoy's handprint.com watercolour pigment pages: chemistry, dates,
  // his ratings and tests.
  "handprint-blues": { label: "handprint.com: blue pigments", url: "https://www.handprint.com/HP/WCL/waterb.html" },
  "handprint-reds": { label: "handprint.com: red pigments", url: "https://www.handprint.com/HP/WCL/waterr.html" },
  "handprint-quinacridones": { label: "handprint.com: quinacridone pigments", url: "https://www.handprint.com/HP/WCL/waterc.html" },
  "handprint-yellows": { label: "handprint.com: yellow pigments", url: "https://www.handprint.com/HP/WCL/watery.html" },
  "handprint-earths": { label: "handprint.com: earth pigments", url: "https://www.handprint.com/HP/WCL/watere.html" },
  "handprint-pigment-history": { label: "handprint.com: pigments in history", url: "https://www.handprint.com/HP/WCL/pigmt1b.html" },

  // The Color of Art pigment database (artistpigments.org): Colour Index
  // numbers, chemical class, the dates in its timelines, a paint's earlier
  // versions (its Payne's Gray page lists the 2006 one, PB29, PBk9 and PY42).
  "ap-pb29": { label: "artistpigments.org: PB29", url: "https://artistpigments.org/pigments/PB29/technical" },
  "ap-pb15": { label: "artistpigments.org: PB15", url: "https://artistpigments.org/pigments/PB15/info" },
  "ap-pr83": { label: "artistpigments.org: PR83", url: "https://artistpigments.org/pigments/PR83/technical" },
  "ap-pv19": { label: "artistpigments.org: PV19", url: "https://artistpigments.org/pigments/PV19/info" },
  "ap-py3": { label: "artistpigments.org: PY3", url: "https://artistpigments.org/pigments/PY3/technical" },
  "ap-py97": { label: "artistpigments.org: PY97", url: "https://artistpigments.org/pigments/PY97/info" },
  "ap-py110": { label: "artistpigments.org: PY110", url: "https://artistpigments.org/pigments/PY110/info" },
  "ap-pw6-1": { label: "artistpigments.org: PW6:1", url: "https://artistpigments.org/pigments/PW6:1/technical" },
  "ap-pw6": { label: "artistpigments.org: PW6", url: "https://artistpigments.org/pigments/PW6/info" },
  "ap-ds-paynes-gray": { label: "artistpigments.org: Daniel Smith Payne's Gray", url: "https://artistpigments.org/brands/daniel-smith-extra-fine-watercolors/wyrbz-payne-s-gray" },

  // General references for chemistry and history.
  "wiki-ultramarine": { label: "Wikipedia: Ultramarine", url: "https://en.wikipedia.org/wiki/Ultramarine" },
  "wiki-phthalocyanine-blue": { label: "Wikipedia: Phthalocyanine Blue BN", url: "https://en.wikipedia.org/wiki/Phthalocyanine_Blue_BN" },
  "wiki-alizarin": { label: "Wikipedia: Alizarin", url: "https://en.wikipedia.org/wiki/Alizarin" },
  "wiki-quinacridone": { label: "Wikipedia: Quinacridone", url: "https://en.wikipedia.org/wiki/Quinacridone" },
  "wiki-pigment-yellow-3": { label: "Wikipedia: Pigment Yellow 3", url: "https://en.wikipedia.org/wiki/Pigment_Yellow_3" },
  "fda-py97": { label: "FDA substance registry: Pigment Yellow 97", url: "https://precision.fda.gov/uniisearch/srs/unii/8ZNH60AHS0" },
  "chemicalbook-py110": { label: "ChemicalBook: Pigment Yellow 110", url: "https://www.chemicalbook.com/CASEN_5590-18-1.htm" },
  "wiki-titanium-white": { label: "Wikipedia: Titanium white", url: "https://en.wikipedia.org/wiki/Titanium_white" },
  "wiki-bone-char": { label: "Wikipedia: Bone char", url: "https://en.wikipedia.org/wiki/Bone_char" },
  "cameo-bone-black": { label: "CAMEO (Museum of Fine Arts, Boston): Bone black", url: "https://cameo.mfa.org/wiki/Bone_black" },
  "wiki-sienna": { label: "Wikipedia: Sienna", url: "https://en.wikipedia.org/wiki/Sienna" },
  "wiki-paynes-grey": { label: "Wikipedia: Payne's grey", url: "https://en.wikipedia.org/wiki/Payne%27s_grey" },

  // Royal Talens: the gouache range, and what makes gouache opaque.
  "rt-gouache": { label: "Royal Talens: Talens Gouache Extra Fine", url: "https://royaltalens.com/products/talens-gouache-extra-fine-quality-tube-60-ml" },
  "rt-opacity": { label: "Royal Talens: opacity and transparency", url: "https://www.royaltalens.com/pages/opacity-transparency" },
} as const satisfies Record<string, { label: string; url: string }>;

export type SourceKey = keyof typeof sources;

/** One fact and where it comes from. */
export type Fact = { text: string; src: readonly SourceKey[] };

/** A rating on a scale: `level` of `of` (null when the maker does not rate it), in the maker's words. */
export type Rating = { level: number | null; of: number; words: string; src: readonly SourceKey[] };

export type Pigment = {
  /** Its common name: "Ultramarine blue". */
  name: string;
  /** The Colour Index constitution number, where a source gives it. */
  ciNumber?: Fact;
  chemical: Fact;
  formula: Fact;
  /** Inorganic or organic, natural or synthetic, and the chemical family. */
  kind: Fact;
  history: Fact;
};

const f = (text: string, ...src: SourceKey[]): Fact => ({ text, src });

/** Each pigment by its Colour Index code, as content/materials.ts lists them. */
export const pigments = {
  PB29: {
    name: "Ultramarine blue",
    ciNumber: f("77007", "ap-pb29"),
    chemical: f("Sodium aluminium sulfosilicate: the blue of lapis lazuli, made synthetically", "handprint-pigment-history", "ap-pb29"),
    formula: f("Na₈₋₁₀Al₆Si₆O₂₄S₂₋₄ (as lazurite, the mineral it copies)", "wiki-ultramarine"),
    kind: f("Inorganic, synthetic", "ap-pb29"),
    history: f(
      "A prize offered in France in 1824 for an artificial ultramarine led to two processes: Jean-Baptiste Guimet's in 1826, kept secret, and Christian Gmelin's in 1828, published.",
      "wiki-ultramarine",
      "handprint-pigment-history",
    ),
  },
  // The green shade: Jorge's tube label, 2026-11-23.
  "PB15:3": {
    name: "Phthalocyanine blue, green shade",
    ciNumber: f("74160", "ap-pb15"),
    chemical: f("Copper phthalocyanine in its β crystal form, the green shade (the ε form, PB15:6, is the red shade)", "handprint-blues", "wiki-phthalocyanine-blue"),
    formula: f("C₃₂H₁₆CuN₈", "wiki-phthalocyanine-blue"),
    kind: f("Organic, synthetic (phthalocyanine)", "ap-pb15"),
    history: f(
      "Copper phthalocyanine was first made in 1927; ICI launched it as a pigment in Britain in 1935, and it became the workhorse industrial blue.",
      "wiki-phthalocyanine-blue",
      "handprint-blues",
    ),
  },
  PR83: {
    name: "Alizarin crimson",
    ciNumber: f("58000", "ap-pr83"),
    chemical: f("1,2-dihydroxyanthraquinone (alizarin), the red of madder root, fixed as a lake pigment", "handprint-reds", "wiki-alizarin"),
    formula: f("C₁₄H₈O₄ (alizarin, before laking)", "wiki-alizarin"),
    kind: f("Organic, synthetic (anthraquinone lake)", "ap-pr83"),
    history: f(
      "Carl Graebe and Carl Liebermann, working for BASF, made alizarin from anthracene in 1868: the first natural dye made synthetically.",
      "wiki-alizarin",
      "ap-pr83",
    ),
  },
  PV19: {
    name: "Quinacridone",
    ciNumber: f("73900", "ap-pv19", "wiki-quinacridone"),
    chemical: f("Quinacridone, in its γ crystal form for the red (the β form is quinacridone violet)", "handprint-quinacridones", "wiki-quinacridone"),
    formula: f("C₂₀H₁₂N₂O₂", "wiki-quinacridone"),
    kind: f("Organic, synthetic (quinacridone)", "ap-pv19"),
    history: f("DuPont first sold quinacridones as pigments in 1958.", "wiki-quinacridone", "ap-pv19"),
  },
  PY3: {
    name: "Arylide yellow 10G (Hansa yellow)",
    ciNumber: f("11710", "ap-py3", "wiki-pigment-yellow-3"),
    chemical: f("A monoazo (arylide) yellow", "ap-py3", "wiki-pigment-yellow-3"),
    formula: f("C₁₆H₁₂Cl₂N₄O₄", "wiki-pigment-yellow-3"),
    kind: f("Organic, synthetic (monoazo)", "ap-py3"),
    history: f("One of the first Hansa yellows: discovered around 1910 and made from 1912.", "ap-py3", "handprint-yellows"),
  },
  PY97: {
    name: "Arylide yellow FGL",
    ciNumber: f("11767", "ap-py97", "fda-py97"),
    chemical: f("A monoazo (arylide) yellow", "ap-py97"),
    formula: f("C₂₆H₂₇ClN₄O₈S", "fda-py97"),
    kind: f("Organic, synthetic (monoazo)", "ap-py97"),
    history: f("A later, more lightfast Hansa yellow, from the 1950s and 1960s (handprint dates it 1953, artistpigments.org 1961).", "handprint-yellows", "ap-py97"),
  },
  PY110: {
    name: "Isoindolinone yellow R",
    ciNumber: f("56280", "ap-py110", "chemicalbook-py110"),
    chemical: f("A tetrachloroisoindolinone", "ap-py110", "chemicalbook-py110"),
    formula: f("C₂₂H₆Cl₈N₄O₂", "chemicalbook-py110"),
    kind: f("Organic, synthetic (isoindolinone)", "ap-py110"),
    history: f("Patented in the 1950s and made from the mid-1960s.", "ap-py110", "handprint-yellows"),
  },
  "PW6:1": {
    name: "Titanium white, buff",
    ciNumber: f("77891", "ap-pw6-1"),
    chemical: f("Titanium dioxide (rutile), in an off-white, buff grade", "ap-pw6-1", "handprint-pigment-history"),
    formula: f("TiO₂", "ap-pw6-1"),
    kind: f("Inorganic, synthetic", "ap-pw6-1"),
    history: f(
      "Titanium white was developed for industry in the 1910s, by the Titan Company in Norway and the Titanium Pigment Company in the United States.",
      "wiki-titanium-white",
    ),
  },
  PW6: {
    name: "Titanium white",
    ciNumber: f("77891", "ap-pw6"),
    chemical: f("Titanium dioxide", "ap-pw6", "wiki-titanium-white"),
    formula: f("TiO₂", "wiki-titanium-white"),
    kind: f("Inorganic, synthetic", "ap-pw6"),
    history: f(
      "Developed for industry in the 1910s in Norway and the United States, it has since replaced lead white as the white artists use most.",
      "wiki-titanium-white",
      "ap-pw6",
    ),
  },
  PBk9: {
    name: "Bone black",
    ciNumber: f("77267", "cameo-bone-black"),
    chemical: f("Carbon on calcium phosphate: animal bone charred without air (ivory black is now another name for it)", "wiki-bone-char", "cameo-bone-black"),
    formula: f("C with Ca₅(PO₄)₃(OH): about 7–10% carbon, 57–80% calcium phosphate", "wiki-bone-char"),
    kind: f("Inorganic and carbon, from animal bone", "wiki-bone-char"),
    history: f("Bone and ivory blacks are historic artists' pigments, valued for their depth of colour.", "wiki-bone-char"),
  },
  PBr7: {
    name: "Burnt sienna",
    chemical: f("Natural iron oxide earth, calcined (heated) until part of it turns to anhydrous iron oxide, hematite", "handprint-earths", "wiki-sienna"),
    formula: f("Fe₂O₃, with clay and a little manganese oxide", "wiki-sienna"),
    kind: f("Inorganic, natural earth", "handprint-earths"),
    history: f(
      "Named after Siena, the Tuscan city where it was produced in the Renaissance; burnt earths were probably first made when iron-rich clays were fired in kilns, about 8,000 years ago.",
      "wiki-sienna",
      "handprint-earths",
    ),
  },
} as const satisfies Record<string, Pigment>;

export type PigmentCode = keyof typeof pigments;

/** Transparency, from the maker's four words. */
const transparency = {
  transparent: 4,
  "semi-transparent": 3,
  "semi-opaque": 2,
  opaque: 1,
} as const;
const tr = (words: keyof typeof transparency, ...src: SourceKey[]): Rating => ({
  level: transparency[words],
  of: 4,
  words: words[0].toUpperCase() + words.slice(1),
  src,
});
/** Daniel Smith's staining scale: 1 non-staining to 4 high staining. */
const st = (level: 1 | 2 | 3 | 4, ...src: SourceKey[]): Rating => ({
  level,
  of: 4,
  words: ["Non-staining", "Low", "Medium", "High"][level - 1],
  src,
});
const gr = (granulating: boolean, ...src: SourceKey[]): Rating => ({
  level: granulating ? 1 : 0,
  of: 1,
  words: granulating ? "Granulating" : "Non-granulating",
  src,
});
/** ASTM lightfastness, I (excellent) to V (very poor), shown as 5 to 1 marks. */
const astm = ["I", "II", "III", "IV", "V"] as const;
const lf = (roman: (typeof astm)[number], words: string, ...src: SourceKey[]): Rating => ({
  level: 5 - astm.indexOf(roman),
  of: 5,
  words: `${roman}, ${words}`,
  src,
});
const unrated = (words: string, ...src: SourceKey[]): Rating => ({ level: null, of: 4, words, src });

/** A swatch's colours: masstone (full strength), a middle wash, the palest wash. Approximate, not measured. */
export type Look = { masstone: string; mid: string; wash: string };

export type PaintFacts = {
  /** The paint's pigments, by their codes in `pigments`; the same list as content/materials.ts. */
  pigments: readonly PigmentCode[];
  transparency: Rating;
  staining: Rating;
  granulation: Rating;
  lightfastness: Rating;
  /** How it behaves in watercolour (or gouache): one sentence. */
  behaviour: Fact;
  /** A line on the paint itself, as opposed to its pigments. */
  note?: Fact;
  /** What to check against the tube, as a TODO(jorge); "" or left out when confirmed. */
  check?: string;
  /** Jorge's own words on using this paint, shown on its sheet as "From my painting:"; left out when he has none. */
  artistNote?: string;
  look: Look;
  /** A scan of his own swatch, under public/art/swatches/; drawn instead of the generated swatch. */
  swatchImage?: string;
};

export const paintFacts = {
  "ultramarine-blue": {
    pigments: ["PB29"],
    transparency: tr("transparent", "ds-ultramarine-blue"),
    staining: st(3, "ds-ultramarine-blue"),
    granulation: gr(true, "ds-ultramarine-blue"),
    lightfastness: lf("I", "excellent", "ds-ultramarine-blue"),
    behaviour: f(
      "It settles into the paper's tooth as it dries, less so in strong washes, and dries noticeably lighter, losing about a fifth of its chroma.",
      "ds-ultramarine-blue",
      "handprint-blues",
    ),
    note: f("Cooler and greener than Daniel Smith's French Ultramarine: the same pigment, ground to a smaller particle.", "ds-ultramarine-blue"),
    look: { masstone: "#1d2477", mid: "#3a49b0", wash: "#b5bfea" },
  },
  "phthalo-blue": {
    // Phthalo Blue (Green Shade), PB15:3: Jorge's tube label, 2026-11-23.
    pigments: ["PB15:3"],
    transparency: tr("transparent", "ds-phthalo-blue-gs"),
    staining: st(4, "ds-phthalo-blue-gs"),
    granulation: gr(false, "ds-phthalo-blue-gs"),
    lightfastness: lf("I", "excellent", "ds-phthalo-blue-gs"),
    behaviour: f(
      "High in tint and strongly staining, it dries much lighter than it looks wet: about a quarter lighter in the green shade, and less saturated.",
      "ds-phthalo-blue-gs",
      "handprint-blues",
    ),
    look: { masstone: "#0a2456", mid: "#0d58a6", wash: "#a9cdee" },
  },
  "alizarin-crimson": {
    pigments: ["PR83"],
    transparency: tr("transparent", "ds-alizarin-crimson"),
    staining: st(3, "ds-alizarin-crimson"),
    granulation: gr(false, "ds-alizarin-crimson"),
    lightfastness: lf("IV", "fugitive", "ds-alizarin-crimson"),
    behaviour: f(
      "Dark and intense when wet, it dries lighter, toward maroon, and its tints fade in sunlight; kept from direct sun, a strong wash lasts for decades.",
      "handprint-reds",
      "ds-alizarin-crimson",
    ),
    look: { masstone: "#4f0a1c", mid: "#9a1d3b", wash: "#efbcc8" },
  },
  "quinacridone-red": {
    pigments: ["PV19"],
    transparency: tr("transparent", "ds-quinacridone-red"),
    staining: st(3, "ds-quinacridone-red"),
    granulation: gr(false, "ds-quinacridone-red"),
    lightfastness: lf("I", "excellent", "ds-quinacridone-red"),
    behaviour: f("A pure, extremely transparent red that lays smooth, clear washes; a far more lightfast choice than alizarin crimson.", "ds-quinacridone-red", "handprint-reds"),
    look: { masstone: "#8f1030", mid: "#d02a4f", wash: "#f6c2cd" },
  },
  "hansa-yellow-light": {
    pigments: ["PY3"],
    transparency: tr("semi-transparent", "ds-hansa-yellow-light"),
    staining: st(2, "ds-hansa-yellow-light"),
    granulation: gr(false, "ds-hansa-yellow-light"),
    lightfastness: lf("II", "very good", "ds-hansa-yellow-light"),
    behaviour: f(
      "A clean, high-tinting lemon yellow, brighter and more transparent than cadmium yellow light; with phthalo blue it makes luminous greens.",
      "ds-hansa-yellow-light",
      "ds-phthalo-blue-gs",
    ),
    look: { masstone: "#e9cf00", mid: "#f4e23c", wash: "#faf3b4" },
  },
  // The current mix, PY97 + PY110: Jorge's tube label, 2026-11-23.
  "new-gamboge": {
    pigments: ["PY97", "PY110"],
    transparency: tr("transparent", "ds-new-gamboge"),
    staining: st(2, "ds-new-gamboge"),
    granulation: gr(false, "ds-new-gamboge"),
    lightfastness: lf("I", "excellent", "ds-new-gamboge"),
    behaviour: f(
      "A transparent, warm yellow toward orange; it stains more than yellow ochre and tints like raw sienna, so it stands in for both where a clear, smooth wash is wanted.",
      "ds-new-gamboge",
    ),
    note: f("Daniel Smith's New Gamboge used to be PY153; that pigment stopped being made, supplies ran out in 2012, and the paint was reformulated.", "handprint-yellows"),
    look: { masstone: "#d97f00", mid: "#eda21a", wash: "#f8dc9c" },
  },
  "buff-titanium": {
    pigments: ["PW6:1"],
    transparency: tr("semi-transparent", "ds-buff-titanium"),
    staining: st(1, "ds-buff-titanium"),
    granulation: gr(true, "ds-buff-titanium"),
    lightfastness: lf("I", "excellent", "ds-buff-titanium"),
    behaviour: f(
      "Semi-opaque to semi-transparent and granulating: dropped into a damp wash, it pushes the other pigment aside, which is how it makes soft clouds.",
      "ds-buff-titanium",
    ),
    note: f("Unique to Daniel Smith: the ecru of sand and antique lace.", "ds-buff-titanium"),
    artistNote: "Acts like white gouache without much of the chalkiness.",
    look: { masstone: "#cdb88e", mid: "#dccca9", wash: "#e9e1cd" },
  },
  // The current mix, PB29 + PBk9: Jorge's tube label, 2026-11-23.
  "paynes-grey": {
    pigments: ["PB29", "PBk9"],
    transparency: tr("semi-transparent", "ds-paynes-gray", "ap-ds-paynes-gray"),
    staining: st(2, "ds-paynes-gray", "ap-ds-paynes-gray"),
    granulation: gr(true, "ds-paynes-gray", "ap-ds-paynes-gray"),
    lightfastness: lf("I", "excellent", "ds-paynes-gray"),
    behaviour: f("A cool blue grey: dilute, for wet skies and flat water; concentrated, for storm clouds, rocks and their shadows.", "ds-paynes-gray"),
    note: f(
      "Named after William Payne, a watercolourist working from 1776 to 1830, who first mixed it from Prussian blue, yellow ochre and crimson lake.",
      "wiki-paynes-grey",
    ),
    look: { masstone: "#252c35", mid: "#56616d", wash: "#c4cad1" },
  },
  "burnt-sienna": {
    pigments: ["PBr7"],
    transparency: tr("semi-transparent", "ds-burnt-sienna"),
    staining: st(1, "ds-burnt-sienna"),
    granulation: gr(true, "ds-burnt-sienna"),
    lightfastness: lf("I", "excellent", "ds-burnt-sienna"),
    behaviour: f(
      "A rich, warm earth that mixes without losing intensity or transparency, and later glazes over it neither muddy nor stain it.",
      "ds-burnt-sienna",
    ),
    look: { masstone: "#6a2b12", mid: "#ad5627", wash: "#eec6a9" },
  },
  // Royal Talens Extra Fine Gouache, titanium white, PW6: the pigment is from Jorge's tube label (2026-11-23).
  "white-gouache": {
    pigments: ["PW6"],
    transparency: tr("opaque", "rt-opacity"),
    staining: unrated("Not rated by the maker", "rt-gouache"),
    granulation: unrated("Not rated by the maker", "rt-gouache"),
    lightfastness: { level: 3, of: 3, words: "+++, at least 100 years under museum conditions", src: ["rt-gouache"] },
    behaviour: f("Opaque, unlike the watercolours: gouache's opaque extender makes it cover what is under it instead of letting it show through.", "rt-opacity"),
    look: { masstone: "#fbfbf7", mid: "#f6f6f1", wash: "#f2f3ef" },
  },
} as const satisfies Record<PaintKey, PaintFacts>;
