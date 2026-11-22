import { pageMetadata } from "@/seo/metadata";
import { Grid } from "@/widgets/Grid";

export const metadata = pageMetadata({ path: "/" });

export default function Home() {
  return <Grid />;
}
