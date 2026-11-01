---
name: blueprint-to-3d
description: Turn anything (a sketch, screenshot, blueprint, paper, photo, or just a name and description) into a detailed, interactive, engineering-grade 3D model of a physical, buildable thing (robot, drone, machine, vehicle, mechanism, device, tool, enclosure, furniture) with three.js + Astro + Bun + Tailwind. Runs a gated workflow the user approves phase by phase: intake, analysis, budget and country, web research of real purchasable components, country-aware sourcing and BOM, cited engineering calculations (mass, CG, torque, power, heat, runtime; never simulation), a staged build with explode views and a live calculation panel, verification, then an endless edit loop, all documented in the project's docs/ folder. Use it whenever someone wants to design, prototype, plan or visualise something they intend to physically build, especially with real parts, costs or physics, even if they never say "blueprint" or "3D". Not for characters, creatures, art, scenery or purely visual reconstructions.
---

# blueprint-to-3d

Take the user from **point A** (anything: a napkin sketch, a screenshot, a paper, a blueprint, or just "a robotic arm that can lift 2 kg") to **point B**: a detailed, interactive 3D model of a buildable thing. The parts are real and researched, the numbers are traceable, the engineering calculations update live, and the documentation is complete enough for someone to actually build it.

The quality bar is `examples/dfly-reference.html`, a design-status page for a four-wing flapping robot. Open it once early in the project, and again before building, so you know the depth expected. `references/dfly-reference.md` explains what makes it good and what to do better.

## Why this skill is strict

People will spend real money and real hours building from this output. A made-up part number, an invented price or a formula used outside its valid range turns into a wrong order, a motor that overheats, or a frame that cracks. So this skill trades speed for trustworthiness. Every number has a source, every phase has a gate, and the user approves each step. When a rule below feels slow, that is the reason for it.

## Hard rules

1. **Nothing hallucinated.** Every component, part number, price, dimension, material property and formula comes from a source you actually opened in this session (datasheet, manufacturer page, distributor listing, standard, paper), a calculation in the project, or the user. If you can't source a value, it goes in as `assumed`, shown visibly in the spec and on the page, and listed as an open item. Never write a part number or spec from memory. Rules for sources and confidence levels are in `references/03-research-protocol.md`.
2. **No corner cutting.** Each phase ends with a gate (below). Don't skip, merge or tick a gate without its evidence. If something fails, say so with the output.
3. **Wait for the user after every phase.** Present what the phase produced and stop. Begin the next phase only after the user approves or gives changes. This is how the user steers the design, and it stops a wrong assumption from compounding through later phases.
4. **Calculations, never simulation.** "Physics" here means algebraic or closed-form engineering relationships, evaluated instantly as inputs change. Example: payload +12 g → total mass → required lift → flapping frequency or wing area → power → current → winding heat → flight time. No time stepping, collisions, FEA or CFD. When a user wants those, name the right external tool. Details are in `references/05-engineering-calcs.md`.
5. **Write everything down.** Each phase writes at least one dedicated `.md` file in `<project>/docs/`. `docs/00-progress.md` is the master checklist: tick items as they complete, and keep "Current phase" and "Last updated" current. This makes the work reviewable and lets a later session resume it.
6. **One source of truth.** Every number lives in the typed spec under `src/spec/`, with its provenance attached. The 3D model, the calculation engine and the page all read from there, so model code contains no magic numbers.
7. **High code standards.** Use strict TypeScript, small single-purpose modules, Tailwind utilities (no raw CSS beyond theme tokens), tested formulas, and an allocation-free render loop. Standards are in `references/07-project-architecture.md`.

## Stack and commands

