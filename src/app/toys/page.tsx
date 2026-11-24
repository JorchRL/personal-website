import Link from "next/link";
import { toysPage } from "@content/toys";
import { pageMetadata } from "@/seo/metadata";
import { TOYS_PATH, toyPath } from "@/seo/urls";
import { toys } from "@/toys/registry";
import { PageHead } from "@/ui/PageHead";
import { sheetLabel } from "@/ui/sections";
import "@/toys/toys.css";

// /toys: every toy in the registry, one row each, with a link to its page.

export const metadata = pageMetadata({
  title: "Toys",
  description: "Small interactive programs Jorge Romero builds by hand, each on its own page with notes on how it works.",
  path: TOYS_PATH,
});

export default function ToysIndex() {
  return (
    <>
      <PageHead
        label={sheetLabel("/toys")}
        status={toys.length === 0 ? "None yet" : toys.length === 1 ? "1 toy" : `${toys.length} toys`}
        title="Toys"
        lead={toysPage.lead}
      />
      <section className="sec bare" aria-label="Toys">
        {toys.length === 0 ? (
          <p className="toys-empty">{toysPage.empty}</p>
        ) : (
          <ol className="rows toys">
            {toys.map(({ toy: { manifest } }) => (
              <li key={manifest.slug}>
                <Link href={toyPath(manifest.slug)}>
                  <span className="t">{manifest.title}</span>
                  <span className="d">{manifest.description}</span>
                  <span className="go">Open</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
