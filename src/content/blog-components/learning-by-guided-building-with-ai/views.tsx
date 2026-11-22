// The three diagrams' markup, shared by their faces (no state: the diagram
// plus every stage, level or setting written out, as a reader without
// JavaScript sees it) and their live parts (one highlighted at a time, with
// its words). No hooks and no "use client": the faces render this on the server.

import type { ReactNode } from "react";
import { dial, loop, scaffold, SUPPORTS, type LevelId, type SettingId, type StageId } from "./data";
import { Chip, DialDrawing, ExampleBox, Inline } from "./parts";

const Credit = ({ children }: { children: ReactNode }) => <p className="gb-credit">{children}</p>;

/* ------------------------------------------------------------------ */
/* Fig. 1: the loop                                                    */
/* ------------------------------------------------------------------ */

type Stage = (typeof loop.stages)[number];

function StageDetail({ stage, n }: { stage: Stage; n: number }) {
  return (
    <div className="gb-detail" data-has-example={stage.example ? "" : undefined}>
      <div className="gb-detail-text">
        <p className="gb-detail-head">
          <span className="gb-n">{n}</span> {stage.name} <Chip who={stage.who} />
        </p>
        <p>{stage.text}</p>
      </div>
      {stage.example && <ExampleBox example={stage.example} />}
    </div>
  );
}

