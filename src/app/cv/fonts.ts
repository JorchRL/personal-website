// Latin Modern Roman for /cv: the face public/cv.pdf is set in, so the page
// reads like the PDF. Self-hosted, only the faces the sheet uses (regular,
// bold, italic, and the small-caps face for the name and the title), each
// subset to Latin and the punctuation the CV uses (fonttools' pyftsubset, from
// the OpenType files TeX distributions ship). Latin Modern is © B. Jackowski
// and J. M. Nowacki, under the GUST Font License
// (http://tug.org/fonts/licenses/GUST-FONT-LICENSE.txt): free to use and
// redistribute; a modified file goes out under a new file name, as these
// subsets do (*-latin.woff2), with the fonts' copyright notices kept inside.
// next/font loads them on /cv only, with font-display: swap.

import localFont from "next/font/local";

export const latinModern = localFont({
  src: [
    { path: "./fonts/lmroman10-regular-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/lmroman10-bold-latin.woff2", weight: "700", style: "normal" },
    { path: "./fonts/lmroman10-italic-latin.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  variable: "--font-lm",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const latinModernCaps = localFont({
  src: "./fonts/lmromancaps10-regular-latin.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-lm-caps",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});
