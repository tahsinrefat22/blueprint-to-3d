# Phase 2: Analysis

Turn the intake into engineering understanding. This doc is what the later phases rely on, so be thorough and honest about what you don't know.

## What to extract

Work through each heading and write it into `docs/02-analysis.md`:

1. **Function and requirements.** What the thing must do, as measurable requirements where possible ("lift 2 kg at 300 mm reach", "hover for 4 min", "hold 150 kg"). Separate **must** from **should**.
2. **Envelope.** Size limits, a mass target or limit, and the operating range (speed, load, temperature).
3. **Subsystems.** Break the thing into modules: structure, actuation, transmission, power, control and electronics, sensing, interfaces with the user. Each one becomes a build stage and an explode group later.
4. **Interfaces.** For every pair of connected subsystems, note how they connect: mechanical (bolted, pinned, press-fit, glued, bearing), electrical (voltage, current, connector), data (protocol). The user's description of connections from intake is the starting point.
5. **Load paths.** Where the forces go, from the load to the ground or the mounting. Which members carry bending, torsion, tension or compression.
6. **Kinematics.** What moves, how many degrees of freedom, the range of motion, speeds, and the mechanism type (linkage, gear train, belt, lead screw, direct drive).
7. **Environment and safety.** Exposure, pinch points, hot parts, stored energy (springs, batteries, pressure), voltages, whether children are around.
8. **Known, inferred, unknown.** Three lists:
   - **Known:** stated by the user or read from their files, with a reference to the intake.
   - **Inferred:** your reasoning, written out ("Inferred: ~1.2 kg total, because the stated parts sum to ~900 g plus frame").
   - **Unknown:** what needs research or a user decision.
9. **Design drivers.** The 3–6 quantities that decide everything else. Examples:
   - DFLY: total mass, flapping frequency, motor winding heat.
   - Robotic arm: payload × reach (joint torque), stiffness, joint backlash.
   - Shelf: span, load and deflection.

   Drivers become the root of the dependency graph in Phase 6 and the key-number tiles on the page.
10. **Risks and open questions.** What could make the design fail or change significantly, ranked. Include anything the user must decide.
11. **Fidelity plan.** What Stage 1 (envelopes) will contain, and a first guess at the detail stages, one per subsystem.

## Comparing against the quality bar

Open `examples/dfly-reference.html` (and read `references/dfly-reference.md`). For this project, list:
- the mechanisms that must actually **move correctly** (solved, not faked)
- the parts with internal detail worth modelling (gears, linkages, PCBs, fasteners)
- which surfaces deform or animate
- what the take-apart order (outside-in) will roughly be

## Writing style

Write it so a teammate could pick it up cold. Use tables for subsystems and interfaces. Mark every inferred value as inferred. No component brand names yet: choosing parts is Phase 4's job, unless the user already fixed a part in intake.

## Gate

1. Present a short summary: drivers, subsystems, the top risks, and the biggest unknowns.
2. Point to the doc.
3. **Wait.** If the user corrects anything, revise the doc and re-confirm.
4. Tick the Phase 2 items in `00-progress.md`.
