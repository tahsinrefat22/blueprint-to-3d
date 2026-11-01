/**
 * Sweeps every clearance check over its full range of motion and fails if any minimum gap is below
 * its threshold.
 *
 *   bun scripts/check-clearance.ts
 */
import { clearanceChecks } from "../src/engine/project-clearance";

let failed = 0;
for (const check of clearanceChecks) {
  let min = Number.POSITIVE_INFINITY;
  let at = 0;
  for (let i = 0; i < check.samples; i++) {
    const t = i / check.samples;
    const gap = check.gapAt(t);
    if (gap < min) {
      min = gap;
      at = t;
    }
  }
  const ok = min >= check.minGapMm;
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${check.label}: min gap ${min.toFixed(2)} mm at t=${at.toFixed(3)} (need >= ${check.minGapMm} mm)`,
  );
}
if (failed > 0) {
  console.error(`clearance check FAILED (${failed} of ${clearanceChecks.length})`);
  process.exit(1);
}
console.log(`clearance check passed (${clearanceChecks.length} checks)`);
