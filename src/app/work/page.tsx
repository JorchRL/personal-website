import Link from "next/link";
import { getAllWork } from "@/content/work";
import { TodoText } from "@/content/TodoText";
import { pageMetadata } from "@/seo/metadata";
import { Closing } from "@/ui/Closing";
import { PageHead } from "@/ui/PageHead";
import { sheetLabel } from "@/ui/sections";

export const metadata = pageMetadata({
  title: "Work",
  description:
    "Projects Jorge Romero worked on as an engineer and tech lead, and the game and engine he is building now.",
  path: "/work",
});

export default function WorkIndex() {
  const work = getAllWork();
  return (
    <>
      <PageHead
        label={sheetLabel("/work")}
        status={`${work.length} projects`}
        title="Work"
        lead="Projects I worked on as an engineer and tech lead, and the game and engine I am building now."
      />

      <section className="sec bare" aria-label="Projects">
        <div className="work-cols cols label" aria-hidden="true">
          <span>No.</span>
          <span>Project</span>
          <span>Role</span>
          <span>Period</span>
          <span>What it is</span>
        </div>
        <ol className="rows work">
          {work.map((w, i) => (
            <li key={w.slug}>
              <Link href={`/work/${w.slug}`}>
                <span className="n">1.{i + 1}</span>
                <span className="t">
                  <TodoText text={w.title} />
                </span>
                <span className="r">
                  <TodoText text={w.role} />
                </span>
                <span className="p">
                  <TodoText text={w.period} />
                </span>
                <span className="d">
                  <TodoText text={w.description} />
                </span>
                <span className="s mono">
                  {w.stack.map((item, j) => (
                    <span key={item}>
                      {j > 0 && " · "}
                      <TodoText text={item} />
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="article-end">
        <Closing label="Who built these" />
      </div>
    </>
  );
}
