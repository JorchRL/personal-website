// Small pieces the three diagrams share: text with `code`, the "who" chip,
// a simplified example, and the dial drawing. No hooks and no "use client":
// the faces render them on the server, the live parts in the browser.

import type { ReactNode } from "react";
import { WHO_NAME, type Example, type SettingId, type Who } from "./data";

/** Text with `code` marks. */
export function Inline({ text }: { text: string }): ReactNode {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 1 ? <code key={i}>{part.slice(1, -1)}</code> : part,
      )}
    </>
  );
}

/** Who does a stage: me (solid), the AI (outlined), or both. */
export function Chip({ who }: { who: Who }) {
  return (
    <span className="gb-chip" data-who={who}>
      {WHO_NAME[who]}
    </span>
  );
}

/** A tiny example, always labelled as simplified. */
export function ExampleBox({ example }: { example: Example }) {
  return (
    <figure className="gb-example">
      <figcaption className="gb-ex-label">{example.label}</figcaption>
      {example.code ? (
        <pre tabIndex={0} role="group" aria-label={example.label}>
          <code>
            {example.lines.map((line, i) => {
              const last = i === example.lines.length - 1;
              const mark = last && example.mark && line.endsWith(example.mark);
              return (
                <span key={i}>
                  {mark ? line.slice(0, -example.mark!.length) : line}
                  {mark && <mark className="gb-mark">{example.mark}</mark>}
                  {"\n"}
                </span>
              );
            })}
          </code>
        </pre>
      ) : (
        <div className="gb-ex-lines">
          {example.lines.map((line, i) => (
            <p key={i}>
              <Inline text={line} />
            </p>
          ))}
        </div>
      )}
      {example.remark && (
        <p className="gb-ex-remark">
          <Inline text={example.remark} />
        </p>
      )}
    </figure>
  );
}

/** Where each setting's detent sits, in degrees clockwise from the top. */
const DETENTS: Record<SettingId, number> = { hand: -70, "for-me": -20, agent: 60 };
const CX = 60;
const CY = 60;

function polar(deg: number, r: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)].map((n) => Math.round(n * 10) / 10) as [number, number];
}

function arc(from: number, to: number, r: number) {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
}

/** A rotary dial: two detents per brief, one per project (dashed), the pointer on the setting chosen. */
export function DialDrawing({ setting }: { setting: SettingId }) {
  return (
    <svg className="gb-dial" viewBox="0 0 120 120" aria-hidden="true">
      <path className="gb-dial-arc" d={arc(-85, -5, 44)} />
      <path className="gb-dial-arc project" d={arc(45, 75, 44)} />
      {(Object.keys(DETENTS) as SettingId[]).map((id, i) => {
        const [x1, y1] = polar(DETENTS[id], 39);
        const [x2, y2] = polar(DETENTS[id], 50);
        const [tx, ty] = polar(DETENTS[id], 57);
        return (
          <g key={id} className="gb-detent" data-on={id === setting ? "" : undefined}>
            <path d={`M${x1} ${y1} L${x2} ${y2}`} />
            <text x={tx} y={ty + 3.5} textAnchor="middle">
              {i + 1}
            </text>
          </g>
        );
      })}
      <circle className="gb-knob" cx={CX} cy={CY} r="28" />
      <g className="gb-pointer" style={{ transform: `rotate(${DETENTS[setting]}deg)` }}>
        <path d={`M${CX} ${CY} V${CY - 32}`} />
        <circle cx={CX} cy={CY - 32} r="3" />
      </g>
      <circle className="gb-hub" cx={CX} cy={CY} r="3.5" />
    </svg>
  );
}
