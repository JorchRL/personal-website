"use client";

// The close-up viewer, once the visitor turns an effect on (Inspect.tsx): a
// canvas over the painting's well, and the effect's controls under it. The
// Lamp and the Layers are the two prototypes ported as they were (./lamp/,
// ./diorama/); their controls are the prototypes' own, in the site's look.
// The canvas shows once the effect has drawn its first frame; until then, and
// if it fails, the picture is what shows.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { layerFiles, lampFile, pick, type Viewer } from "./maps";

export type Effect = "lamp" | "layers";

export type StageProps = {
  effect: Effect;
  viewer: Viewer;
  well: HTMLElement;
  bar: HTMLElement;
  onFail: (reason: string) => void;
};

// The well's own colour (read from its token: its background may be mid-transition).
const wellColour = (well: HTMLElement): [number, number, number] => {
  const hex = getComputedStyle(well).getPropertyValue("--paper-2").trim().match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  return hex ? (hex.slice(1).map((v) => parseInt(v, 16) / 255) as [number, number, number]) : [0.894, 0.91, 0.918];
};

const coarse = () => matchMedia("(pointer: coarse)").matches;

export default function Stage({ effect, viewer, well, bar, onFail }: StageProps) {
  const [status, setStatus] = useState(effect === "lamp" ? "reading the sheet…" : "loading layers…");

  useEffect(() => {
    const root = well.parentElement;
    const box = well.querySelector<HTMLElement>(".viewer-box");
    if (!root || !box) return;
    // A canvas of its own each time: a WebGL context belongs to its canvas, and
    // the last effect's must not be reused.
    const el = document.createElement("canvas");
    el.className = "viewer-canvas";
    el.dataset.effect = effect;
    el.setAttribute("aria-hidden", "true");
    well.insertBefore(el, box.nextSibling);
    let stopped = false;
    let engine: { destroy: () => void } | null = null;
    const picture = () => {
      const c = el.getBoundingClientRect(), p = box.getBoundingClientRect();
      return { x: p.left - c.left, y: p.top - c.top, width: p.width, height: p.height };
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onReady = () => {
      if (stopped) return;
      el.dataset.live = "";
      setStatus("");
    };
    (async () => {
      if (effect === "lamp") {
        const { startLamp } = await import("./lamp/lamp");
        // A phone gets the smaller scan: the estimate's float maps are large.
        const size = pick(viewer.lamp, coarse() ? 2048 : 3072);
        return startLamp(root, el, { url: lampFile(viewer, size.width), sheetMM: viewer.sheetMM, table: wellColour(well), picture, reduced, onReady });
      }
      const layers = viewer.layers!;
      const { startDiorama } = await import("./diorama/diorama");
      const size = pick(layers.sizes, coarse() ? 1536 : 3072);
      const files = layerFiles(viewer, size.width);
      return startDiorama(root, el, {
        ...files,
        heightSize: layers.height,
        depths: layers.cards.map((c) => c.depth),
        focus: layers.focus,
        picture,
        page: wellColour(well),
        reduced,
        onReady,
      });
    })().then(
      (e) => {
        if (stopped) e.destroy();
        else engine = e;
      },
      (error: unknown) => {
        if (stopped) return;
        const why = String(error);
        onFail(/WebGL2|EXT_color_buffer_float/.test(why) ? "This browser has no WebGL 2 with float targets, which the close-up needs." : "The close-up could not start here.");
        el.dataset.error = why.slice(0, 300);
      },
    );
    return () => {
      stopped = true;
      engine?.destroy();
      el.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect, viewer, well]);

  return (
    <>
      {effect === "lamp" && createPortal(<div className="lampmark" data-l="lamp" data-h="" hidden />, well)}
      {createPortal(effect === "lamp" ? <LampPanel status={status} /> : <LayersPanel status={status} />, bar)}
    </>
  );
}

function Seg({ name, label, children }: { name?: string; label: string; children: React.ReactNode }) {
  return (
    <span className="seg" role="group" aria-label={label} data-l={name}>
      {children}
    </span>
  );
}

/** The lamp prototype's panel: lamp, height, relief, view; then the keys and what is estimated, in one line. */
function LampPanel({ status }: { status: string }) {
  const keys = "move = lamp · wheel / pinch = zoom · double-click = fit · R raking · S soft · N cycle view";
  const estimated = "The paper\u2019s relief and normals are estimated from one flat scan, not measured.";
  return (
    <div className="inspect-panel" data-panel="lamp">
      <div className="inspect-ctls">
        <span className="ctl">
          <span className="label">Lamp</span>
          <Seg name="mode" label="Lamp">
            <button type="button" data-v="soft" aria-pressed="true">Soft</button>
            <button type="button" data-v="raking" aria-pressed="false">Raking</button>
          </Seg>
        </span>
        <label className="ctl">
          <span className="label">Height</span>
          <input type="range" data-l="height" min="4" max="400" step="1" defaultValue="160" />
          <span className="val mono" data-l="heightVal" />
        </label>
        <label className="ctl">
          <span className="label">Relief</span>
          <input type="range" data-l="relief" min="0" max="4" step="0.05" defaultValue="1" />
          <span className="val mono" data-l="reliefVal" />
        </label>
        <span className="ctl">
          <span className="label">View</span>
          <Seg name="view" label="View">
            <button type="button" data-v="0" aria-pressed="true">Lit</button>
            <button type="button" data-v="1" aria-pressed="false">Normals</button>
            <button type="button" data-v="2" aria-pressed="false">Height</button>
            <button type="button" data-v="3" aria-pressed="false">Albedo</button>
          </Seg>
        </span>
      </div>
      <p className="inspect-info mono" title={`${status || keys}. ${estimated}`}>
        <span className="inspect-keys">{status || keys}</span>
        <span className="inspect-note">Relief estimated from one flat scan</span>
      </p>
    </div>
  );
}

/** The diorama prototype's panel: method, view, depth, focus blur, moving light, tilt; then what it draws and what is estimated, in one line. */
function LayersPanel({ status }: { status: string }) {
  const estimated =
    "The depth is a machine estimate (Depth Anything V2, run on Jorge\u2019s machine); what is hidden behind the front layers was never painted, it is smeared in by code.";
  return (
    <div className="inspect-panel" data-panel="layers">
      <div className="inspect-ctls">
        <Seg label="Depth method">
          <button type="button" data-mode="1" aria-pressed="true">Cut-out layers</button>
          <button type="button" data-mode="0" aria-pressed="false">Depth field</button>
        </Seg>
        <Seg label="View">
          <button type="button" data-view="0" aria-pressed="true">Paint</button>
          <button type="button" data-view="1" aria-pressed="false">Depth</button>
          <button type="button" data-view="2" aria-pressed="false">Layers</button>
        </Seg>
        <label className="ctl">
          <span className="label">Depth</span>
          <input type="range" data-d="depth" min="0" max="1" step="0.01" defaultValue="0.5" />
        </label>
        <label className="ctl">
          <span className="label">Focus blur</span>
          <input type="range" data-d="dof" min="0" max="1" step="0.01" defaultValue="0.4" />
        </label>
        <label className="ctl">
          <input type="checkbox" data-d="light" defaultChecked />
          <span className="label">Moving light</span>
        </label>
        <button type="button" className="mono tilt" data-d="tilt" hidden>
          Enable tilt
        </button>
      </div>
      <p className="inspect-info mono" title={estimated}>
        {status && <span className="inspect-keys">{status}</span>}
        <span className="inspect-keys" data-d="stats" hidden={!!status}>
          move to look around · click to focus
        </span>
        <span className="inspect-note">Depth is a machine estimate; hidden parts are filled in by code</span>
      </p>
    </div>
  );
}
