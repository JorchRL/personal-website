# jrlgs.dev

Jorge Romero's personal site. Its job: get him contacted about remote software
engineering roles (ideally game development) and contract work. The home page is a
document of numbered sections (each a widget); work, blog and about are one click
away on any device. Under the first screen, 01 Showcase is a deck of slides, one at a
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
   95 or more on the home page and a long post (`pnpm verify`), and no TODO left.
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
pnpm cv:pdf   # after pnpm build: print /cv to public/cv.pdf (or: pnpm cv:pdf <url of a
              # running server>); run it on a Mac, and after every change to the CV's content
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
`content/site.ts` (the title is the role line without its full stop; the availability
line, under it; contact details; what he is looking for) and the hiring terms in
`content/hire.ts` (his English is the CV's "Languages" line). Each entry's id is its
work page's slug (`/cv#twinteraction`), and a work page's CV button opens it. `scripts/cv-pdf.mjs`
prints the page with Playwright: its print styles (`src/app/cv/cv.css`) set one column,
black on white, in Arial (Chromium writes the site's variable font into a PDF as Type 3
glyphs, which text extractors and applicant tracking systems read badly), the contact
details in the body, no running header or footer, Letter size, TODO marks visible.
Before printing, it makes every site link absolute to the page's canonical origin
(`https://jrlgs.dev`), so the PDF's links work whichever server printed it; a test fails
on `localhost` or `127.0.0.1` in the PDF's text or links (`pdfLinks` in `test/pdf-text.ts`).
Printed punctuation between a label and its value is real text (`Sep` in
`src/app/cv/page.tsx`, hidden on screen), and list dashes are inline, so extracted
text reads "Email: …", "Main engineer, Dimensione3" and "– Outcome" in order (check
with `pdftotext public/cv.pdf -`).
The page prints a hash of the CV (`rev. …`); `test/pages.test.ts` reads the PDF's text
back (`test/pdf-text.ts`) and fails while that hash is old, while the PDF is over 2.5 MB,
or when its text lacks the name, the contact details or an entry. So after editing
the CV's content, a work page's frontmatter, `site.ts`, `home.ts` or `hire.ts`:
`pnpm build && pnpm cv:pdf`,
then commit `public/cv.pdf` with the change.

## Map

```
content/            Everything Jorge writes. The only place facts live.
  site.ts           The core facts, each written once: name, URL, the role line, the
                    proof line, what he is open to, the availability line, what he is
                    looking for, city, location, time zone, the intro (meta
                    description, built from the others), email, social links. Every
                    page, the CV and PDF, JSON-LD and the machine forms read them from
                    here; test/core-facts.test.ts fails on a copy elsewhere. In
                    about.md, write one as {{site.lookingFor}} (src/content/pages.ts).
  home.ts           The home page's words: the two doors' titles and the clients'
                    line, the contact notes.
  showcase.ts       The home page's showcase: its slides in order, each naming a work
                    page, a post or the Now list, with an optional tab name and
                    one-line note. A name that names nothing fails the build.
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
                    schema.ts, pages.ts, skills.ts, cv.ts), todos.ts, slug.ts (heading
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
                    images (fonts in src/seo/fonts/). Twins are served at
                    /blog/<slug>.md and /work/<slug>.md by src/app/md/ via a rewrite
                    in next.config.ts, which also redirects the old site's
                    /projects pages to /work; /cv.md, /work-with-me.md and
                    /about.md have their own routes (src/app/<page>.md/).
src/widgets/        The home document: one folder per widget (intro, showcase, doors,
                    contact), the registry, Grid (the cells, numbered), showcase (01
                    Showcase: its slides, from content/showcase.ts) and Deck (slides
                    under a tab bar, in a sideways scroller; its numbers in
                    deckGeometry.ts).
scripts/            check.mjs (pnpm check), todo-report.mjs (pnpm todos),
                    verify.mjs (pnpm verify; lib/edge-clip.mjs, its wide-screen check),
                    cv-pdf.mjs (pnpm cv:pdf) and one-off scripts.
public/cv.pdf       The CV as a PDF, printed from /cv by pnpm cv:pdf. Never edit by hand.
test/               vitest: content checks, the widget registry and the sitemap,
                    LiveSlot (jsdom), the showcase (its items, its HTML, its tabs in
                    jsdom), the CV, /about and /work-with-me with their machine forms
                    and the PDF, MDX posts (test/mdx.test.ts; its sample post is
                    test/fixtures/mdx/blog/, never published), drafts
                    (test/drafts.test.ts), the guided-building post's figures
                    (test/guided-post.test.ts) and the wide-screen rule
                    (test/edge-clip.test.ts).
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
  `layout.tsx`. Open Graph images use the same faces from `src/seo/fonts/`.
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
  and an Open link to its page (`items.ts` takes all of it from the item's content). A
  slide's address is its kind and slug (`#work-<slug>`, `#post-<slug>`, `#now`); the
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

## Measurement

`src/ui/TrackContacts.tsx` listens for clicks on links and sends the contact events
through `@vercel/analytics` `track` (no cookies): `contact_email` (a mailto to the
site's email), `cv_open` (/cv), `cv_download` (a PDF under /cv), `outbound_linkedin`,
`outbound_github` (his profiles), and whatever a link names in `data-track`
(`door_hiring`, `door_contract`). Links stay plain links; with JavaScript off they work
and nothing is sent. Links to `/cv` and `/work-with-me` use `prefetch={false}`.
