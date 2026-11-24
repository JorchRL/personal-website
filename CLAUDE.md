# jrlgs.dev

Jorge Romero's personal site. Its job: get him contacted about remote software
engineering roles (ideally game development) and contract work. The home page is a
document of numbered sections (each a widget); work, art, blog and about are one
click away on any device. Under the first screen, 01 Showcase is a deck of slides, one at a
time under a tab bar: a few of his best things (`content/showcase.ts`), moved sideways
only when the visitor asks (see "The home page's showcase"); 02 Two doors and 03
Contact follow.

## Rules

1. **No invented facts about Jorge.** Every claim about him comes from his own words:
   his posts, his résumé, his project repositories and their docs, or what he has
   told you. A missing fact is written as the literal text
   `TODO(jorge): <what is missing>` in the content file, never guessed (in frontmatter, quote it: `description: "TODO(jorge): …"`).
   Pages show it marked; `<title>`, Open Graph, RSS and llms.txt drop its sentence
   (`stripTodos`). The old site's filler ("50+ projects", "20+ happy
   clients", "Creative Developer", "Available for projects", stock images) never comes back.
2. All text and links are in the HTML with JavaScript off. Interactive pieces add to a
   page; they never delay, cover or break its text.
3. Motion respects `prefers-reduced-motion`. One theme. No contact form, no backend
   services; every route is static.
4. Never change Jorge's words in imported posts; fix only how they render.
5. The bar for a release: on mobile, Lighthouse performance, accessibility and SEO at
   95 or more on the home page, a long post, /art and a painting (`pnpm verify`), and
   no TODO left (so no placeholder painting).
6. This repository is public. Private notes (plans, reviews, reports, remarks on what
   is weak or unconfirmed) stay out of it: `docs/superpowers/`, `docs/first-pass-report.md`
   and `TODO-REPORT.md` are git-ignored for that reason.

## Commands

```sh
pnpm dev      # local preview at http://localhost:3000
pnpm build    # production build (every route static)
pnpm check    # lint + tsc --noEmit + vitest; run before every commit
pnpm test     # vitest only
pnpm todos    # list every TODO(jorge) in content/ into TODO-REPORT.md (git-ignored)
STRICT_TODOS=1 pnpm build   # the production build, locally: fails while any TODO(jorge) is left
STRICT_DRAFTS=1 pnpm build  # fails while any post has draft: true (set it on Vercel to make a draft block a deploy)
pnpm verify   # with `pnpm start` running: no-JS, 360 px, wide-screen and Lighthouse checks;
              # screenshots into docs/screenshots/ (once: pnpm exec playwright install chromium)
pnpm art:prepare <scan.png> --slug <slug>   # a painting's picture and close-up files
              # (see "How to add a painting"; local only, the scan is never uploaded)
pnpm cv:pdf   # typeset public/cv.pdf with LaTeX from the CV's content (needs Tectonic:
              # brew install tectonic); run it after every change to the CV's content
```

Node 22.18 or later (`.nvmrc`; `engines` in `package.json` gives Vercel 22.x): the TODO
gate imports `.ts` files directly. pnpm 10 (`packageManager`).

The TODO gate runs first in `pnpm build`. On a Vercel production deploy
(`VERCEL_ENV=production`) or with `STRICT_TODOS=1`, it fails the build and lists every
TODO left. A local build or a Vercel preview deploy passes and prints how many are
left, so the preview shows them marked. A draft's TODOs count only where drafts are
built (see "Drafts").

## The CV and its PDF

