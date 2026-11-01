# Spec Format (`src/spec/`)

The spec is the project's single source of truth. Every number the model, the engine and the page use lives here, with its provenance. Model and engine code read from it, and never contain their own magic numbers.

## Files

| File | Holds |
|---|---|
| `schema.ts` | zod schemas: `Sourced`, `Source`, `Part`, `Decision`, `Capability`, `BomLine`. Generic: don't edit per project unless a field is genuinely missing |
| `values.ts` | `values`: every design value as a `Sourced` entry, plus `v(key)` for the number |
| `sources.ts` | `sources`: every source opened (S01…). Mirror of `docs/sources.md` |
| `parts.ts` | `parts`: the part catalogue (legend order) |
| `decisions.ts` | `decisions` (D-01…), `capabilities`, `nextSteps` |
| `bom.ts` | `bom` lines and `currencyNote` |
| `project.ts` | page metadata, `massHistory`, `keyNumbers`, `viewerControls` |
| `index.ts` | re-exports |

## `Sourced` values

```ts
motorMass: {
  value: 3.8,
  unit: "g",
  confidence: "datasheet",
  source: "S04",                  // S-id, D-id, or calc:<graphNodeId>
  note: "per motor, without leads",
  range: [3.6, 4.0],              // optional: keep a published tolerance
},
```

Rules (enforced by `tests/spec.test.ts` and `scripts/check-provenance.ts`):
- `source` must resolve: `S..` to `sources.ts`, `D-..` to `decisions.ts`, `calc:x` to a node in `src/engine/project-graph.ts`.
- `calculated` values must cite `calc:<nodeId>`.
- `estimated` and `assumed` values need a `note` with the reasoning, or what would resolve them.
- Every `assumed` key must appear in some **open** decision's `covers` list. That way unresolved values show up under "Open" on the page.
- Units: mm, g, N, N·mm, rpm, W, V, A, °C unless `unit` says otherwise. Masses used by parts must be in `g`.
- Non-other sources need a `url` and an `accessed` date. `user` sources (from intake) need an `accessed` date and a `note` pointing to the intake section.

Use `as const satisfies Record<string, Sourced>` so keys are typed (`ValueKey`), and `v("typo")` becomes a compile error.

## Part catalogue

```ts
{
  key: "motor",                    // camelCase, used by the model registry and the BOM
  name: "Motor",
  massKey: "motorMass",            // a ValueKey holding ONE instance's mass, in g
  instances: [[55, 20, 0], [55, -20, 0], [-55, 20, 0], [-55, -20, 0]], // centroids, body frame mm
  status: "open",                  // settled | open | problem | future
  color: "#56626a",
  description: "… what it is, key numbers, what's still open …",
  files: ["docs/decisions/D-05-motor.md", "src/engine/formulas/drive.ts"],
  reserve: false,                  // true for mass held for later phases (grey bar)
}
```

- `count` is `instances.length`. Instance centroids feed the CG, so use real layout positions from the build plan.
- Write the description like DFLY's: dense, specific, honest about what's open. Every number in it must also exist in `values`.
- `files` lists where a reader finds this part's numbers. The first entry appears on the grid label.

## Sources

```ts
{ id: "S04", kind: "datasheet", title: "BETAFPV 1103 8000KV motor specifications", url: "https://…", accessed: "2026-11-01" }
```

`kind`: `url | datasheet | paper | standard | user | template`. `template` exists only for the demo. `check:provenance:final` fails if it's still present.

## Decisions

```ts
{ id: "D-05", title: "Motor", status: "settled", summary: "…", file: "docs/decisions/D-05-motor.md", covers: ["motorMass", "motorKv"] }
```

Every decision file in `docs/decisions/` has a matching entry here, and vice versa.

## BOM

One line per purchasable item, with fields per `bomLineSchema`. `part` must be a catalogue key. The page shows landed totals per currency, and `/bom.csv` is generated at build time. Leave the BOM empty until Phase 5. **Never put example lines in it.**

## project.ts

- `keyNumbers`: tiles. `ref: "node:<id>"` (live, from the graph) or `"value:<key>"`.
- `viewerControls`: side-panel sliders the model reads as `state.controls[id]` (fore-hind phase, stroke offset, crank angle…).
- `massHistory`: append a point whenever mass changes in a milestone or an edit (label, mass, note).
- `displaySlowdown`: the animation slow-down shown on screen.

## Replacing the template demo (Phase 7)

The demo files to delete or rewrite:

- **spec:** `values.ts`, `parts.ts`, `sources.ts` (S00), `decisions.ts` (D-00 and the demo capabilities), `project.ts`
- **engine:** `demo-linkage.ts`, `project-graph.ts`, `project-clearance.ts`, and the demo formulas, if they don't apply
- **model:** `parts/demo-rig.ts`, `project.ts`
- **tests:** the demo-specific expectations

Keep the generic modules: `schema.ts`, `graph.ts`, `mass.ts`, `geometry.ts`, `units.ts` and everything in `model/` except `parts/` and `project.ts`.
