// A post's cover image, in a ruled frame across the page. Covers are
// decorative (the title sits above them), so the image has empty alt text.
// A post without a cover shows nothing.

import Image from "next/image";
import type { PostMeta } from "@/content/posts";

type Props = {
  post: Pick<PostMeta, "cover">;
  /** The `sizes` attribute: how wide the cover shows at each viewport. */
  sizes: string;
  /** Load at once: only for the cover at the top of a page. */
  preload?: boolean;
};

export function Cover({ post, sizes, preload = false }: Props) {
  if (!post.cover) return null;
  return (
    <div className="cover">
      <Image
        src={post.cover}
        alt=""
        fill
        sizes={sizes}
        preload={preload}
        // The top cover is the page's largest paint: fetch it ahead of the scripts.
        fetchPriority={preload ? "high" : undefined}
        className="object-cover"
      />
    </div>
  );
}