The stack is **Astro + Bun + three.js + Tailwind CSS v4 + zod + Biome**, with TypeScript pinned to 5.9.x (not 7.x, whose tooling isn't complete yet). The Astro CLI runs on Bun's runtime (`bun --bun astro …`), which avoids Node version limits. The template's scripts already do this.

| Command (inside the project) | Purpose |
|---|---|
| `bun run dev` | Dev server |
| `bun run check` | Everything: lint → typecheck → tests → provenance → clearance → build |
| `bun test` | Formula, spec, graph and kinematics tests |

To scaffold a project, run this from the user's current folder:

```bash
bun ~/.claude/skills/blueprint-to-3d/scripts/scaffold.ts <project-slug> --title "<Title>" [--docs-only]
```

`--docs-only` creates just `<slug>/docs/` (used in Phase 1). Running it again without the flag adds the code around the existing docs and runs `bun install` (Phase 7; `--no-install` skips the install). It never overwrites existing files.

In Astro 7, `bun run preview` detaches and returns immediately. Stop it with `bun --bun astro preview stop`.

## The phases

Each phase works the same way:

1. Read the phase's reference file.
2. Do the work.
3. Write the phase doc.
4. Pass the gate.
5. Tick `00-progress.md`.
6. Summarise for the user and **wait**.

| # | Phase | Read | Writes | Gate |
|---|---|---|---|---|
| 0 | Resume or start | — | — | User picks resume or new |
| 1 | Intake | `references/01-intake.md` | `docs/01-intake.md` | User confirms they have nothing more to add |
| 2 | Analysis | `references/02-analysis.md`, `references/dfly-reference.md` | `docs/02-analysis.md` | User confirms the analysis |
| 3 | Budget and country | `references/04-sourcing.md` (constraints part) | `docs/03-constraints.md` | User confirms |
| 4 | Component research | `references/03-research-protocol.md`, `references/06-spec-format.md` | `docs/04-component-research.md`, `docs/decisions/D-NN-*.md`, `docs/sources.md` | Every part real and sourced, or explicitly custom; nothing unsourced |
| 5 | Sourcing and cost | `references/04-sourcing.md` | `docs/05-sourcing-bom.md` | Every BOM line linked and dated; total computed; user confirms |
| 6 | Engineering model | `references/05-engineering-calcs.md` | `docs/06-engineering-model.md` | Every formula cited, valid for this design, and has a test case; user approves scope |
| 7 | Scaffold | `references/07-project-architecture.md` | `docs/07-build-plan.md` | `bun install` and `bun run check` pass |
| 8 | Build, in stages | `references/08-threejs-patterns.md`, `references/09-page-sections.md` | `docs/08-build-log.md` | Checks pass and screenshots taken after every stage; user approves each stage |
| 9 | Verification | `references/10-verification.md` | `docs/09-verification.md` | Everything passes, with real output pasted in |
| 10 | Edit loop (never ends) | `references/11-edit-loop.md` | `docs/10-changelog.md` | Checks pass after every edit |

### Phase 0: Resume or start

Look for `docs/00-progress.md` in the current folder and its immediate subfolders.

- **If found:** read it, the latest phase doc and `10-changelog.md`. Summarise where the project stands and offer to continue from the first unchecked item.
- **If not found:** go to Phase 1.

### Phase 1: Intake

Gather everything the user has. Ask in rounds of 3–6 questions:

1. The thing.
2. Their inputs (files and links).
3. Components and connections.
4. Build context (tools, skill level, quantity, timeline, units).
5. Priorities and hard limits.

Read every file they give you properly: look at images, read PDF pages, open links. Keep following up until they say there's nothing more. Agree on a project slug, scaffold with `--docs-only`, and record everything in `docs/01-intake.md`, quoting the user's own words where it matters.

### Phase 2: Analysis

Turn the inputs into engineering understanding:

- function and requirements
- envelope (size and mass)
- subsystems and the interfaces between them
- load paths and kinematics
- environment and safety
- what is known, what is inferred (with reasoning) and what is unknown
- the **3–6 design drivers** that decide everything else
- risks and open questions

Write `docs/02-analysis.md`.

### Phase 3: Budget and country

Ask whether budget is a constraint (and the ceiling, if so), the country (and region if they're willing to share), and the currency. Research the rules that apply to this kind of build in that country, such as drone registration, radio rules, battery transport or mains voltage. Cite them in `docs/03-constraints.md`.

### Phase 4: Component research

Do the full research in **both** budget modes; budget changes the selection, not the rigour.

- Where the right type of component isn't obvious, research the architecture first.
- Find at least two real candidates per subsystem, from fetched pages.
- Choose one and record it in a decision record (`D-NN`): options, criteria, choice, trade-offs.
- Put every adopted value in the spec with its source.

### Phase 5: Sourcing and cost

- **Tight budget:** the cheapest option that still meets requirements. State what is given up.
- **Open budget:** the best option, trimming cost where it doesn't hurt, with each trim noted.
- **Both modes:**
  - Search the user's country first, then the nearest countries, then global sellers.
  - Record a dated price, a link, stock status, shipping, likely duty and a backup source for each line.
  - Flag shipping restrictions.
  - Compute the landed total in the user's currency.

### Phase 6: Engineering model

- Draft the dependency graph from the design drivers.
- Ask the user which effects to include and whether they have formulas they want followed.
- Vet every formula: source, valid range, assumptions, known accuracy.
- When a user's formula doesn't fit, argue the point with the specific assumption it breaks, show both results side by side, and let the user decide. If they keep it, label it `user-specified`.
- If, after a real search, no formula exists for something, ask the user. Never invent one.

### Phase 7: Scaffold

1. Run the scaffold script without `--docs-only`.
2. Replace the template's demo spec, parts, engine graph and model with this project's, following `references/06-spec-format.md` and `references/07-project-architecture.md`. The template's demo (a geared crank-rocker) exists only to show every system working, so delete it all.
3. Write `docs/07-build-plan.md`: modules, build stages, explode groups, and the calculation panel's inputs and outputs.

### Phase 8: Build, in stages

- **Stage 1, envelopes:** every part as a correctly sized and placed simple volume, with the mass budget, centre of gravity, clearances and explode order checked. **Wait for the user.**
- **Stages 2 to N:** detail one module per stage (real geometry, mechanisms, motion, materials). After each stage, run `bun run check`, take screenshots, log the stage and **wait for the user**.
- Build out the page sections from `references/09-page-sections.md` as their data becomes final.

### Phase 9: Verification

Run every check in `references/10-verification.md`, including the visual ones: open the page in a browser and look at it in both themes and at phone width. Paste the real output into `docs/09-verification.md`. Report failures plainly.

### Phase 10: Edit loop

This phase never ends. For each request:

1. Classify the change.
2. Update the spec.
3. Report which calculated outputs move, before finishing.
4. Propose fixes if something crosses a limit.
5. Change a formula only when the design leaves its valid range or the user asks.
6. Re-run the checks.
7. Append to `docs/10-changelog.md`.
8. Wait for the next request.

## Talking to the user

- Users range from engineers to hobbyists. Match their vocabulary, and briefly explain any term they might not know (CG, BOM, safety factor).
- At each phase end, give a short summary (what was found or decided, what's still open, what's next) and point to the doc. Don't paste the whole doc into chat.
- Disagree when the engineering says so, with reasons and sources, and then respect the user's decision.
- Ask only where the answer changes the design. Use sensible defaults for everything else and say what you assumed.
