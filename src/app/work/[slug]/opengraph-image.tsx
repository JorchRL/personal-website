import { notFound } from "next/navigation";
import { site } from "@content/site";
import { getAllWork, getWork } from "@/content/work";
import { stripTodos } from "@/content/todos";
import { ogContentType, ogImage, ogSize } from "@/seo/ogImage";

export const alt = `A project by ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getAllWork().map((work) => ({ slug: work.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const work = getWork((await params).slug);
  if (!work) notFound();
  const role = stripTodos(work.role);
  return ogImage({ label: role ? `Work · ${role}` : "Work", title: work.title });
}
