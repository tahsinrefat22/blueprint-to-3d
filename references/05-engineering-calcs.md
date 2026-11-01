# Phase 6: Engineering Calculations

## What "physics" means here

**Engineering relationships between design values:** algebraic or closed-form formulas that update instantly when an input changes. The user's own description of the idea is the best one:

> If extra components are added, the weight increases, which needs a higher wing frequency or more power, which can come from increasing frequency and/or increasing wing size.

That chain of dependencies is exactly what the page should calculate, show and flag.

**In scope:**
- mass budget, centre of gravity, inertia
- force, torque and moment balance
- gear, belt and screw ratios, linkage geometry
- required thrust or lift
- power, current and heat (I²R), efficiency chains
- battery energy and runtime
- beam bending and deflection, simple stress, buckling (Euler)
- bolt and shaft sizing, safety factors
- tip-over and stability angles
- natural frequency estimates

**Out of scope, because it's simulation:**
- time-stepping dynamics, collisions, contact
- FEA, CFD
- control-loop simulation, multibody solvers

If the user asks for one of these, say it's simulation and name a fitting tool (MuJoCo or PyBullet for dynamics, FreeCAD FEM or CalculiX for stress, OpenFOAM for flow, Simulink or Python for control). Offer to bring an external result into the spec as a `measured` or sourced value.

## Procedure

1. **Draft the dependency graph** from the Phase 2 design drivers. Write it as a text diagram in `docs/06-engineering-model.md`:

   ```
   part masses ─▶ total mass ─▶ required lift (target T/W)
                                     │
             wing area, stroke, frequency ─▶ lift model ─▶ solved frequency
                                                               │
                                              aero power ◀─────┘
                                                  │
                         gear ratio ─▶ motor torque & speed ─▶ current ─▶ I²R heat
                                                               │
                                              battery energy ─▶ runtime
   ```

2. **Ask the user** (one round):
   - Which effects do you want considered? Offer a checklist drawn from the graph.
   - Do you have formulas or methods you want followed (from a course, a paper, a previous project)?
   - Which limits matter (maximum temperature, minimum safety factor, minimum runtime)?

3. **Vet every formula**, whether yours or the user's:

   | Item | Question |
   |---|---|
   | Source | Where is it published? (rank 2–3 per `03-research-protocol.md`) |
   | Statement | The exact form, variables, units |
   | Validity | The regime it holds in: scale, Reynolds number, speed, small angles, linear elastic, temperature range. Is this design inside it? |
   | Assumptions | Quasi-steady, rigid, frictionless, uniform load… |
   | Accuracy | What the literature says about error (DFLY: "quasi-steady power is probably pessimistic, about 2×") |
   | Test case | A worked example from the source, or a hand calculation with stated inputs and the expected output, which becomes a `bun test` |

4. **When a user's formula doesn't fit**, explain which assumption it breaks, citing the source. Propose the better formula with its source. Compute **both** for the current design and show them side by side, so the difference is concrete. If the user still prefers theirs, use it, label it `user-specified`, and keep the alternative documented. Respect their decision; your job is to make the trade-off visible.

5. **When no formula can be found** after a real search (several queries, handbooks, papers), tell the user what you searched and ask whether they know one. Never invent a formula or fit one to "look right".

6. **Coupled choices.** Where several inputs can meet one requirement (more lift from frequency *or* wing area), define a **solve-for** option: the user picks which variable the engine solves for, and the page shows the consequences of each choice.

7. **Limits.** Attach limits to outputs: maximum winding temperature, minimum safety factor, maximum current, minimum runtime, maximum deflection. The page flags them as OK, near (within 10 %) or over.

## Writing `docs/06-engineering-model.md`

- The dependency graph.
- A table of inputs: id, label, unit, default (a sourced value id), slider range.
- One section per formula:
  - statement
  - variables and units
  - source id
  - validity range, and whether the design is inside it
  - assumptions
  - accuracy
  - test case
- A table of outputs: id, unit, limits.
- The solve-for options.
- Out-of-scope items, and the tool suggested for each.

## Implementing (Phases 7–8)

- Formulas live in `src/engine/formulas/<area>.ts` as pure functions with unit-explicit names (`massG`, `torqueNmm`, `freqHz`). Unit conversions live only in `src/engine/units.ts`.
- Each formula has a header comment with its statement, source id, validity and assumptions.
- The project's graph lives in `src/engine/project-graph.ts`: inputs, nodes (each calling formulas) and limits. `src/engine/graph.ts` evaluates it in dependency order and is generic. Don't modify it per project unless there's a real need.
- Tests in `tests/formulas.test.ts` check each formula against its test case within a stated tolerance.

## Gate

1. Every formula has a source, a validity check and a test case.
2. Present the graph, the included effects, any disagreement with the user's formulas, and the limits.
3. **Wait** for approval.
