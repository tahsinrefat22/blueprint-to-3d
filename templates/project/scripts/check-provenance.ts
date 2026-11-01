/**
 * Provenance check: every spec value has a valid, resolvable source, and every `assumed` value is
 * listed under an open decision. `--final` (Phase 9) also fails on template placeholders and an
 * empty BOM.
 *
 *   bun scripts/check-provenance.ts [--final]
 */
import { projectGraph } from "../src/engine/project-graph";
import { bom, decisions, sources, values } from "../src/spec";
import { type Decision, type Source, sourcedSchema, sourceSchema } from "../src/spec/schema";

const final = process.argv.includes("--final");
const errors: string[] = [];
const warnings: string[] = [];

const sourceList: readonly Source[] = sources;
const decisionList: readonly Decision[] = decisions;
const sourceIds = new Set(sourceList.map((s) => s.id));
const decisionIds = new Set(decisionList.map((d) => d.id));
const nodeIds = new Set<string>(projectGraph.nodes.map((n) => n.id));
const openCovers = new Set(decisionList.filter((d) => d.status === "open").flatMap((d) => d.covers ?? []));
const templateIds = new Set(sourceList.filter((s) => s.kind === "template").map((s) => s.id));

for (const s of sourceList) {
  const result = sourceSchema.safeParse(s);
  if (!result.success) errors.push(`source ${s.id}: ${result.error.issues.map((i) => i.message).join("; ")}`);
  if (s.kind !== "template" && s.kind !== "user" && !s.url) errors.push(`source ${s.id}: needs a url`);
  if (s.kind !== "template" && !s.accessed) errors.push(`source ${s.id}: needs an accessed date`);
}

const counts: Record<string, number> = {};
let templateValues = 0;
for (const [key, entry] of Object.entries(values)) {
  const result = sourcedSchema.safeParse(entry);
  if (!result.success) {
    errors.push(`${key}: ${result.error.issues.map((i) => i.message).join("; ")}`);
    continue;
  }
  const { source, confidence } = result.data;
  counts[confidence] = (counts[confidence] ?? 0) + 1;
  if (source.startsWith("S") && !sourceIds.has(source)) errors.push(`${key}: unknown source ${source}`);
  if (source.startsWith("D-") && !decisionIds.has(source)) errors.push(`${key}: unknown decision ${source}`);
  if (source.startsWith("calc:") && !nodeIds.has(source.slice(5))) {
    errors.push(`${key}: unknown graph node ${source}`);
  }
  if (confidence === "calculated" && !source.startsWith("calc:")) {
    errors.push(`${key}: calculated values must cite calc:<nodeId>`);
  }
  if (confidence === "assumed" && !openCovers.has(key)) {
    errors.push(`${key}: assumed value is not listed in any open decision's covers`);
  }
  if (templateIds.has(source)) templateValues++;
}

if (templateValues > 0) {
  const message = `${templateValues} values still cite the template placeholder source (replace the demo in Phase 7)`;
  if (final) errors.push(message);
  else warnings.push(message);
}
if (bom.length === 0) {
  if (final) errors.push("BOM is empty (Phase 5 not done)");
  else warnings.push("BOM is empty (filled in Phase 5)");
}

const summary = Object.entries(counts)
  .map(([k, n]) => `${k} ${n}`)
  .join(", ");
console.log(`provenance: ${Object.keys(values).length} values (${summary}), ${sourceList.length} sources`);
for (const w of warnings) console.log(`  warning: ${w}`);
for (const e of errors) console.error(`  error: ${e}`);
if (errors.length > 0) {
  console.error(`provenance check FAILED (${errors.length} errors)`);
  process.exit(1);
}
console.log("provenance check passed");
