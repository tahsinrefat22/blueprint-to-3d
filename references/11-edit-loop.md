# Phase 10: The Edit Loop

After verification, the project enters an indefinite loop. The user asks for changes, and you make them correctly, one at a time, keeping the design consistent. Every change goes through the same steps, so a small edit can't quietly break the mass budget, a clearance or a citation.

## Per request

1. **Classify** the change:

   | Type | Example | Extra work |
   |---|---|---|
   | Visual | colour, camera angle, label wording, layout | none beyond checks and screenshots |
   | Geometry | more detail on a bracket, within its envelope | clearance re-check, screenshots |
   | Spec value | longer arm, bigger battery, new target | propagate through the graph |
   | Component swap | different motor | mini Phase 4–5: research ≥ 2 candidates, decision record, sources, BOM line |
   | New part | add a camera | as a component swap, plus catalogue entry, module geometry, mass |
   | Physics | include heat, change the lift model | mini Phase 6: vet the formula, add a test, update the doc |

2. **Propagate before finishing.** Update the spec, then use the graph (`downstream()`) to find every output that moves. Tell the user concretely, for example:

   > Adding the camera: +12 g → mass 121.9 g (over the 110 g target) → hover frequency 16.8 → 17.7 Hz → winding temperature 104 °C (over the 100 °C limit).

3. **When a change crosses a limit**, propose fixes with their consequences, for example: larger wings (+ area, − frequency, + inertia), higher frequency (+ power, + heat), a different motor (research needed), a lighter part elsewhere. Let the user choose.

4. **Change the physics only when it's needed:** when the design has moved outside a formula's validity range, or the user asks. Otherwise keep the model and re-evaluate it. Say which of the two applies.

5. **Re-check:** `bun run check`, plus screenshots for visual and geometry changes (`10-verification.md`).

6. **Record:**
   - Append a row to `docs/10-changelog.md`: #, date, request (the user's words), type, files changed, outputs that moved, check result.
   - Update the affected phase docs, decision records, `sources.md` and the BOM.
   - If mass changed, append to `massHistory` in `src/spec/project.ts`.
   - Update `project.asOf` and the progress file's "Last updated".

7. **Report and wait.** Give a short summary: what changed, what moved, the check result, and anything now open. Then wait for the next request.

## Resuming in a new session

Phase 0 reads `docs/00-progress.md` and the tail of `docs/10-changelog.md`, summarises the current state (open items, limits being crossed, last change) and asks for the next request.
