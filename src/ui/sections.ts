// The site's three sections, in the running head and the title block.

export const sections = [
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

// Links to /cv and /work-with-me are not prefetched: a prefetch of a route the
// build does not have stays pending in the browser, and the page never goes
// network-idle (pnpm verify waits for that).
