# Phase 1: Intake

The goal is to collect **everything** the user has and knows before you start forming opinions. A detail missed here (they already own a 3D printer with a 220 mm bed, the robot must fit through a 60 cm door, they want it quiet) shows up later as a redesign.

## How to ask

- Ask in **rounds of 3–6 questions**. A wall of 30 questions gets skimmed. Short rounds get real answers.
- Adapt each round to the previous answers. Skip questions that are already answered, and dig into anything surprising.
- Give examples inside questions, so users who don't know the jargon can still answer. For example: "How will it be powered? (battery, wall plug, solar, hand-crank…)"
- Offer "not sure" as a valid answer. "Not sure" is information too: it tells you that you'll research it and propose something.
- Don't propose designs yet. Ask for clarification only.

## Round 1: The thing

- What is it, in your words? What should it do?
- What problem does it solve, or why are you building it (learning, product, research, hobby, gift)?
- Roughly how big, and how heavy? Any hard size or weight limit?
- Where will it be used (indoors, outdoors, water, dust, temperature range, around people or kids)?
- Anything similar you've seen that inspired it? Links, product names, videos?

## Round 2: The inputs

Ask for anything they can share:
- sketches, napkin drawings, screenshots
- blueprints, CAD files (STEP, STL, DXF), photos of prototypes
- papers or articles, datasheets, links

How to read each kind of input:
- **Images and sketches:** look at them, then write down every label, dimension, arrow, annotation and implied connection. Ask about anything ambiguous: "Is the circle at the top a wheel or a pulley?" Don't guess scale. Ask for one known dimension.
- **PDFs and papers:** read the relevant pages. Extract the parameters, equations, figures and tables they rely on. Note the page numbers for citation.
- **CAD files:** note the dimensions, part names and units, and record the file path in the intake.
- **Links:** open them and summarise what's relevant. Don't rely on the title.

## Round 3: Components and connections

- Are there any parts you already own or definitely want to use (a specific motor, board, battery, material)?
- How do you picture the parts connecting? Write the user's description of connections down literally. For example: "the arm attaches to the base with a turntable, the gripper is driven by a servo through a linkage".
- Moving parts: what moves, how far, how fast, how often?
- Power: what source, voltage if known, how long it must run.
- Control: manual, remote, autonomous, app, buttons? Any sensors needed?
- Any mechanisms they have in mind (gears, belts, linkages, pneumatics, springs)?

## Round 4: Build context

- What tools do you have? (3D printer: type and bed size. Laser cutter, CNC, drill press, soldering iron, hand tools only?)
- What's your skill level with mechanics, electronics and code?
- How many units: one prototype, a few, or production?
- What's the timeline?
- Metric or imperial?
- Do you have access to a makerspace or machine shop?

## Round 5: Priorities and limits

- Rank what matters most: low cost, light weight, strength, efficiency or runtime, speed, precision, looks, quietness, ease of building, ease of repair.
- Any non-negotiables (must be waterproof, must fold, must be under X)?
- Anything you definitely **don't** want (no soldering, no custom PCBs, no LiPo batteries)?

## Closing intake

1. Ask explicitly: "Is there anything else at all you have or know about this: a component, a connection, a constraint, a file?"
2. Agree on a project slug (short, kebab-case) and a display title.
3. Scaffold the docs:

   ```bash
   bun ~/.claude/skills/blueprint-to-3d/scripts/scaffold.ts <slug> --title "<Title>" --docs-only
   ```

4. Fill in `docs/01-intake.md`. Use the user's own words for key requirements, list every file received (with its path and what was extracted), and give every answer by round.
5. Tick the Phase 1 items in `docs/00-progress.md`.
6. Summarise for the user and **wait** for confirmation before starting the analysis.
