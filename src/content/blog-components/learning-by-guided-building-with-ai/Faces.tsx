// The diagrams' static faces: rendered on the server, all a reader without
// JavaScript sees, and what shows until the live part loads.

import "./figures.css";
import { DialView, LoopView, ScaffoldView } from "./views";

export function LoopFace() {
  return <LoopView />;
}

export function ScaffoldFace() {
  return <ScaffoldView />;
}

export function DialFace() {
  return <DialView />;
}
