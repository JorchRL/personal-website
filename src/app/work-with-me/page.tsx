// /work-with-me: the page for contract clients. Words from
// content/work-with-me.ts and content/hire.ts; who he is (the role and proof
// lines) and his availability from content/site.ts.

import Link from "next/link";
import { hire } from "@content/hire";
import { home } from "@content/home";
import { site } from "@content/site";
import { workWithMe } from "@content/work-with-me";
import { TodoText } from "@/content/TodoText";
import { breadcrumbJsonLd } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";
import { JsonLd } from "@/ui/JsonLd";
import { PageHead } from "@/ui/PageHead";
import { sheetLabel } from "@/ui/sections";
import { profiles } from "@/ui/Profiles";
import { SectionHead, sub } from "@/ui/SectionHead";
import "./work-with-me.css";

export const metadata = pageMetadata({
  title: "Work with me",
  description:
    "Contract work with Jorge Romero: web apps, real-time 3D on the web, and tools for game teams. Invoicing in USD, or through your employer of record.",
  path: "/work-with-me",
  markdown: "/work-with-me.md",
});

const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Contract work")}`;

export default function WorkWithMePage() {
  return (
    <article className="wwm">
      <JsonLd data={breadcrumbJsonLd([{ name: "Work with me", path: "/work-with-me" }])} />
      <PageHead
        label={sheetLabel("/work-with-me")}
        status={<span className="status">{site.availability}</span>}
        title="Work with me"
        lead={`${site.role} ${workWithMe.lead}`}
        side={
          <p>
            {hire.timeZone}
            <br />
            Invoices in USD
          </p>
        }
      />
      <div className="wwm-actions grid">
        <p className="proof wwm-proof">{site.proof}</p>
        <p className="wwm-buttons">
          <a className="btn btn-primary" href={mailto}>
            Email me <span className="k" aria-hidden="true">→</span>
          </a>
          <Link className="btn" href="/cv" prefetch={false}>
            CV <span className="k" aria-hidden="true">↗</span>
          </Link>
        </p>
      </div>

      <section className="sec" aria-labelledby="h-offers">
        <SectionHead no="01" id="offers" title="What I take on" />
        <ol className="wwm-offers">
          {workWithMe.offers.map((offer, i) => (
            <li key={offer.title}>
              <span className="n">{sub("01", i)}</span>
              <h3>{offer.title}</h3>
              <p>{offer.text}</p>
              <Link className="more" href={offer.proof.href}>
                {offer.proof.label}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec" aria-labelledby="h-terms">
        <SectionHead no="02" id="terms" title="How it works" />
        <dl className="wwm-terms">
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
            <dt>Hours</dt>
            <dd>
              <TodoText text={workWithMe.hours} />
            </dd>
          </div>
          <div>
            <dt>Rates</dt>
            <dd>{workWithMe.rates}</dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>
              <TodoText text={hire.english} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="sec" aria-labelledby="h-start">
        <SectionHead no="03" id="start" title="How to start" />
        <ol className="wwm-steps">
          {workWithMe.steps.map((step, i) => (
            <li key={step}>
              <span className="n">{i + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec" aria-labelledby="h-write">
        <SectionHead no="04" id="write" title="Write to me" />
        <a className="big-mail" href={mailto}>
          {site.email}
        </a>
        <div className="contact-row grid">
          <div className="ask">
            <p>{workWithMe.steps[0]}</p>
            <p className="reply">{home.reply}</p>
          </div>
          <ul aria-label="Profiles">
            {profiles.map((p) => (
              <li key={p.label}>
                <a href={p.href} rel="me">
                  <b>{p.label}</b>
                  <span className="mono">{p.handle} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
