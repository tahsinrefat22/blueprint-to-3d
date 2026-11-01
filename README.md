# blueprint-to-3d

A [Claude Code](https://claude.com/claude-code) skill that turns **anything** (a napkin sketch, a screenshot, a paper, a blueprint, or just a name and a description) into a **detailed, interactive, engineering-grade 3D model of something you can actually build**.

It uses real, researched components. Every number is traceable to where it came from. Engineering calculations update live as you change the design. All of it runs on **three.js + Astro + Bun + Tailwind**.

> No made-up part numbers, no invented prices, no formulas used outside their valid range. If a value can't be sourced, it is labelled `assumed` on the page until someone confirms it.

## What you get

A web page for your project, at the depth of [`examples/dfly-reference.html`](examples/dfly-reference.html) (a four-wing flapping robot):

- **Interactive 3D model.** Mechanisms are solved properly, not faked: linkages, gear trains, deforming surfaces. You can orbit, take it apart one layer at a time, lay every part out in a labelled grid, and click any part to see its mass, status and the files that hold its numbers.
- **Live engineering calculations.** Change the payload, a size or a motor, and every dependent value recomputes, with limits flagged OK, near or over. For example: more mass → more lift needed → higher frequency or bigger wings → more power → more heat → less runtime. These are calculations, never simulation.
- **Mass budget and centre of gravity.** Built from the part catalogue.
- **Bill of materials.** Sourced from your country first, then the nearest countries. Every price has a date, there's a backup supplier per line, the landed total includes shipping and duty, and it downloads as CSV.
- **Capabilities, decisions and sources.** What it can do, what's settled, what's open, and every source with the date it was accessed.
- **A complete `docs/` folder.** One document per phase, decision records, a sources list, a changelog, and a progress checklist that lets a later session pick up where the last one stopped.

## How it works

Claude walks you through 11 phases and **waits for your approval after each one**:

| # | Phase | What happens |
|---|---|---|
| 0 | Resume | Picks up an existing project from `docs/00-progress.md` |
| 1 | Intake | Asks for everything you have (files, parts, connections, tools, priorities) in short rounds |
| 2 | Analysis | Requirements, subsystems, load paths, kinematics, design drivers, risks |
| 3 | Budget and country | Tight or open budget, your country and currency, local regulations |
| 4 | Component research | At least two real candidates per subsystem, from datasheets, with decision records |
| 5 | Sourcing | Where to buy, at what price, in or near your country |
| 6 | Engineering model | Which effects to calculate, with cited and tested formulas. Claude argues its case if a formula doesn't fit, and asks you when none can be found |
| 7 | Scaffold | Creates the Astro project; all checks pass |
| 8 | Build | Stage 1 envelopes (layout, mass, CG, clearances), then one detailed module per stage |
| 9 | Verification | Tests, provenance and clearance checks, build, and visual checks in both themes and at phone width |
| 10 | Edit loop | Any change you ask for, with knock-on effects reported and re-checked every time |

## Install

```bash
git clone https://github.com/tahsinrefat22/blueprint-to-3d.git ~/.claude/skills/blueprint-to-3d
```

Then open Claude Code in any folder and describe what you want to build. For example: *"I want to build a desk robot arm that can lift 500 g, here's my sketch"*. The skill triggers on its own, or you can ask for it by name.

## Requirements

- [Bun](https://bun.sh) ≥ 1.3. The generated projects run Astro on Bun's runtime, so Node's version doesn't matter.
- Web access for Claude (component research and sourcing).
- Optional: the Claude in Chrome extension, for visual verification.

## Generated project

```
<your-project>/
├── docs/          every phase, decisions, sources, changelog, progress
├── src/spec/      single source of truth: every number with its source and confidence
├── src/engine/    pure, tested engineering calculations
├── src/model/     three.js scene, modules, explode views, picking
├── src/components/ page sections (Astro + Tailwind)
├── tests/         bun test
└── scripts/       provenance and clearance checks
```

```bash
bun run dev      # local page
bun run check    # lint, typecheck, tests, provenance, clearance, build
```

## Skill layout

```
SKILL.md          workflow, hard rules, phase gates
references/       detailed guidance, loaded per phase
templates/        starter Astro project + doc templates
scripts/          scaffold.ts
examples/         DFLY reference page (the quality bar)
```

## License

MIT. See [LICENSE](LICENSE).