export function LoopView({
  stage,
  onStage,
  controls,
}: {
  stage?: StageId;
  onStage?: (id: StageId) => void;
  controls?: ReactNode;
}) {
  const live = !!stage;
  const at = live ? loop.stages.findIndex((s) => s.id === stage) : -1;
  return (
    <div className="gb gb-loop" data-stage={stage ?? "all"}>
      <ol className="gb-track" aria-label="The loop, in order">
        {loop.stages.map((s, i) => {
          const inner = (
            <>
              <span className="gb-n">{i + 1}</span>
              <span className="gb-node-name">{s.name}</span>
              <Chip who={s.who} />
              {s.optional && <span className="gb-optional">optional</span>}
              {s.id === "review" && <span className="gb-sr"> Then back to step 3 for the next brief.</span>}
            </>
          );
          return (
            <li key={s.id} className="gb-node-cell" data-on={i === at ? "" : undefined}>
              {onStage ? (
                <button type="button" className="gb-node" aria-current={i === at ? "step" : undefined} onClick={() => onStage(s.id)}>
                  {inner}
                </button>
              ) : (
                <span className="gb-node">{inner}</span>
              )}
            </li>
          );
        })}
        <li className="gb-return" aria-hidden="true">
          <span>{loop.back}</span>
        </li>
      </ol>

      {live ? (
        <>
          <div aria-live="polite">
            <StageDetail stage={loop.stages[at]} n={at + 1} />
          </div>
          {controls}
        </>
      ) : (
        <div className="gb-details">
          {loop.stages.map((s, i) => (
            <StageDetail key={s.id} stage={s} n={i + 1} />
          ))}
        </div>
      )}
      <Credit>{loop.credit}</Credit>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 2: the scaffold comes down                                     */
/* ------------------------------------------------------------------ */

type Level = (typeof scaffold.levels)[number];

function LevelColumn({ level }: { level: Level }) {
  return (
    <>
      <span className="gb-col-name">{level.name}</span>
      <span className={`gb-col-status${level.reached ? " status" : ""}`}>{level.status}</span>
      <span className="gb-stack">
        {SUPPORTS.map((s) => {
          const has = level.gives.includes(s);
          return (
            <span key={s} className="gb-bar" data-has={has ? "" : undefined}>
              {has ? (
                s
              ) : (
                <>
                  <span aria-hidden="true">{s}</span>
                  <span className="gb-sr">{s}: not given</span>
                </>
              )}
            </span>
          );
        })}
      </span>
      <span className="gb-col-who">{level.who}</span>
    </>
  );
}

export function ScaffoldView({ level, onLevel, name }: { level?: LevelId; onLevel?: (id: LevelId) => void; name?: string }) {
  const live = !!level;
  const chosen = scaffold.levels.find((l) => l.id === level);
  return (
    <div className="gb gb-fade" data-level={level ?? "all"}>
      <p className="gb-lead">
        <Inline text={scaffold.step} />
      </p>
      {onLevel ? (
        <fieldset className="gb-levels">
          <legend className="gb-sr">Guidance level</legend>
          {scaffold.levels.map((l) => (
            <label key={l.id} className="gb-col" data-on={l.id === level ? "" : undefined} data-reached={l.reached ? "" : undefined}>
              <input type="radio" name={name} value={l.id} checked={l.id === level} onChange={() => onLevel(l.id)} />
              <LevelColumn level={l} />
            </label>
          ))}
        </fieldset>
      ) : (
        <ol className="gb-levels">
          {scaffold.levels.map((l) => (
            <li key={l.id} className="gb-col" data-reached={l.reached ? "" : undefined}>
              <LevelColumn level={l} />
            </li>
          ))}
        </ol>
      )}
      <p className="gb-axis" aria-hidden="true">
        <span>more support</span>
        <span>skill grows →</span>
        <span>less support</span>
      </p>
      {live ? (
        <p className="gb-say" aria-live="polite">
          <b>{chosen!.name}.</b> {chosen!.text}
        </p>
      ) : (
        <ul className="gb-says">
          {scaffold.levels.map((l) => (
            <li key={l.id} className="gb-say">
              <b>{l.name}.</b> {l.text} ({l.status}.)
            </li>
          ))}
        </ul>
      )}
      <Credit>{scaffold.credit}</Credit>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 3: the dial                                                    */
/* ------------------------------------------------------------------ */

export function DialView({ setting, onSetting, name }: { setting?: SettingId; onSetting?: (id: SettingId) => void; name?: string }) {
  const live = !!setting;
  const chosen = dial.settings.find((s) => s.id === setting);
  return (
    <div className="gb gb-dialfig" data-setting={setting ?? "all"}>
      <div className="gb-dial-wrap">
        <DialDrawing setting={setting ?? "hand"} />
        <table className="gb-matrix">
          <caption className="gb-sr">Who types and who reviews, for each setting</caption>
          <thead>
            <tr>
              <td />
              {dial.settings.map((s) => (
                <th key={s.id} scope="col" data-on={s.id === setting ? "" : undefined}>
                  {onSetting ? (
                    <label className="gb-set">
                      <input type="radio" name={name} value={s.id} checked={s.id === setting} onChange={() => onSetting(s.id)} />
                      <span className="gb-set-name">{s.name}</span>
                      <span className="gb-set-scope">{s.scope}</span>
                    </label>
                  ) : (
                    <span className="gb-set">
                      <span className="gb-set-name">{s.name}</span>
                      <span className="gb-set-scope">{s.scope}</span>
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(["types", "reviews"] as const).map((row) => (
              <tr key={row}>
                <th scope="row">{dial.rows[row]}</th>
                {dial.settings.map((s) => (
                  <td key={s.id} data-on={s.id === setting ? "" : undefined}>
                    {s[row] ? <Chip who={s[row]!} /> : <span className="gb-blank" role="img" aria-label="not defined in the method" />}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">{dial.rows.then}</th>
              {dial.settings.map((s) => (
                <td key={s.id} className="gb-then" data-on={s.id === setting ? "" : undefined}>
                  {s.then ?? ""}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {live ? (
        <p className="gb-say" aria-live="polite">
          <b>{chosen!.name}.</b> {chosen!.text}
        </p>
      ) : (
        <ul className="gb-says">
          {dial.settings.map((s) => (
            <li key={s.id} className="gb-say">
              <b>{s.name}</b> ({s.scope}). {s.text}
            </li>
          ))}
        </ul>
      )}
      <Credit>{dial.credit}</Credit>
    </div>
  );
}
