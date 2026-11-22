// Open Graph images: a sheet in the site's technical-print look, drawn at
// build time by next/og. The page's label and title, the column grid, and the
// title block along the bottom. Fonts are the site's own (OFL, files in
// ./fonts): next/og reads TTF, not the WOFF2 next/font serves.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@content/site";
import { stripTodos } from "@/content/todos";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const PAPER = "#eef1f2";
const INK = "#0b0c0e";
const INK_2 = "#464b52";
const INK_3 = "#666c74";
const GUIDE = "rgba(11,12,14,0.07)";
const ACCENT = "#ff3f0f";
const MARGIN = 56;
const COLS = 12;
const GAP = 16;

type Font = { name: string; data: Buffer; weight: 400 | 500 | 600 | 800; style: "normal" };
let fonts: Promise<Font[]> | undefined;

function loadFonts() {
  const dir = path.join(process.cwd(), "src/seo/fonts");
  const font = (file: string, name: string, weight: Font["weight"]) =>
    readFile(path.join(dir, file)).then((data): Font => ({ name, data, weight, style: "normal" }));
  fonts ??= Promise.all([
    font("SchibstedGrotesk-ExtraBold.ttf", "Schibsted Grotesk", 800),
    font("SchibstedGrotesk-Medium.ttf", "Schibsted Grotesk", 500),
    font("IBMPlexMono-Regular.ttf", "IBM Plex Mono", 400),
    font("IBMPlexMono-SemiBold.ttf", "IBM Plex Mono", 600),
  ]);
  return fonts;
}

function Cell({ label, value, grow = 1, last = false }: { label: string; value: string; grow?: number; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: grow,
        flexBasis: 0,
        padding: "10px 14px 12px",
        borderRight: last ? "none" : `1.5px solid ${INK}`,
      }}
    >
      <div style={{ fontFamily: "IBM Plex Mono", fontSize: 13, letterSpacing: 1.5, color: INK_3 }}>{label}</div>
      <div style={{ marginTop: 6, fontFamily: "Schibsted Grotesk", fontWeight: 800, fontSize: 22, letterSpacing: -0.6 }}>
        {value}
      </div>
    </div>
  );
}

export async function ogImage({ label, title }: { label: string; title: string }) {
  const text = stripTodos(title) || site.name;
  const fontSize = text.length > 90 ? 56 : text.length > 50 ? 68 : text.length > 24 ? 84 : 112;
  const colWidth = (ogSize.width - 2 * MARGIN - (COLS - 1) * GAP) / COLS;
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: `0 ${MARGIN}px`,
          backgroundColor: PAPER,
          color: INK,
        }}
      >
        {/* The column grid, faint. */}
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: MARGIN + Math.min(i, COLS) * (colWidth + GAP) - (i === COLS ? GAP : 0),
              width: 1,
              backgroundColor: GUIDE,
            }}
          />
        ))}
        {/* Running head */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            padding: "26px 0 14px",
            borderBottom: `1.5px solid ${INK}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: "Schibsted Grotesk", fontWeight: 800, fontSize: 26, letterSpacing: -0.4 }}>
              {site.name}
            </div>
            <div style={{ fontFamily: "IBM Plex Mono", fontSize: 18, color: INK_3 }}>{new URL(site.url).host}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "IBM Plex Mono", fontSize: 18 }}>
            <div style={{ width: 14, height: 14, backgroundColor: ACCENT }} />
            {site.open}
          </div>
        </div>
        {/* Label and title */}
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
          <div style={{ fontFamily: "IBM Plex Mono", fontSize: 20, letterSpacing: 2.4, color: INK_2 }}>
            {label.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              marginLeft: -4,
              maxWidth: 1000,
              fontFamily: "Schibsted Grotesk",
              fontWeight: 800,
              fontSize,
              lineHeight: 0.98,
              letterSpacing: -fontSize * 0.045,
            }}
          >
            {text}
          </div>
        </div>
        {/* Title block */}
        <div style={{ display: "flex", marginBottom: 34, border: `1.5px solid ${INK}` }}>
          <Cell label="DRAWN BY" value={site.name} grow={1.5} />
          <Cell label="LOCATION" value={site.location} grow={1.2} />
          <Cell label="CONTACT" value={site.email} grow={1.6} last />
        </div>
      </div>
    ),
    { ...ogSize, fonts: await loadFonts() },
  );
}
