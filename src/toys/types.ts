
import type { ReactNode } from "react";

export type ToyManifest = {
  slug: string;
  title: string;
  description: string;
}

export type FaceProps = {
  no?: string;
}

export type ToyModule = {
  manifest: ToyManifest;
  Face: (props: FaceProps) => ReactNode;
}
