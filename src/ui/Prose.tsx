// Long-form text: blog posts and work pages. Sets the reading measure
// (about 65 characters a line) and the styles for markdown output.
// The styles live under `.prose` in src/app/globals.css.

export function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`prose ${className}`.trim()}>{children}</div>;
}
