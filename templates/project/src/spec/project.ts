/**
 * Page-level project metadata. Updated as phases complete.
 */
export const project = {
  title: "__TITLE__",
  slug: "__SLUG__",
  eyebrow: "Template demo: geared crank-rocker rig",
  lede: "Drag to orbit, scroll to zoom. Play the mechanism, take it apart one layer at a time, or press Explode with labels to lay every part out with its name and the files that hold its numbers. Click any part for details. This is the template demo; every value is a placeholder.",
  phase: "7, Scaffold",
  stage: "Template demo",
  asOf: "__DATE__",
  country: "",
  currency: "USD",
  budgetMode: "open" as "tight" | "open",
  hardwareMeasured: "none yet",
  /** Animation runs this many times slower than real speed; shown on screen. */
  displaySlowdown: 20,
} as const;

/** Mass history, one point per milestone or edit that changed mass (appended in the edit loop). */
export const massHistory: readonly { label: string; massG: number; note: string }[] = [
  { label: "Template", massG: 195, note: "demo part catalogue" },
];

/** Key-number tiles. `ref` is `node:<graph node id>` or `value:<spec key>`. */
export const keyNumbers = [
  { label: "Mass", ref: "node:partsMass", note: "Part catalogue, against the design target." },
  { label: "Gear ratio", ref: "node:gearRatio", note: "Pinion to crank gear." },
  { label: "Output stroke", ref: "node:strokeDeg", note: "Rocker swing per crank turn." },
  { label: "Cycle rate", ref: "node:cycleHz", note: "Full swings per second." },
  { label: "Motor load", ref: "node:motorLoad", note: "Running torque as a fraction of stall." },
] as const;

/** Mechanism controls in the viewer's side panel; read by the model as state.controls[id]. */
export const viewerControls = [
  {
    id: "crankOffset",
    label: "Crank angle offset",
    unit: "°",
    min: -180,
    max: 180,
    step: 5,
    initial: 0,
    help: "Shifts the crank angle so a pose can be inspected while paused.",
  },
] as const;
