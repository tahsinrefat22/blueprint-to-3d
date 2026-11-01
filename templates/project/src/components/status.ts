/**
 * Status vocabulary shared by Astro components and client scripts, so pills look identical whether
 * rendered at build time or updated live. Colour is always paired with text.
 */

export type StatusKind =
  | "settled"
  | "open"
  | "problem"
  | "future"
  | "expected"
  | "gated"
  | "later"
  | "not-designed"
  | "ok"
  | "near"
  | "over"
  | "none";

type Tone = "good" | "warn" | "bad" | "idle";

const STATUS: Record<StatusKind, { text: string; tone: Tone }> = {
  settled: { text: "Settled", tone: "good" },
  open: { text: "Open", tone: "warn" },
  problem: { text: "Problem", tone: "bad" },
  future: { text: "Future", tone: "idle" },
  expected: { text: "Expected", tone: "good" },
  gated: { text: "Gated on test", tone: "warn" },
  later: { text: "Later phase", tone: "idle" },
  "not-designed": { text: "Not designed for", tone: "idle" },
  ok: { text: "OK", tone: "good" },
  near: { text: "Near limit", tone: "warn" },
  over: { text: "Over limit", tone: "bad" },
  none: { text: "—", tone: "idle" },
};

const TONE_CLASS: Record<Tone, string> = {
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  idle: "bg-idle-soft text-idle",
};

export const PILL_BASE =
  "inline-block whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide";

export const statusText = (kind: StatusKind): string => STATUS[kind].text;

export const pillClass = (kind: StatusKind): string => `${PILL_BASE} ${TONE_CLASS[STATUS[kind].tone]}`;

/** Confidence labels for spec values (see references/03-research-protocol.md). */
export const CONFIDENCE_KIND: Record<string, StatusKind> = {
  datasheet: "settled",
  measured: "settled",
  calculated: "settled",
  estimated: "open",
  assumed: "problem",
};