`/cv` and `public/cv.pdf` come from one object, `getCv()` in `src/content/cv.ts`:
`content/cv.ts` (job titles, companies, outcome lines, the summary, skills),
the dates, roles and stacks of the work pages it names, the core facts in
`content/site.ts` (the title is the engineering role line, `role`, without its full stop; the availability
line, under it; contact details; what he is looking for) and the hiring terms in
`content/hire.ts` (his English is the CV's "Languages" line). Each entry's id is its
work page's slug (`/cv#twinteraction`), and a work page's CV button opens it. In an
outcome line, `**…**` marks a key fact: bold on /cv and in the PDF.

`/cv` reads like the PDF: a white sheet in Latin Modern (`src/app/cv/fonts.ts`:
self-hosted woff2 subsets in `src/app/cv/fonts/`, loaded by `next/font/local` on /cv
only; GUST Font License), with the same layout as below, plus the summary and the
hiring terms the PDF leaves out. The meta row and the buttons above the sheet keep the
site's look; printed from a browser, the sheet prints alone.

`scripts/cv-pdf.mjs` (`pnpm cv:pdf`) typesets the PDF with LaTeX: it calls `getCv()`
directly (`scripts/lib/ts-paths.mjs` lets Node resolve the `@/` aliases), writes a
LaTeX document (`scripts/lib/cv-tex.mjs`, the layout) and compiles it with Tectonic, a
self-contained LaTeX engine (`brew install tectonic`; its first run downloads the packages).
It is a local step: the site's build never needs LaTeX, so commit `public/cv.pdf`.
The layout is a one-page résumé for applicant tracking systems: Letter, Latin Modern,
one column, each company once (its location on the right, an optional context line in
italics, `context` and `location` in `content/cv.ts`) with its role and dates under it, bullets (U+2022) with
key facts in bold, skills as "Group: items" lines, contact links as plain text joined
by " | ", every link absolute to `https://jrlgs.dev`. It leaves out the summary and the
hiring terms to fit one page (the header's availability line carries the essentials;
/cv shows both). Bullets read best at 150 to 215 characters (two lines); `pnpm cv:pdf`
lists the ones outside that window, and warns when the PDF runs past one page.
The PDF prints a hash of the CV (`rev. …`); `test/pages.test.ts` reads the PDF's text
back (`test/pdf-text.ts`; check by eye with `pdftotext public/cv.pdf -`) and fails
while that hash is old, while the PDF is over 2.5 MB or more than one page, when its
text lacks the name, the contact details, an entry or a bullet, or when a link names a
local server. So after editing the CV's content, a work page's frontmatter, `site.ts`
or `hire.ts`: `pnpm cv:pdf`, then commit `public/cv.pdf` with the change.

## Map

```
content/            Everything Jorge writes. The only place facts live.
  site.ts           The core facts, each written once: name, URL, the role lines
                    (`roles`, both trades, on the home page, /about, link previews,
                    JSON-LD and llms.txt; `role`, engineering alone, on the CV, its
                    PDF, /work-with-me and a post's end), the proof line, what he
                    is open to, the availability line, what he is looking for,
                    city, location, time zone, the intro (meta description, built
                    from the others), email, social links. Every
                    page, the CV and PDF, JSON-LD and the machine forms read them from
                    here; test/core-facts.test.ts fails on a copy elsewhere. In
                    about.md, write one as {{site.lookingFor}} (src/content/pages.ts).
  home.ts           The home page's words: the two doors' titles and the clients'
                    line, the contact notes.
  showcase.ts       The home page's showcase: its slides in order, each naming a work
                    page, a post, the Now list or the art (a few paintings), with an
                    optional tab name and one-line note. A name that names nothing
                    fails the build.
  cv.ts             The CV (/cv and public/cv.pdf): job titles, companies, outcome
                    lines, the summary (the CV's own), projects, skills.
  hire.ts           How to hire him: contract route, time zone, overlap, English (the
                    one place his languages are asked). Shown on /about,
                    /work-with-me and the CV.
  about.ts          /about's sections: roles he fits at a studio (each a title, one
                    clause of proof and a link to the work page's section that tells
                    it; the home page's employers' door lists the same roles), the
                    skills table (skill · used for · last used · depth; a cell can
                    come from a work page: { stackOf } or { endOf }, src/content/skills.ts),
                    why games.
  work-with-me.ts   /work-with-me: offers (one line on the work, one clause of proof,
                    a link to the work page's section), rates, hours, the steps to
                    start, testimonials.
  blog/<slug>.md    Posts, or blog/<slug>.mdx for one that embeds components (images
                    in public/blog/<slug>/).
  work/<slug>.md    Work pages: whiz-study, twinteraction, the-lone-wander, plain-engine,
                    lumen. Each opens with a diagram of its architecture (public/work/<slug>/).
  art/<slug>.md     Paintings (see "How to add a painting"); their pictures and the
                    close-up viewer's files in public/art/.
  materials.ts      What he paints with, written once: papers, his usual sheet,
                    paints and their pigments' codes. A painting names its paper and
                    paints by key.
  pigments.ts       What each paint is made of, for /art's swatches: per pigment (by
                    Colour Index code) its chemistry, formula, class and history; per
                    paint the maker's ratings, how it behaves, its swatch colours and
                    an optional scanned swatch. Every fact names its
                    sources (`sources`, linked on the page).
  gallery.ts        The art section's words: /art's intro, the showcase slide's name and line.
  about.md, now.md  The about page's opening text, and the showcase's Now slide (one
                    dated line per project, linked to its work page's next steps;
                    shown only while content/showcase.ts lists { kind: "now" }).
src/app/            Routes (Next.js App Router). layout.tsx holds the running head,
                    the title block, fonts, site-wide JSON-LD and analytics;
                    globals.css holds the look. A markdown post is rendered by
                    blog/[slug]; an .mdx post by mdx/blog/[slug], served at
                    /blog/<slug> by a rewrite in next.config.ts, so its components'
                    code and styles (src/content/mdx.css) never load on a markdown post.
src/ui/             Shared pieces: Header (the running head) and NavLinks, Footer (the
                    title block), PageHead (an inner page's head), SectionHead (a
                    numbered section's head), Prose (long-form text), Cover (a post's
                    cover image), Closing (the end of a post or a work page: the role
                    line, availability, Email me, CV), PostArticle (a post's page
                    around its body, for both kinds), Profiles, JsonLd, TrackContacts and
                    contactEvents.ts (the contact events sent to Vercel Analytics).
src/content/        Loaders: the only code that reads content/ (posts.ts, work.ts,
                    art.ts, schema.ts, pages.ts, skills.ts, cv.ts), image-size.ts (a
                    picture's size from its file's header), todos.ts, slug.ts (heading
                    ids: a work page's h2–h6 get ids from their text, so other pages
                    link to a section; a test checks every such link), Markdown.tsx (markdown → HTML),
                    Mdx.tsx (an .mdx post → HTML, at build time), mdx-components.tsx
                    (the only components a post can use), LiveSlot.tsx (mounts a
                    post's own interactive piece when it scrolls into view),
                    mdx-plain.ts (an .mdx body
                    parsed, and written back as plain markdown for its twin),
                    blog-components/<slug>/ (a post's own interactive pieces, and
                    plain.ts: their text for the twin), drafts.ts (which drafts
                    are built) and
                    TodoText.tsx (a frontmatter string with its TODOs marked).
src/seo/            Machine-readable forms: pageMetadata (title, canonical, Open
                    Graph), JSON-LD, RSS, llms.txt, the markdown twins, Open Graph
                    images (fonts in src/seo/fonts/; a painting's shows the
                    painting). Twins are served at /blog/<slug>.md,
                    /work/<slug>.md and /art/<slug>.md by src/app/md/ via a rewrite
                    in next.config.ts, which also redirects the old site's
                    /projects pages to /work; /cv.md, /work-with-me.md and
                    /about.md have their own routes (src/app/<page>.md/).
src/art/            The art section's live parts: viewer/ (the close-up viewer on a
                    painting's page), Offer.tsx (the enquiry and the print link),
                    pigments/ (/art's "Paints": a swatch per paint, each opening
                    its pigment's sheet).
src/widgets/        The home document: one folder per widget (intro, showcase, doors,
                    contact), the registry, Grid (the cells, numbered), showcase (01
                    Showcase: its slides, from content/showcase.ts) and Deck (slides
                    under a tab bar, in a sideways scroller; its numbers in
                    deckGeometry.ts).
scripts/            check.mjs (pnpm check), todo-report.mjs (pnpm todos),
                    art-prepare/ (pnpm art:prepare: a painting's picture and close-up files from
                    its scan; its own package.json, so its depth model never installs
                    on a deploy),
                    verify.mjs (pnpm verify; lib/edge-clip.mjs, its wide-screen check;
                    lib/viewer-shift.mjs and viewer-shift.mjs, the close-up's movement check;
                    lib/pigment-drawer.mjs and pigment-drawer.mjs, the swatches' drawer's),
                    cv-pdf.mjs (pnpm cv:pdf; lib/cv-tex.mjs, the CV's LaTeX layout;
                    lib/ts-paths.mjs, the aliases for scripts that load src/) and
                    one-off scripts.
public/cv.pdf       The CV as a PDF, typeset from the CV's content by pnpm cv:pdf. Never edit by hand.
test/               vitest: content checks, the widget registry and the sitemap,
                    LiveSlot (jsdom), the showcase (its items, its HTML, its tabs in
                    jsdom), the CV, /about and /work-with-me with their machine forms
                    and the PDF, MDX posts (test/mdx.test.ts; its sample post is
                    test/fixtures/mdx/blog/, never published), drafts
                    (test/drafts.test.ts), the guided-building post's figures
                    (test/guided-post.test.ts) and the wide-screen rule
                    (test/edge-clip.test.ts), the paintings and the placeholder
                    rule, the enquiry and fan art (test/art.test.ts), the close-up
                    viewer's switches and its code kept out of the first load
                    (test/viewer.test.ts), the sheet numbers (test/site.test.ts), the
                    pigment facts and their sources (test/pigments.test.ts) and the
                    swatches' sheets from the keyboard and the mouse
                    (test/pigment-chart.test.ts, jsdom).
public/art/         The paintings' pictures (content/art/ names them), and each one's
                    close-up files in public/art/<slug>/ (pnpm art:prepare).
docs/screenshots/   The pages at 390 px and 1440 px, written by pnpm verify (the home
                    page at 1440 px: its first screen, then one per slide and section).
```

## The look

Technical print. Tokens are CSS variables in `src/app/globals.css` (some also as
Tailwind utilities: `bg-paper`, `text-ink`, `text-ink-2`, `text-ink-3`, `text-accent`,
`font-sans`, `font-mono`). Most of the look is plain classes in that file, grouped by
part (running head, title block, sections, rows, the first screen, plates, prose).

- Colours: `--paper` #eef1f2 (cold white), `--ink` #0b0c0e, `--ink-2` #464b52
  (secondary text), `--ink-3` #666c74 (labels and numbers; 4.7:1 on paper, 4.3:1 on
  `--paper-2`, so the code, cover and figure surfaces set it to #5b6169), `--accent`
  #ff3f0f signal orange (3.1:1 on paper), used sparingly: marks, rules, arrows, focus
  rings and hover underlines, never text. A hovered link keeps its ink colour and gains
  an accent underline. Small text that must read as accent (a plate's control letters)
  uses `--accent-ink` #b8300a (5.3:1). `--rule` (ink rules), `--hair` (hairlines), `--guide` (the
  printed grid). Code colours: `--code-*`, each at least 5:1 on `--paper-2`.
- Fonts: Schibsted Grotesk (display and text, variable 400–900) and IBM Plex Mono
  (labels, figures, annotations, code; 400 and 600), loaded with `next/font` in
  `layout.tsx`. /cv's sheet alone is set in Latin Modern, like the PDF. Open Graph images use the same faces from `src/seo/fonts/`.
- The grid: `.grid` is 12 columns (4 on a phone, ≤ 700 px), with the columns printed
  faintly behind the page (`.page::before`). Tablet: ≤ 1100 px.
- Pieces: `.sec` + `<SectionHead>` (a numbered section: 2 px rule, number, title,
  "more" link), `.rows` (a ruled table of rows, one link each), `.label` and `.mono`
  (mono captions), `.btn` / `.btn-primary` (square ink buttons), `.facts` (a row of
  facts set as a title block), `.plate` / `.frame` (a figure in a ruled frame),
  `.status` (the accent square). No cards, no rounded corners, no shadows.
- Long-form text goes inside `<Prose>`: 18 px, about 65 characters a line
  (`--measure`); code, displayed maths, tables and lone pictures may run wider. Pictures
  multiply onto the paper.
- A missing fact shows as `mark.todo`: mono, on an accent tint, dashed outline.
- Motion: the name wipes in, the first screen rises, and a tab slides the showcase to
  its slide, only without `prefers-reduced-motion` (then the deck switches at once).

## How to add a post

1. Create `content/blog/<slug>.md` with frontmatter: `title`, `description`, `date`
   (ISO, e.g. `2026-11-20`), `tags` (list), optional `cover` (path under `/blog/<slug>/`).
2. Put its images in `public/blog/<slug>/` and link them as `/blog/<slug>/<file>`.
3. Run `pnpm check`: it fails on a missing field, a missing image or a broken internal link.

### Drafts

`draft: true` in a post's frontmatter (`.md` or `.mdx`) keeps it unpublished
(`src/content/drafts.ts`):

- In `pnpm dev`, a local `pnpm build` and a Vercel preview deploy, it renders at
  `/blog/<slug>` (and its twin, `/blog/<slug>.md`), so it can be read there. Its head
  shows a Draft mark and "not published"; its page carries `noindex, nofollow` and its
  twin `X-Robots-Tag: noindex`.
- It is never listed: not on `/blog`, the home showcase (naming it there fails like a
  missing post), RSS, the sitemap, `llms.txt`, or any post's prev/next. `getAllPosts()`
  and `getPost()` return published posts only; the routes that render a page, a twin or
  an Open Graph image use `getPagePosts()` / `getPagePost()`, which add the drafts where
  they are built.
- On a Vercel production deploy (`VERCEL_ENV=production`) drafts are not built at all:
  no page, no twin, no rewrite, and their TODOs do not fail the TODO gate. To make a
  forgotten draft stop a build instead, set `STRICT_DRAFTS=1` (in Vercel's production
  environment, or locally): the gate in `pnpm build` then fails, naming each draft.
- A post whose body holds the line "First draft written with AI from Jorge's notes,
  for him to rewrite." (`AI_DRAFT_LINE`) is a draft whatever its frontmatter says, so a
  first draft written with AI cannot ship by accident. Rewrite it, then delete the line.
- To publish: delete the `draft` line (and the post's TODOs).

### Markdown or MDX

Write `.md` unless the post embeds something: a figure with a caption, an aside, or
a piece of its own that moves. Then write `content/blog/<slug>.mdx`: the same
frontmatter, the same markdown, plus the components below. An `.mdx` post loads a
little client code and a stylesheet that a `.md` post does not. A slug used by both an
`.md` and an `.mdx` file fails the build.

Components (no imports: a post can use only what `src/content/mdx-components.tsx`
lists; `import` and `export` fail the build):

- `<Figure src="/blog/<slug>/x.png" alt="…" caption="…" />`: a picture as a figure.
  Its width and height are read from the file (PNG, JPEG, GIF, WebP); give `width` and
  `height` for any other kind.
- `<Aside>…</Aside>`: a side note. Put its text on lines of its own between the tags,
  so it is read as paragraphs.
- `<Demo caption="…">…</Demo>`: a ruled frame for a post's own component.

Figure and Demo are numbered Fig. 1, Fig. 2… in order (`mark="…"` sets one).
Headings get ids from their text, so `[see](#waves-on-a-plate)` links to a section.
Maths is `$$…$$` (inline within a line, displayed on lines of its own); `\(…\)`
does not work in MDX.

Characters to escape in text (outside `code`): `<` and `{`, written `\<` and `\{`;
`<` starts a component (`1 <= 2` and `<3` fail; `x < y`, with a space, is fine) and `{`
an expression. A paragraph that starts with the word `import` or `export` is read as
code: write the word `{"import"}`. A mistake fails `pnpm check` and `pnpm build` with
the file, the line and a hint.

A post's own interactive piece:

1. `src/content/blog-components/<slug>/Name.tsx`: `"use client"`, a default export
   (its props are the attributes written in the post).
2. `src/content/blog-components/<slug>/load.ts`: `"use client"` and
   `export const name = () => import("./Name");`
3. In `postComponents` in `src/content/mdx-components.tsx`:
   `"<slug>": { Name: postComponent(name) }`. Only that post can use it, and its code
   loads only there, when it scrolls into view.
4. In the post, what you write between its tags is its static face, all a reader
   without JavaScript sees (and what the markdown twin keeps):

   ```mdx
   <Demo caption="Two waves add up.">
     <Name frequency={2}>
       ![Two waves and their sum](/blog/<slug>/sum.png)
     </Name>
   </Demo>
   ```

A piece whose fallback is long (quoted text, code) can render its face from data
instead: give `postComponent(load, Face)` a server component `Face`, and write the
piece with no children (`<TheLoop />`). Then add its plain text for the twin and the
word count to `src/content/blog-components/plain.ts` (by post slug and name). Keep the
data in one module that the face, the live part and the plain text all read (see
`blog-components/learning-by-guided-building-with-ai/`: `data.ts`, `views.tsx` shared by
`Faces.tsx` and the live parts, `plain.ts`, `figures.css` imported by the faces).

In the markdown twin (`/blog/<slug>.md`), a `<Demo>` becomes a plain line
("Interactive figure: <caption> — <the post's URL>") and its static face, a figure a
picture, an aside a quote.

## How to add a work page

1. Create `content/work/<slug>.md` with frontmatter: `title`, `role`, `period`, `stack`
   (list), `description`, `order` (position in lists), `team` ("Solo", or the team's
   size), `figure`, optional `links` (list of `{ label, href }`). The page opens with
   `figure`: a picture or video (`{ src, alt, width, height, poster?, caption? }`, the
   file under `public/work/<slug>/`), or, until one exists, a quoted
   `"TODO(jorge): what to record"`, shown as an empty frame. Then the facts line:
   role · team · timeline · engine and stack.
2. Body: the problem, what Jorge did, the result. Plain first person, no hype; every
   sentence traceable to a source, gaps as `TODO(jorge): …`. A table (a status table,
   dated milestones) is plain Markdown.
3. Run `pnpm check`.

## How to add a painting

A painting is one file, `content/art/<slug>.md`, its picture `public/art/<slug>.jpg`, and
the close-up viewer's files in `public/art/<slug>/`. /art shows the paintings newest first
(by `year`), numbered on Art's sheet: 4.1, 4.2… while Art is Sheet 04 (3.1… while /toys
is hidden). Each gets its own page, link preview, markdown twin, sitemap and llms.txt
entry, and VisualArtwork JSON-LD, all from that one file.

A placeholder painting (a dummy picture, not his) carries `placeholder: "TODO(jorge): …"`,
so a production build fails while one is left (test/art.test.ts states the rule). The
first four were replaced by his scans on 2026-11-23. A portrait scan gets its sizes by
its longer side: `--lamp-sizes` (and `--layer-sizes`) as the widths that make the long
side 3072 and 2048 (the viewer picks a size by its longer side, `pick` in
`src/art/viewer/maps.ts`). When the cut by depth alone runs through the subject
(`cuts.png`), give it `--layers 1` (the Lamp alone) until it has a recipe.

1. Scan the painting: 600 dpi, PNG, the whole sheet, no auto-crop or auto-colour. The
   slug is the title in lower case with hyphens: `harbour-at-dusk`.
2. Run `pnpm art:prepare <scan.png> --slug harbour-at-dusk`. It runs on this machine
   only (the scan is never uploaded; the first run downloads the depth model's weights,
   about 100 MB, into `scripts/art-prepare/.model-cache/`, and installs the tool's own
   packages). It writes the picture, `public/art/harbour-at-dusk.jpg`, and the viewer's
   files, `public/art/harbour-at-dusk/`: the scan for the Lamp (`lamp/`, at 3072 and
   2048 px; the viewer estimates the paper's relief from it) and the Layers (`layers/`:
   the cut-out cards, the bare paper, the painting with its paper filled in, at 3072 and
   1536 px, and the depth, `height.webp`). It prints their size (about 9 MB on disk; a
   visitor loads one effect at one size, 2 to 3 MB).
3. Look at `.art-work/harbour-at-dusk/cuts.png`: one colour a layer, white for the bare
   paper. Without a recipe the layers are cut by depth alone; if a cut runs through
   something that should move as one piece, move the cuts and run it again (it reuses
   the depth, so it is quick): `--cuts 0.3,0.6,0.85` (depths from 0 at the back to 1 at
   the front; the ones used are in `.art-work/<slug>/cuts.json`). `--layers 3` makes
   fewer cards; `--layers 1` gives the Lamp alone.
4. Better layers come from a recipe, `scripts/art-prepare/recipes/<slug>.json`, used
   whenever it exists (Majora's Mask has one): rough regions drawn by hand (polygons in
   pixels of the scan at 1536 px wide), rules that give a pixel its layer when it is in
   a region and deeper than a threshold, and each layer's depth in the box, speck
   radius, outline and backlit rim (see `labelsFromRecipe` in `layers.mjs`). Run the
   tool again after editing it.
5. Create `content/art/harbour-at-dusk.md` (or rename a placeholder's file, then delete
   its `public/art/<old-slug>.placeholder.jpg` and `public/art/<old-slug>/`). In the
   frontmatter, set:
   - `title`, `year`;
   - `image: /art/harbour-at-dusk.jpg` and `alt` (what the picture shows, for someone
     who cannot see it);
   - `paper` (`baohong` or `arches`) and `available` (`true` shows "Interested in this
     painting? Email me", the subject "Painting: <title> (<year>)"; nothing is for sale
     for now, so every painting says `false`);
   - optional: `paints` (keys from `content/materials.ts`; the page lists their
     pigments), `medium` (when the paints do not say it all, e.g. "Watercolour and
     ink"), `size` (`{ width: 30, height: 23 }` in cm; leave it out for the usual
     sheet), `fanArt: true` (someone else's character: marked "Fan art", never offered
     or printed; it also needs `subject` and `owner`, for the label "Fan art of <subject>.
     Characters © <owner>. Not for sale."), `prints: https://…` (a "Get a print" link, shown only when set), `making` (one line on how it was made, in the facts block, the twin and llms.txt only when set).
6. Delete the `placeholder:` line if it was a placeholder. Under the frontmatter, write a
   short note in your own words, or nothing.
7. Run `pnpm check`. It fails on a missing field, a paint or paper not in
   `content/materials.ts`, fan art without its subject or owner, a missing
   picture or map, or a file in `public/art/` that no painting uses.

A missing fact can wait as a TODO: `year` and `paper` each take a quoted
`"TODO(jorge): …"` (Majora's Mask has them until he fills them in).

A new paint or paper goes in `content/materials.ts` once, with its pigments' codes; /art's
line on what he paints with follows. Then give it its entry in `content/pigments.ts`
(the same pigment codes, each described under `pigments`, the maker's ratings, one
sentence on how it behaves, a source for every fact): `pnpm check` fails until it has one.
`pigmentsCheck` in `content/materials.ts` is the TODO that marks the codes as
unconfirmed; set it to `""` once they match the tube labels, and delete each paint's
`check` in `content/pigments.ts` once its question is answered. The showcase's art
slide shows the newest three; to choose, write `{ kind: "art", slugs: ["…", "…", "…"] }`
(three or four) in `content/showcase.ts`.

### Paints: the swatches

/art opens with a colour chart (`src/art/pigments/`): one swatch per paint, in
`content/materials.ts`'s order. Each is a `<details>`: the swatch, its
name and codes, and inside, its pigment's sheet (Colour Index name and number,
chemistry, formula, class, history, the maker's ratings as marks, how it behaves, a
TODO for what to check against the tube, numbered sources). So without JavaScript each
swatch opens in place (a `<noscript>` style lays the chart out as a list). With it,
`PigmentChart.tsx` keeps one sheet open at a time, in a drawer under the chart: out of
flow, over the page below, as wide as the chart, never over the swatches. It slides
down out of the chart's bottom rule (200 ms, ease-out; it just appears with reduced
motion) when a sheet opens from closed; switching swatches swaps its content in place
while an accent tab on its top rule glides to the new swatch (shown only when that
swatch is in the chart's last row; the sheet's head names it by number in accent ink).
A sheet taller than the screen scrolls inside the drawer, its head kept at the top. A
mouse resting on a swatch opens it (after 140 ms) and leaving the chart closes it unless
a click pinned it; Escape, Close or a click outside closes it. It changes no text.
So nothing on the page moves: closing a sheet (or switching to a shorter one) while
the screen shows the part of the page the drawer added would make the browser pull
the page up to its new end, so the page's height is held at the screen's bottom until
the reader scrolls back up. `node scripts/pigment-drawer.mjs <url> [--shots <dir>]`
checks it at 1440 and 390 px (the swatches row and the title block stay put to 1 px,
the page never scrolls by itself, layout shift 0); `pnpm verify` step 8 runs it.

The swatches are drawn in SVG (`Swatch.tsx`): masstone at the top thinning to a wash,
over an ink stripe that a transparent paint leaves black and an opaque one veils;
specks for a granulating paint; a sheet's large swatch is a copy of its chip (an SVG
`<use>`), so each is written into the page once. Their colours (`look`) are approximate. To show his
own swatch instead, scan it, save it as `public/art/swatches/<paint-key>.jpg` (PNG or
WebP also work; about 600 × 750 px, the swatch's 4:5 shape), and set
`swatchImage: "/art/swatches/<paint-key>.jpg"` on the paint in `content/pigments.ts`. The page then says the swatch is scanned.
His own words on a paint go in `artistNote` there; its sheet shows them under "From my painting:" only when set.

### The close-up viewer

- The painting page shows the painting as a picture. Above it, under the head's rule,
  is the close-up's toolbar (`src/art/viewer/Inspect.tsx`): on the left the mode,
  "None · Lamp · Layers" (None, the plain picture, to start); on the right the mode's
  controls, or for None a line on what the others do. Only when a mode other than
  None is chosen do the viewer's code (`Stage.tsx`, through `import()`) and its files
  load, so the page's first load and Lighthouse are untouched (`test/viewer.test.ts`,
  and `pnpm verify` step 8 on the built page). Without JavaScript the toolbar is hidden.
