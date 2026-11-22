import Link from "next/link";
import { PageHead } from "@/ui/PageHead";

export default function NotFound() {
  return (
    <>
      <PageHead label="Sheet 404 — Not found" status="No such sheet" title="404" />
      <section className="lost grid" aria-label="Where to go">
        <p>
          There is nothing at this address. Try the <Link className="u" href="/">home page</Link>, the{" "}
          <Link className="u" href="/work">work</Link> or the <Link className="u" href="/blog">blog</Link>.
        </p>
      </section>
    </>
  );
}
