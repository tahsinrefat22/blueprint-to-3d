# Page Sections

`src/pages/index.astro` composes the page in this order. Each section is an Astro component fed by the spec and engine. Most need **data**, not code changes.

| # | Component | Data it reads | What to write per project |
|---|---|---|---|
| 1 | `Header` | `project`, mass total, `massTarget` | eyebrow (what it is), title, phase, stage, as-of date, hardware-measured status, lede (how to interact, plus the honesty line about fidelity) |
| 2 | `Viewer` | `parts`, `values`, `viewerControls` + `model/` | modules, explode groups, views, tags |
| 3 | `CalcPanel` | `projectGraph` | inputs, nodes, limits, help text with formula and source |
| 4 | `KeyNumbers` | `keyNumbers` | 4–8 tiles for the design drivers; notes that explain each one |
| 5 | `MassBudget` | `parts`, `values`, `massHistory`, `massTarget` | keep `massHistory` current |
| 6 | `Bom` | `bom`, `currencyNote`, `project.country/budgetMode` | Phase 5 data |
| 7 | `Capabilities` | `capabilities` | what it can do, how, status (`expected / gated / open / later / not-designed`), notes |
| 8 | `Decisions` | `decisions`, `nextSteps` | settled vs open, and what happens next |
| 9 | `Sources` | `sources` | automatic |
| 10 | `Footer` | — | adjust if the project keeps files elsewhere |

## Writing the words

DFLY's text is a large part of why it works. Every sentence carries a number, a reason or a status. Imitate that:
- **Good:** "Wings clear by 8.9 mm (realistic) and 0.5 mm (worst case)."
- **Bad:** "Wings have adequate clearance."

Say what's estimated, what's open and what's not designed for. Use status pills on capabilities and decisions. Avoid marketing language.

## Design system

- Tokens are in `src/styles/global.css`: paper, panel, ink, muted, line, accent, stage, and good / warn / bad / idle, each with a soft variant. Light and dark themes are both defined. `data-theme="light|dark"` overrides the OS setting.
- Fonts are a display face, a body face and a mono face. The template uses Saira Semi Condensed, IBM Plex Sans and IBM Plex Mono (the DFLY set). A project may choose a different, fitting set: change the Google Fonts link in `Base.astro` and the `@theme` font tokens together.
- A project may change the accent to suit the domain. Keep the contrast of status colours, and always pair them with text.
- **Responsive:** the viewer and side panel sit side by side at ≥ 900 px and stack below that. The viewport is 400 / 460 / 640 px tall (taller in grid mode). Tables scroll inside their container. At phone width: a 16 px gutter and no horizontal page scroll. Verify at 390 px.

## Live updates

`CalcPanel` evaluates the graph on input, marks the affected rows (`downstream()`), updates the limit pills, and dispatches `CALC_EVENT` with the results. `KeyNumbers` tiles and the 3D model (`state.calc`) listen to it. To make a spec-driven dimension rescale in 3D, expose it as a graph input and read `state.calc[id] ?? v(key)` in the module.
