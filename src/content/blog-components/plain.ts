// The plain text of each post's own figures, by post slug and component name:
// the markdown twin (src/seo/twins.ts) and the word count (src/content/posts.ts)
// use it in place of the figure. A figure listed here needs no children in the
// post: its face is rendered from the same data (src/content/mdx-components.tsx).
// No React here.

import { plain as guidedBuilding } from "./learning-by-guided-building-with-ai/plain";

type Plain = Record<string, (props: Record<string, string>) => string>;

export const postPlain: Record<string, Plain> = {
  "learning-by-guided-building-with-ai": guidedBuilding,
};
