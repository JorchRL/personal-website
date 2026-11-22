import { site } from "@content/site";
import { ogContentType, ogImage, ogSize } from "@/seo/ogImage";

export const alt = `${site.name}: ${site.intro}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ label: "Personal site", title: site.intro });
}
