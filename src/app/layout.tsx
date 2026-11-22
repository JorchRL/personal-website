import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@content/site";
import { siteJsonLd } from "@/seo/jsonld";
import { Footer } from "@/ui/Footer";
import { Header } from "@/ui/Header";
import { JsonLd } from "@/ui/JsonLd";
import { TrackContacts } from "@/ui/TrackContacts";
import "./globals.css";

// Display and text: one variable file, 400–900.
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});

// Labels, figures, annotations and code.
const mono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.intro,
  authors: [{ name: site.name, url: site.url }],
};

export const viewport: Viewport = {
  themeColor: "#eef1f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <JsonLd data={siteJsonLd()} />
        <div className="page">
          <a href="#main" className="skip">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <TrackContacts />
        <Analytics />
      </body>
    </html>
  );
}
