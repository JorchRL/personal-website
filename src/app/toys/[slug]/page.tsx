import Link from "next/link";
import NotFound from "@/app/not-found";
import { toys, getToy } from "@/toys/registry";
import { TOYS_PATH, toyPath } from "@/seo/urls";
import { PageHead } from "@/ui/PageHead"
import { pageMetadata } from "@/seo/metadata";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return toys.map(({ toy }) => ({ slug: toy.manifest.slug }));
}


// func generateMetadata
export async function generateMetadata({ params }: Params) {
  const line = getToy((await params).slug);
  if (!line) return;
  const { slug, title, description } = line.toy.manifest;
  return pageMetadata({title, description, path: toyPath(slug)})
}

export default async function ToyPage({ params }: Params) {
  const line = getToy((await params).slug);
  if (!line) notFound();
  const { manifest, Face } = line.toy;
  return (
    <>
      <PageHead label={<Link href={TOYS_PATH}>Toys</Link>} title={manifest.title} lead={manifest.description} />
      <div className="toy-figure">
        <Face no="Fig. 1" />
      </div>
    </>
  );
}
