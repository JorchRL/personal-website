// The home page's deck, as numbers: which section is showing for a sideways
// scroll position, and how tall the deck is there. No DOM here (Deck.tsx
// measures and applies it), so it is tested on its own.
//
// A position `x` is the deck's sideways scroll in sections: 0 shows the first
// section, 1.5 is halfway from the second to the third.

/**
 * When the deck is on: a screen at least 768 px wide with JavaScript on.
 * globals.css repeats this query for the deck's layout (a test checks they
 * match); anywhere else the sections stack. Reduced motion keeps the deck:
 * nothing moves unless the visitor asks, and then without a slide.
 */
export const DECK_QUERY = "screen and (scripting: enabled) and (min-width: 768px)";

/** The section the tab bar marks at position `x`: the one that covers more of the deck. */
export function activeAt(x: number, count: number): number {
  return Math.min(Math.max(0, Math.round(x)), count - 1);
}

/**
 * The deck's height at position `x`: the showing section's, and between two,
 * a blend of theirs in step with the slide, so the page below moves smoothly
 * rather than jumping when the section changes.
 */
export function heightAt(heights: number[], x: number): number {
  if (!heights.length) return 0;
  const last = heights.length - 1;
  const clamped = Math.min(Math.max(0, x), last);
  const i = Math.floor(clamped);
  const f = clamped - i;
  if (i >= last || f < 0.001) return heights[i];
  return heights[i] + (heights[i + 1] - heights[i]) * f;
}
