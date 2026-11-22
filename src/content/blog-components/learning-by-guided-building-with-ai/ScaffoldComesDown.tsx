"use client";

// Fig. 2, live: one guidance level at a time, chosen on the scale.

import { useId, useState } from "react";
import type { LevelId } from "./data";
import { ScaffoldView } from "./views";

export default function ScaffoldComesDown() {
  const [level, setLevel] = useState<LevelId>("guided");
  return <ScaffoldView level={level} onLevel={setLevel} name={useId()} />;
}
