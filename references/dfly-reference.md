# The Quality Bar: DFLY

`examples/dfly-reference.html` is a design-status page for **DFLY**, a four-wing dragonfly-inspired flapping robot: 110 g, 420 mm span, one brushless motor per wing, at the design phase. It's a single HTML file (three.js r128 from a CDN). Open it in a browser and use it: play the flapping, step through the take-apart, open "Explode with labels", and click parts.

Every project this skill produces should be at least this deep, built on the modern stack and code standards in this skill.

## What makes it good

1. **Every number comes from engineering data.** Positions, stations, link lengths, gear teeth and masses come from the project's design file and decision records. Nothing is decorative or eyeballed.
2. **Mechanisms are solved, not faked:**
   - the crank-rocker four-bar is solved by circle intersection from the real link lengths
   - gears turn at true ratios (1, −5, +25)
   - passive pitch is approximated from the flap rate
   - fore-hind phase and split-cycle yaw are live controls
   - stroke offset works through the real 1.70 ratio
3. **Surfaces that move like the real thing.** The wing membrane is a planform function whose vertices are re-mapped every frame through flap and pitch.
4. **Two take-apart modes.** An 11-step outside-in explode, with a caption per step that teaches something. And a labelled grid of every part with count, mass and the files holding its numbers.
5. **A data-driven part catalogue.** Name, count and mass, status, colour, description and files drive the legend, picking, highlight, info panel and grid labels.
6. **Honesty everywhere:**
   - "drawn at envelope level, not detailed yet"
   - "desk estimates"
   - "Hardware measured: none yet"
   - status pills on every capability and decision
   - an open-items card naming what could break the design
7. **Dense, specific writing.** Tiles and descriptions carry numbers and reasons. For example: "Wings clear by 8.9 mm (realistic) and 0.5 mm (worst case)"; "the quasi-steady power model is probably pessimistic… 20 to 25 W at hover, not 50 W".
8. **Polish:**
   - light and dark tokens
   - responsive layout
   - reduced motion
   - WebGL fallback
   - theme-aware ground grid
   - a stated animation slow-down

## What this skill does better

| DFLY | This skill |
|---|---|
| three.js r128 and `examples/js` (legacy globals) | three 0.187 ES modules, addons from `three/addons` |
| One 380-line IIFE | spec / engine / model / components modules |
| Numeric literals inline | Everything from the typed spec with provenance |
| Static numbers | Live calculation panel driven by a dependency graph with limits |
| `new Vector3()` every frame, bounds every frame | Scratch reuse, on-demand rendering |
| Hemisphere and directional lights | PMREM environment lighting |
| Raw CSS | Tailwind v4 with tokens |
| No BOM or sourcing | Country-aware BOM with landed cost and CSV |
| Repo file pointers only | Plus a numbered sources list with URLs and access dates |
| No automated checks | Tests, provenance check, clearance sweep, build, visual verification |

## Using it during a project

- **Phase 2:** list which DFLY features apply here (which mechanisms must be solved, what deforms, what the take-apart order is).
- **Phase 8:** before each stage, compare against DFLY. Is this module as specific, as honest and as interactive?
- **Phase 9:** open DFLY and the project side by side. If the project feels shallower, it isn't done.
