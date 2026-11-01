import type { Source } from "./schema";

/**
 * Every source opened during research. Mirror of docs/sources.md.
 * S00 marks the template demo; delete it once the real spec replaces the demo (Phase 7).
 */
export const sources = [
  {
    id: "S00",
    kind: "template",
    title: "Template demo placeholder: replace in Phase 7",
    note: "Values citing S00 are illustrative only and are not real components.",
  },
] as const satisfies readonly Source[];
