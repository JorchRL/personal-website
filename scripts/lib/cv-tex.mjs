// The CV as a LaTeX document, made from getCv() (src/content/cv.ts): what
// pnpm cv:pdf compiles into public/cv.pdf with Tectonic. Nothing here is a fact
// about Jorge; it is only the layout, and every word comes from the CV object.
//
// The layout is a classic one-page résumé, set for applicant tracking systems:
// Letter, 11 pt Latin Modern, one column, section titles over a rule, each
// company once with its role and dates under it, two-line bullets with key
// facts in bold (`**…**` in content/cv.ts), skills as "Group: items" lines.
// Every glyph has a Unicode mapping (XeTeX writes a ToUnicode map for each
// OpenType font), the bullets are U+2022, and contact links are plain text
// joined by " | ", so the text extracts in reading order.

import { matchTodos } from "../../src/content/todos.ts";

/** Bullets read best at 150 to 215 characters: two full lines at this text width. */
export const BULLET_WINDOW = { min: 150, max: 215 };

const SPECIAL = { "\\": "\\textbackslash{}", "{": "\\{", "}": "\\}", $: "\\$", "&": "\\&", "#": "\\#", "^": "\\^{}", _: "\\_", "%": "\\%", "~": "\\textasciitilde{}" };

/** Plain text, escaped for LaTeX. */
export function esc(text) {
  return text.replace(/[\\{}$&#^_%~]/g, (c) => SPECIAL[c]);
}

/** A content string: `**…**` set in bold, each TODO(jorge) marked. */
export function rich(text) {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => (i % 2 ? `\\textbf{${todos(part)}}` : todos(part)))
    .join("");
}

function todos(text) {
  let out = "";
  let at = 0;
  for (const { index, text: todo } of matchTodos(text)) {
    out += esc(text.slice(at, index)) + `\\todo{${esc(todo)}}`;
    at = index + todo.length;
  }
  return out + esc(text.slice(at));
}

/** A bullet's length as read: without its `**` marks. */
export function bulletLength(text) {
  return text.replace(/\*\*/g, "").length;
}

/** The bullets outside BULLET_WINDOW, for pnpm cv:pdf to list. */
export function bulletsOutsideWindow(cv) {
  return [...cv.experience, ...cv.projects].flatMap((entry) =>
    entry.outcomes
      .map((text) => ({ entry: entry.id, text, length: bulletLength(text) }))
      .filter(({ length }) => length < BULLET_WINDOW.min || length > BULLET_WINDOW.max),
  );
}

const PREAMBLE = String.raw`\documentclass[letterpaper,11pt]{article}

% XeTeX (Tectonic): Latin Modern as OpenType, so every glyph carries its Unicode
% value. Ligatures off: "fi" stays two letters and an apostrophe stays the one
% in the content, so the text extracts exactly as written.
\usepackage{fontspec}
\setmainfont{lmroman10-regular.otf}[
  BoldFont=lmroman10-bold.otf, ItalicFont=lmroman10-italic.otf,
  BoldItalicFont=lmroman10-bolditalic.otf, SmallCapsFont=lmromancaps10-regular.otf,
  Ligatures={NoCommon,TeXOff}]

\usepackage[letterpaper, top=0.3in, bottom=0.3in, left=0.4in, right=0.4in, footskip=12pt]{geometry}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage[colorlinks=true]{hyperref}

\definecolor{linkcolor}{HTML}{0099ff}
\urlstyle{same}

% No header; the footer (the CV's revision) sits in the bottom margin.
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\raggedbottom
\raggedright
\setlength{\parindent}{0pt}
\setlength{\tabcolsep}{0pt}

% Section titles: bold, large, over a rule.
\titleformat{\section}{\large\bfseries\raggedright}{}{0pt}{}[\titlerule]
\titlespacing*{\section}{0pt}{8pt}{4pt}

% Vertical rhythm, tuned so the CV fits one page: bullets are 10 pt text on
% 12.5pt leading, 3pt apart; entries 6pt apart; a role sits 4 pt
% under its company.
\newlength{\entrySep}\setlength{\entrySep}{6pt}
\newlength{\roleSep}\setlength{\roleSep}{4pt}
\newlength{\bulletLeading}\setlength{\bulletLeading}{12.5pt}
\newlength{\bulletSep}\setlength{\bulletSep}{3pt}
\newlength{\bulletTop}\setlength{\bulletTop}{2pt}
\newlength{\skillSep}\setlength{\skillSep}{2pt}

% A link shown as its own text, underlined (contact details, work pages).
\newcommand{\contact}[2]{\href{#1}{\underline{#2}}}
% A link that keeps the text's colour (an entry's name, linked to its work page).
\newcommand{\entrylink}[2]{{\hypersetup{urlcolor=black}\href{#1}{#2}}}
% A missing fact, marked as on the page.
\newcommand{\todo}[1]{\textcolor{red}{\textbf{#1}}}
% Separator between contact links: real text, so it extracts as " | ".
\newcommand{\sep}{\ \textbar\ }

\newcommand{\resumeSubHeadingListStart}{%
  \begin{itemize}[leftmargin=0pt, label={}, topsep=0pt, partopsep=0pt,
                  parsep=0pt, itemsep=\entrySep]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}

% Bullet lists: a text bullet (U+2022), 2.2em indent.
\newcommand{\resumeItemListStart}{%
  \begin{itemize}[label=\textbullet, leftmargin=2.2em, topsep=\bulletTop,
                  partopsep=0pt, parsep=0pt, itemsep=\bulletSep]%
  \small\setlength{\baselineskip}{\bulletLeading}}
\newcommand{\resumeItemListEnd}{\end{itemize}}
\newcommand{\resumeItem}[1]{\item #1}

% A company, once: its name, and its location on the right. An optional context
% line in italics (the app the work was on) has nothing beside it: a date there
% makes ATS parsers read it as a job title. Its roles stack under it, each with
% its own dates.
\newcommand{\resumeCompany}[2]{%
  \item
  \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{#1} & \textbf{\small #2} \\
  \end{tabular*}%
  \vspace{\dimexpr\roleSep-\entrySep\relax}}
\newcommand{\resumeContext}[1]{\par\textit{\small #1}}

\newcommand{\resumeRole}[2]{%
  \item
  \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{\small #1} & \textit{\small #2} \\
  \end{tabular*}}

% A project: name | role, stack (wraps if long), dates on the right.
\newcommand{\resumeProjectHeading}[3]{%
  \item \small\textbf{#1}\sep\textit{#2}\hfill\textbf{#3}}

\newcommand{\resumeSkillsStart}{%
  \begin{itemize}[leftmargin=0.15in, label={}, topsep=0pt, partopsep=0pt,
                  parsep=0pt, itemsep=\skillSep]\small}
\newcommand{\resumeSkillsEnd}{\end{itemize}}
\newcommand{\resumeSkill}[2]{\item \textbf{#1}: #2}
`;

/**
 * The CV as a LaTeX document.
 * @param {import("../../src/content/cv.ts").Cv} cv
 * @param {string} site the live site's origin, e.g. https://jrlgs.dev
 */
export function cvTex(cv, site) {
  const c = cv.contact;
  const abs = (href) => `${site}${href}`;
  const bullets = (items) =>
    ["    \\resumeItemListStart", ...items.map((o) => `      \\resumeItem{${rich(o)}}`), "    \\resumeItemListEnd"].join("\n");

  const experience = cv.experience
    .map((job) =>
      [
        `  \\resumeCompany{\\entrylink{${abs(job.href)}}{${esc(job.company)}}}{${rich(job.location ?? "")}}${job.context ? `\\resumeContext{${rich(job.context)}}` : ""}`,
        `  \\resumeRole{${rich(job.title)}}{${rich(job.dates)}}`,
        bullets(job.outcomes),
      ].join("\n"),
    )
    .join("\n");

  const projects = cv.projects
    .map((p) =>
      [
        `  \\resumeProjectHeading{\\entrylink{${abs(p.href)}}{${esc(p.name)}}}{${rich(p.role)}; ${rich(p.stack.join(", "))}}{${rich(p.dates)}}`,
        bullets(p.outcomes),
      ].join("\n"),
    )
    .join("\n");

  const pairs = (rows) => ["\\resumeSkillsStart", ...rows.map(([k, v]) => `  \\resumeSkill{${esc(k)}}{${rich(v)}}`), "\\resumeSkillsEnd"].join("\n");

  return `% Generated by scripts/cv-pdf.mjs from getCv() (content/cv.ts and the facts it
% joins). Do not edit: change the content and run pnpm cv:pdf.
${PREAMBLE}
\\hypersetup{urlcolor=linkcolor, linkcolor=linkcolor, pdftitle={${esc(cv.name)}, CV}, pdfauthor={${esc(cv.name)}}}

\\begin{document}

\\begin{center}
  {\\Huge\\scshape ${esc(cv.name)}} \\\\ \\vspace{3pt}
  {\\scshape ${rich(cv.title)}} \\\\ \\vspace{2pt}
  \\small ${rich(cv.availability)} \\\\ \\vspace{2pt}
  \\small \\contact{mailto:${c.email}}{${esc(c.email)}}\\sep\\contact{https://${c.site}}{${esc(c.site)}}\\sep\\contact{https://${c.linkedin}}{${esc(c.linkedin)}}\\sep\\contact{https://${c.github}}{${esc(c.github)}}
\\end{center}

\\section{Experience}
\\resumeSubHeadingListStart
${experience}
\\resumeSubHeadingListEnd

\\section{Projects}
\\resumeSubHeadingListStart
${projects}
\\resumeSubHeadingListEnd

\\section{Technical Skills}

${pairs([...cv.skills.map((s) => [s.group, s.items]), ["Languages", cv.hire.english]])}

\\fancyfoot[R]{\\scriptsize\\color{gray} ${esc(c.site)}/cv \\textperiodcentered{} rev. ${esc(cv.rev)}}

\\end{document}
`;
}
