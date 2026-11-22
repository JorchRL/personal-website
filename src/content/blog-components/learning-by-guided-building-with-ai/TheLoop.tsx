"use client";

// Fig. 1, live: step around the loop, one stage highlighted at a time.

import { useState } from "react";
import { loop, type StageId } from "./data";
import { LoopView } from "./views";

const ORDER: StageId[] = loop.stages.map((s) => s.id);

export default function TheLoop() {
  const [stage, setStage] = useState<StageId>("discuss");
  const at = ORDER.indexOf(stage);
  const last = at === ORDER.length - 1;
  return (
    <LoopView
      stage={stage}
      onStage={setStage}
      controls={
        <p className="gb-nav">
          <button type="button" onClick={() => setStage(ORDER[at - 1])} disabled={at === 0}>
            ← Back
          </button>
          <button type="button" className="gb-next" onClick={() => setStage(last ? "brief" : ORDER[at + 1])}>
            {last ? "Next brief ↺" : `Next: ${loop.stages[at + 1].name} →`}
          </button>
        </p>
      }
    />
  );
}
