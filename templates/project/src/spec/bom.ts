import type { BomLine } from "./schema";

/**
 * Bill of materials, filled in Phase 5 from docs/05-sourcing-bom.md.
 * Every line needs a real URL and a dated price. Empty until sourcing is done; never put example lines here.
 */
export const bom: readonly BomLine[] = [];

/** Rate used to convert into the project currency, with its date and source (Phase 5). */
export const currencyNote = "";