- The toolbar has one fixed height in every mode, laid out by its own width
  (container queries in `art.css`): wide, the mode in 3 columns and its controls in
  the other 9, two rows (the controls; a line of keys and notes); medium, the mode
  above its controls; narrow (a phone), the mode above a "Controls" button that opens
  the controls over the painting. So choosing a mode moves nothing on the page: the
  toolbar, the painting and the facts stay put, the well keeps its colour (the Lamp
  draws the well's colour around the sheet), and the layout-shift score is 0.
  `node scripts/viewer-shift.mjs <url> [route] [--sweep] [--shots <dir>]` measures it
  (at many widths with `--sweep`), on the GPU (`--use-angle=metal`); `pnpm verify`
  step 8 runs it at 1440 and 390 px.
- Both effects are ports of their prototypes, with the prototypes' shaders unchanged,
  except that around the sheet the Lamp draws the well's colour, not the prototype's dark table:
  - the Lamp (`lamp/`): the relief estimated on the GPU from the scan (`estimate.ts`:
    grain, a procedural cotton tooth, ink, gouache, cockling, Sobel normals) and the
    paper shading (`render.ts`: Oren–Nayar, sheen, GGX per surface, height-field
    shadows, ACES); soft or raking lamp, height, relief, four views, zoom to 8× (wheel,
    pinch; double-click fits), keys R, S, N.
  - the Layers (`diorama/`): the shadow box (cards at their depths, cast shadows, a
    moving light, depth of field, click to focus) or the ray-marched depth field;
    three views, depth and blur sliders, tilt on phones.
- The canvas covers the well; at rest the sheet lies exactly over the picture. A
  phone (coarse pointer) gets the smaller files. With reduced motion nothing drifts
  by itself. No WebGL 2 (with float targets, for the Lamp): a note, and the picture.

## How to add a widget

A widget is one block of the home document: a folder, `src/widgets/<slug>/`, plus one
entry in `src/widgets/registry.ts`.

1. Create `src/widgets/<slug>/index.tsx` exporting:
   - `manifest`: `slug` (the folder name), `title`, `description` (one sentence),
     `size`, `order` (unique; the document runs by it, ascending: 10 intro, 20
     showcase, 30 doors, 40 contact, so pick a number between to place a new one),
     and optionally `section: { id, mark? }` (a numbered section; `mark` replaces the
     number, as in "Fig. 1"). The document shows widgets in `order` at every width, a
     phone included, and nothing reorders them with CSS (a test fails on an `order:`
     in `globals.css`), so keyboard focus follows the screen.
   - `Face`: a server component, rendered at build time, taking `{ no }` (its section
     number). It is all a visitor without JavaScript sees, so every text and link the
     widget has goes here. A content widget reads `content/` through the loaders in
     `src/content/`.
2. Import it in `registry.ts` and add it to the `all` list.
3. Run `pnpm check`: it fails on a duplicate slug or order, or a folder missing from
   the registry.

Sizes, from 1100 px on the 12-column grid: `full` all 12, `wide` 7, `m` 5, `s` 4.
Under 1100 px every widget takes the full width.

## The home page's showcase

`src/widgets/showcase/` (01 Showcase) shows `content/showcase.ts`: one slide per item,
in a deck (`src/widgets/Deck.tsx`, a client component around the slides, which are
rendered on the server, so every slide's text and links are in the HTML).

- A slide, the same frame for every kind (`Slide.tsx`): the figure (a work's picture,
  or its empty frame crossed with its `TODO(jorge)`; a post's cover, or its Open Graph
  image; for Now, its dated lines), then the kind and number, the name, the facts line
  (role · period; date · minutes), the first sentences of the item's own description,
  and an Open link to its page (`items.ts` takes all of it from the item's content).
  The art slide's figure is a strip of paintings, each linked to its page. A
  slide's address is its kind and slug (`#work-<slug>`, `#post-<slug>`, `#now`, `#art`); the
  first slide of a kind also answers the old home sections' addresses (`#work`,
  `#experience`, `#writing`).
- The bar: one cell per slide (number, kind, name), ruled like a title block, with
  previous and next in the last cell, in one row; from 768 to 1100 px, a bar of six
  slides or more takes rows of three.
- Without JavaScript, from 768 px, the slides stack as a list and the bar is in-page
  links. Under 768 px the slides are a row to swipe through (CSS scroll-snap, the next
  slide peeking at the edge), with or without JavaScript: the figures stacked would
  make the phone page very long, and a finger swipes sideways without catching the
  page's vertical scroll.
- The deck: where `DECK_QUERY` (`deckGeometry.ts`) matches, the stylesheet lays the
  same markup out as the deck from the first paint (the same query is written in `globals.css`; a test
  checks they match), and the component turns the links into tabs (`tablist`, `tab`,
  `tabpanel`, arrow keys, Home, End). Reduced motion keeps the deck; a tab switches at
  once instead of sliding.
- The page's vertical scroll and the deck are independent. The deck's view clips
  sideways (`overflow: hidden`, so no gesture scrolls it by itself and a vertical
  gesture over it, even with a little sideways drift, scrolls the page) and snaps to
  whole slides (`scroll-snap-type: x mandatory`). A tab slides it with a smooth
  scroll (instant with reduced motion). A gesture whose first move is mostly sideways
  is the deck's: a two-finger swipe or shift and the wheel (a wheel listener that
  cancels only those events, so the browser's back/forward swipe does not fire), or a
  finger (`touch-action: pan-y`, pointer events). The deck follows it, up to one
  slide, then goes on to the next slide once it has moved 48 px (`SWIPE_PX`), or
  back. The browser can still scroll it to show a focused link or a find-in-page match.
- Height: the deck is as tall as the slide showing, and between two it blends their
  heights in step with the slide (`heightAt`; from a tab, straight from the start's
  height to the target's), so what follows moves with the slide instead of jumping.
  The view itself keeps the tallest slide's height and is cut below the slide
  showing (`clip-path`, `--deck-cut`), with what follows pulled up by as much: the
  browser can then show a find-in-page match anywhere in any slide by scrolling the
  page. Before the code runs, the panels not marked `data-current` take no height, so
  the first paint is the same. After a swipe, if the deck's top is out of sight above,
  the page brings it into view; a tab or an address that names a slide does the same,
  and also when the deck starts low on the screen.
- The tab bar marks the slide showing, and the hash follows it with `replaceState`
  (no history entries). `/#work-twinteraction` opens with that slide showing and the deck in view.
- Every panel stays in the page (never hidden or inert): Tab walks from one slide
  into the next and the browser scrolls the deck to the focused link; find-in-page
  scrolls it to a match; a screen reader reads every slide.
- Nothing in a panel may be wider than the panel: `pnpm verify` checks every panel at
  768, 1024, 1280, 1440, 1920 and 2560 px wide (720 and 900 high) for a scrollWidth over its
  clientWidth, an element past its right edge, and a page that scrolls sideways.
- To check it in a browser: `pnpm verify` (step 6, and the per-slide screenshots).

## Hiding /toys

/toys is built by hand and not ready, so a Vercel production deploy hides it; `pnpm dev`,
a local build and a preview deploy show it. One function decides, `toysShown()` in
`src/ui/sections.ts`: true unless `VERCEL_ENV=production`.

- The running head and the footer list `shownSections()`, which leaves Toys out when
  it is hidden. Every sheet number comes from the same file: a sheet's number is its
  place among the sheets shown (`shownSheets()`: the sections, then /cv and
  /work-with-me), and a page writes its label as `sheetLabel("/art")`, never by hand.
  So with Toys hidden the head reads 01 Work, 02 Blog, 03 Art, 04 About, the labels
  follow (CV 05, Work with me 06), and the paintings are 3.1, 3.2… (`plateNo` reads
  Art's number); with Toys shown, Toys is 03, Art 04 and the paintings 4.1, 4.2…
  `test/site.test.ts` checks both orders and that no route writes a number.
- `src/app/toys/layout.tsx` calls `notFound()` when it is hidden, so /toys and every
  /toys/<slug> are a 404 (with `noindex`); the pages under it are untouched.
- `test/toys-hidden.test.ts` checks both states: hidden, no link to /toys in the head or
  the footer, none in the sitemap, llms.txt or RSS, and the routes are a 404; shown, all
  there. When the toys get rows in the sitemap, llms.txt, the twins or the showcase,
  add them only when `toysShown()` (for the sitemap, llms.txt and RSS, that test
  fails until then).

To publish /toys: set `TOYS_PUBLIC = true` in `src/ui/sections.ts`.

## Measurement

`src/ui/TrackContacts.tsx` listens for clicks on links and sends the contact events
through `@vercel/analytics` `track` (no cookies): `contact_email` (a mailto to the
site's email), `cv_open` (/cv), `cv_download` (a PDF under /cv), `outbound_linkedin`,
`outbound_github` (his profiles), and whatever a link names in `data-track`
(`door_hiring`, `door_contract`). Links stay plain links; with JavaScript off they work
and nothing is sent. Links to `/cv` and `/work-with-me` use `prefetch={false}`.
