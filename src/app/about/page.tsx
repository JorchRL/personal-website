// /about: who Jorge is (content/about.md), then the roles he fits at a game
// studio, the skills table, why games, and how to hire him
// (content/about.ts, content/hire.ts).

import Link from "next/link";
import { studioRoles, studioRolesNote, whyGames } from "@content/about";
import { hire } from "@content/hire";
import { home } from "@content/home";
import { site } from "@content/site";
import { getAbout } from "@/content/pages";
import { getSkills } from "@/content/skills";
import { getAllWork } from "@/content/work";
import { Markdown } from "@/content/Markdown";
import { TodoText } from "@/content/TodoText";
import { profilePageJsonLd } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";
import { JsonLd } from "@/ui/JsonLd";
import { PageHead } from "@/ui/PageHead";
import { sheetLabel } from "@/ui/sections";
import { Profiles } from "@/ui/Profiles";
import { Prose } from "@/ui/Prose";
import { SectionHead, sub } from "@/ui/SectionHead";
import { roleId } from "@/ui/roles";
import "./about.css";

export const metadata = pageMetadata({
  title: "About",
  description: site.intro,
  path: "/about",
  markdown: "/about.md",
});

export default function AboutPage() {
  const titles = new Map(getAllWork().map((w) => [`/work/${w.slug}`, w.title]));
  const skills = getSkills();
  return (
    <div className="about">
      <JsonLd data={profilePageJsonLd()} />
      <PageHead
        label={sheetLabel("/about")}
        status={<span className="status">{site.availability}</span>}
        title="About"
        lead={site.roles}
      />
      <div className="article-body grid">
        <aside className="margin mono" aria-label="Facts">
          <dl>
            <dt>Name</dt>
            <dd>{site.name}</dd>
            <dt>Based</dt>
            <dd>{site.location}</dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </dd>
            <dt>CV</dt>
            <dd>
              <Link href="/cv" prefetch={false}>
                Page
              </Link>{" "}
              · <a href="/cv.pdf">PDF</a>
            </dd>
          </dl>
        </aside>
        <Prose className="prose-lead">
          <Markdown source={getAbout()} />
        </Prose>
      </div>

      <section className="sec" aria-labelledby="h-roles">
        <SectionHead no="01" id="roles" title="Roles I fit at a studio" note={studioRolesNote} />
        <ol className="ab-roles">
          {studioRoles.map((r, i) => (
            <li key={r.role} id={roleId(r.role)}>
              <span className="n">{sub("01", i)}</span>
              <h3>{r.role}</h3>
              <p>{r.proof}</p>
              <Link className="more" href={r.href}>
                {titles.get(r.href.split("#")[0]) ?? "See it"}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec" aria-labelledby="h-skills">
        <SectionHead
          no="02"
          id="skills"
          title="Skills"
          note="Each with what I used it for, when I last did, and how deep it goes."
        />
        <table className="ab-skills">
          <thead>
            <tr>
              <th scope="col">Skill</th>
              <th scope="col">What I used it for</th>
              <th scope="col">Last used</th>
              <th scope="col">Depth</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.skill}>
                <th scope="row">
                  <TodoText text={s.skill} />
                </th>
                <td data-label="Used for">
                  {s.href ? (
                    <Link href={s.href}>
                      <TodoText text={s.usedFor} />
                    </Link>
                  ) : (
                    <TodoText text={s.usedFor} />
                  )}
                </td>
                <td data-label="Last used" className="mono">
                  <TodoText text={s.lastUsed} />
                </td>
                <td data-label="Depth">
                  <TodoText text={s.depth} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sec" aria-labelledby="h-why">
        <SectionHead no="03" id="why" title="Why games" />
        <p className="ab-why">
          <TodoText text={whyGames} />
        </p>
      </section>

      <section className="sec" aria-labelledby="h-hire">
        <SectionHead no="04" id="hire" title="How to hire me" />
        <dl className="ab-hire">
          <div>
            <dt>Contract</dt>
            <dd>{hire.route}</dd>
          </div>
          <div>
            <dt>Time zone</dt>
            <dd>
              {hire.timeZone} {hire.overlap}
            </dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>
              <TodoText text={hire.english} />
            </dd>
          </div>
          <div>
            <dt>Write to</dt>
            <dd>
              <a className="ab-mail" href={`mailto:${site.email}`}>
                {site.email}
              </a>{" "}
              <span className="ab-include">{home.include}</span>
            </dd>
          </div>
        </dl>
        <div className="ab-end grid">
          <p className="ab-actions">
            <a className="btn btn-primary" href={`mailto:${site.email}`}>
              Email me <span className="k" aria-hidden="true">→</span>
            </a>
            <Link className="btn" href="/cv" prefetch={false}>
              CV <span className="k" aria-hidden="true">↗</span>
            </Link>
            <Link className="btn" href="/work-with-me" prefetch={false}>
              Contract work <span className="k" aria-hidden="true">↗</span>
            </Link>
          </p>
          <div className="ab-profiles">
            <Profiles />
          </div>
        </div>
      </section>
    </div>
  );
}
