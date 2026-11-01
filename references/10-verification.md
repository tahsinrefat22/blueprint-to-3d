# Verification (Phases 7–10)

"Done" means proven, with output. Never write that something passes without having run it in this session.

## Automated

```bash
bun run check                    # lint → typecheck → test → provenance → clearance → build
bun run check:provenance:final   # Phase 9 only: no template data, BOM filled
```

| Check | Fails when |
|---|---|
| Biome | lint or format errors |
| `astro check` | any type error (strictest) |
| `tests/formulas.test.ts` | a formula differs from its hand calculation or worked example beyond the stated tolerance |
| `tests/graph.test.ts` | a cycle, an unknown dependency, an undeclared read, non-finite output anywhere across the input ranges |
| `tests/spec.test.ts` | schema invalid, duplicate ids, BOM refers to an unknown part, mass total mismatch, broken key-number refs |
| `check-provenance` | an unresolved source, an `assumed` value not covered by an open decision, `calculated` without `calc:` |
| `check-clearance` | the minimum gap across the full motion range is below threshold |
| `astro build` | build error |

Add tests as the project grows:
- one per formula, citing where the expected value comes from
- kinematic invariants (link lengths preserved, ratios, stroke)
- every clearance pair that matters physically (moving part vs frame, part vs part, part vs ground at landing)

## Visual (every build stage, and Phase 9)

1. `bun run build && bun run preview -- --port 4399 --host 127.0.0.1`. In Astro 7 it detaches; stop it later with `bun --bun astro preview stop`.
2. Open the page in a browser: Claude in Chrome if available (read `anthropic-skills:chrome-browser` first), otherwise Playwright headless screenshots.
3. Check and screenshot:
   - 3/4, front, side and top views
   - the mechanism playing and paused, and the controls moving it
   - each explode step, "Explode all", and "Explode with labels", including entering the grid directly from "Explode all" and reassembling
   - hover tooltip, click-select (highlight, info panel, legend)
   - the calculation panel: move inputs, confirm affected rows, limit pills, tiles and 3D rescaling update
   - light and dark (`document.documentElement.dataset.theme = "light" | "dark"`)
   - phone width, 390 px (an iframe of the page works if the window can't resize): no horizontal scroll (`scrollWidth === clientWidth`)
   - the console: no errors
4. **Look** at the screenshots. Passing tests are not proof that it looks right: a flipped axis, a part floating 10 mm off its mount, or labels overlapping the model only show up visually.

## Reporting

- Paste real command output into the stage entry of `docs/08-build-log.md` or into `docs/09-verification.md`.
- List every failure plainly, with how it was fixed, or record it as an open item. Never tick a progress item whose check failed.
- Close any browser tabs you opened, and stop the preview server.
