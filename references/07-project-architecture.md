# Project Architecture and Coding Standards

## Stack (pinned in `templates/project/package.json`)

| Package | Version | Why |
|---|---|---|
| astro | 7.4.4 | Static page, components, build |
| three / @types/three | 0.187.0 | 3D (ES modules; addons from `three/addons/...`) |
| tailwindcss / @tailwindcss/vite | 4.3.3 | All styling |
| zod | 4.6.7 | Spec schemas |
| @biomejs/biome | 2.6.4 | Lint and format (`.ts`, `.astro`, `.css`, `.json`) |
| @astrojs/check + typescript | 0.9.12 + **5.9.3** | Type checking. TypeScript stays on 5.x; 7.x tooling isn't complete yet |
| @types/bun | 1.3.11 | `bun:test` types |

The Astro CLI runs on Bun's runtime: `bun --bun astro …`. This avoids Astro's Node version floor (it needs Node ≥ 22.23.4, and many machines have older Node). The template's scripts already do this.

`bun run preview` starts a **detached** server in Astro 7 and returns immediately. Stop it with `bun --bun astro preview stop`.

## Layout

```
<slug>/
├── docs/                      phase docs, decisions/, sources.md
├── src/
│   ├── spec/                  single source of truth (see 06-spec-format.md)
│   ├── engine/                pure TS, no three.js
│   │   ├── units.ts           constants and conversions only
│   │   ├── formulas/*.ts      cited, pure, unit-suffixed
│   │   ├── graph.ts           generic dependency-graph evaluator (don't fork per project)
│   │   ├── mass.ts            mass rows, total, point masses, CG
│   │   ├── geometry.ts        segment and capsule distances for clearance checks
│   │   ├── project-graph.ts   THIS project's calc inputs, nodes and limits
│   │   └── project-clearance.ts  THIS project's swept clearance checks
│   ├── model/                 three.js
│   │   ├── index.ts           mountViewer(): DOM wiring and the on-demand render loop
│   │   ├── scene.ts           renderer, PMREM environment, camera, controls, ground
│   │   ├── frames.ts          body frame, LocalFrame (right-handed check)
│   │   ├── primitives.ts      geometry cache, bar/setBar, gearGeometry
│   │   ├── registry.ts        materials per part, pickables, grid representatives
│   │   ├── explode.ts         ordered explode groups and holders
│   │   ├── grid.ts            labelled grid explode
│   │   ├── picking.ts         raycast, click-vs-drag
│   │   ├── labels.ts          projected HTML tags
│   │   ├── camera.ts          fly-to
│   │   ├── theme.ts           CSS tokens, theme change, reduced motion
│   │   ├── types.ts           ModuleContext / ModuleState / ModuleHandle
│   │   ├── project.ts         THIS project's explode order, views, tags, module list
│   │   └── parts/*.ts         THIS project's modules, one file per subsystem
│   ├── components/            Astro sections + ui/ (Pill, SectionHead) + status.ts
│   ├── layouts/Base.astro
│   ├── pages/index.astro, bom.csv.ts
│   ├── events.ts              CALC_EVENT
│   └── styles/global.css      Tailwind import and theme tokens only
├── tests/                     bun test
└── scripts/                   check-provenance.ts, check-clearance.ts
```

## Module boundaries

- `spec` imports nothing from the project. `engine` imports `spec`. `model` imports `spec` and `engine`. `components` may import everything.
- `engine` never imports three.js. That keeps it testable in `bun test` and reusable by the scripts.
- Model code never hard-codes a dimension that belongs in the spec. Inline literals are only allowed for purely visual choices (segment counts, a bevel, a label offset).
- Each subsystem module exports `build<Name>(ctx: ModuleContext): ModuleHandle`, lives in `model/parts/`, and is listed in `model/project.ts → buildModules`.

## Coding standards

- **TypeScript:** `astro/tsconfigs/strictest` (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, no unused code). No `any`, no non-null assertions (`!`). Narrow instead.
- **Naming:** unit suffixes on physical quantities (`massG`, `lengthMm`, `torqueNmm`, `speedRpm`, `freqHz`). Names that describe the thing, not the type.
- **Small modules:** one responsibility per file. If a module file grows past ~300 lines, split it by sub-assembly.
- **Comments:** explain *why*, cite sources (`S07`), and state validity ranges. No narration comments.
- **Render loop:** no allocations per frame. Use module-level scratch vectors (`const _v = new Vector3()`) and the `setBar` / `LocalFrame.point(…, target)` style APIs. Recompute bounds only when needed.
- **Resources:** share geometry through `cachedGeometry`. Register materials through `registry.material()`, so highlighting and disposal work. Dispose of everything in `mountViewer`'s cleanup.
- **Accessibility:** buttons are `<button type="button">`, toggles use `aria-pressed`, grouped controls use `<fieldset>` + `sr-only` `<legend>`, and the info panel is `aria-live`. Status colour is always paired with text. Respect `prefers-reduced-motion` (no autoplay, instant easing).
- **Styling:** Tailwind utilities only, including classes set from TS. Tailwind v4 scans `.ts` files. `global.css` holds tokens only. Inline `style=` is allowed only for data-driven values (bar widths, part colours).
- **Fallback:** without WebGL, `[data-fallback]` shows and the data sections still work.
- **Formatting:** `bun run format` (Biome). Never commit with lint errors.

## Scripts

| Script | Does |
|---|---|
| `dev` / `build` / `preview` | Astro via Bun's runtime |
| `typecheck` | `astro check` (TS 5.9 strictest) |
| `lint` / `format` | Biome check / fix |
| `test` | `bun test` |
| `check:provenance` | Sources resolve; assumed values are covered by open decisions; warns on template data and an empty BOM |
| `check:provenance:final` | The same, but template data and an empty BOM are errors (Phase 9) |
| `check:clearance` | Sweeps `project-clearance.ts` |
| `check` | lint → typecheck → test → provenance → clearance → build |

## Phase 7 procedure

1. Run `scaffold.ts <slug> --title "…"` (no `--docs-only`) from the folder that contains `<slug>/docs`. Existing docs are kept.
2. `cd <slug> && bun run check`. It must pass on the untouched demo, which proves the toolchain works on this machine.
3. Replace the demo (see `06-spec-format.md`, "Replacing the template demo"):
   - spec from Phases 4–6
   - formulas and tests from `docs/06-engineering-model.md`
   - `project-graph.ts`
   - `project-clearance.ts`
   - a Stage 1 module per subsystem with envelope geometry
   - `model/project.ts`
4. `bun run check` must pass again. Record the output in `docs/07-build-plan.md`.
