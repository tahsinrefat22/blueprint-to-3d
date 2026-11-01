# Progress: __TITLE__

Current phase: 1 Intake · Last updated: __DATE__

> Tick an item only when its evidence exists: a doc section, real command output, or the user's approval.
> Update "Current phase" and "Last updated" whenever anything changes. A new session resumes from the first unchecked item.

## Phase 1: Intake ([01-intake.md](01-intake.md))
- [ ] Round 1: the thing (purpose, size, weight, environment, inspiration)
- [ ] Round 2: inputs received and read (files, links, sketches)
- [ ] Round 3: components and connections
- [ ] Round 4: build context (tools, skill, quantity, timeline, units)
- [ ] Round 5: priorities and hard limits
- [ ] User confirmed: nothing more to add
- [ ] User approved, moving to Phase 2

## Phase 2: Analysis ([02-analysis.md](02-analysis.md))
- [ ] Requirements (must / should), envelope
- [ ] Subsystems and interfaces
- [ ] Load paths and kinematics
- [ ] Environment and safety
- [ ] Known / inferred / unknown
- [ ] Design drivers (3–6)
- [ ] Risks, open questions, fidelity plan
- [ ] User approved, moving to Phase 3

## Phase 3: Budget and country ([03-constraints.md](03-constraints.md))
- [ ] Budget mode and ceiling
- [ ] Country, region, currency
- [ ] Regulations researched and cited
- [ ] User approved, moving to Phase 4

## Phase 4: Component research ([04-component-research.md](04-component-research.md))
- [ ] Architecture decisions recorded (where the component type wasn't obvious)
- [ ] Every subsystem: ≥ 2 real candidates from opened sources
- [ ] Decision record per significant choice (docs/decisions/)
- [ ] All adopted values have a source or an explicit `assumed` label
- [ ] docs/sources.md up to date
- [ ] User approved, moving to Phase 5

## Phase 5: Sourcing and cost ([05-sourcing-bom.md](05-sourcing-bom.md))
- [ ] Local shops found (user's country), then nearest countries, then global
- [ ] Every BOM line: link, dated price, stock, backup
- [ ] Shipping, duty and restrictions
- [ ] Landed total in the user's currency
- [ ] User approved, moving to Phase 6

## Phase 6: Engineering model ([06-engineering-model.md](06-engineering-model.md))
- [ ] Dependency graph drafted
- [ ] User chose effects to include, and gave any formulas they want followed
- [ ] Every formula vetted: source, validity, assumptions, accuracy
- [ ] Disagreements with user formulas argued and resolved
- [ ] Every formula has a test case
- [ ] Limits defined
- [ ] User approved, moving to Phase 7

## Phase 7: Scaffold ([07-build-plan.md](07-build-plan.md))
- [ ] Code scaffolded; `bun install` passes
- [ ] Template demo removed; spec, sources, decisions, parts written from Phases 4–6
- [ ] Engine formulas, graph and tests written
- [ ] `bun run check` passes (output in 07-build-plan.md)
- [ ] User approved, moving to Phase 8

## Phase 8: Build ([08-build-log.md](08-build-log.md))
- [ ] Stage 1: envelopes; mass, CG, clearances, explode order checked; screenshots; user approved
- [ ] Stage 2: <module>; checks pass; screenshots; user approved
- [ ] Page sections complete (calc panel, key numbers, mass, BOM, capabilities, decisions, sources)

## Phase 9: Verification ([09-verification.md](09-verification.md))
- [ ] `bun run check` passes
- [ ] `bun run check:provenance:final` passes
- [ ] Browser: all views, explode, grid, both themes, phone width, no console errors
- [ ] User approved

## Phase 10: Edit loop ([10-changelog.md](10-changelog.md))
- Ongoing. Each edit is logged in 10-changelog.md with its check result.
