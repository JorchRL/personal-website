// The art section's own words: /art's intro, and the paintings' slide in the
// home page's showcase (content/showcase.ts, { kind: "art" }). What he paints
// with is in content/materials.ts.

export const gallery = {
  /** The slide's name, and its tab's. */
  name: "Watercolours",
  /** /art's intro, in his words: set beside the page's title. */
  intro:
    "I started painting in August 2026, after a workshop on how to paint clouds. I mostly paint landscapes, and I'm learning not to overwork them. I want to make the art for my own games myself.",
  /** The longer intro; unused for now. */
  introLong:
    "I started painting in August 2026, after a workshop on how to paint clouds. I had never tried watercolour, I liked it, and I bought my own paper and paints. I mostly paint landscapes, or try to learn how. Right now I'm learning not to overwork a painting, and to accept that watercolour will do whatever it wants instead of trying to control it. Painting and code feel alike to me: small decisions, moment to moment, with the big picture in mind. One is just more formal. I want to make the art for my own games myself.",
  /** The slide's line: the intro's first sentence. */
  lead: "I started painting in August 2026, after a workshop on how to paint clouds.",
  /** The intro's first two sentences: /art's meta description and llms.txt. */
  summary:
    "I started painting in August 2026, after a workshop on how to paint clouds. I had never tried watercolour, I liked it, and I bought my own paper and paints.",
} as const;
