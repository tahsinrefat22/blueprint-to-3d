# Research Protocol (anti-hallucination)

Used in Phases 3–6 and in every edit that adds a part or a formula.

The core rule: **if you didn't open it in this session, you can't cite it.** Your memory of part numbers, prices and specs is a source of *leads*, never of *facts*. Model numbers get renamed, specs differ between revisions, prices change weekly, and a confident wrong number is worse than an honest "assumed".

## Contents
1. Source ranking
2. Confidence levels
3. Researching a component
4. Researching an architecture
5. Researching a formula
6. Recording sources
7. Banned habits
8. When research comes up empty

## 1. Source ranking (best first)

| Rank | Source | Use for |
|---|---|---|
| 1 | Manufacturer datasheet, manual, official product page | Specs, dimensions, mass, ratings |
| 2 | Standards, engineering handbooks, material databases (ISO, DIN, ASTM, MatWeb, manufacturer material sheets) | Material properties, fastener and gear standards |
| 3 | Peer-reviewed papers, university course notes, textbooks | Formulas, models, validity ranges |
| 4 | Authorised distributors (Digi-Key, Mouser, RS, Farnell, LCSC, national distributors) | Availability, price, often datasheets |
| 5 | Marketplace listings (AliExpress, Amazon, local marketplaces) | Price and availability only; specs only if no datasheet exists, and then labelled `estimated` |
| 6 | Independent tests and reviews with measurements | `measured` values, cited |
| 7 | Forums, blogs, videos, Reddit | **Leads only.** Confirm from rank 1–4 before adopting |

When sources disagree, prefer the higher rank, record the disagreement in the decision record, and use the more conservative value for safety-relevant quantities.

## 2. Confidence levels

Every spec value carries one of these:

| Level | When | Page treatment |
|---|---|---|
| `datasheet` | Read from a rank 1–2 source | normal |
| `measured` | Measured by the user, or a cited third-party measurement | tag "measured" |
| `calculated` | Output of an engine function from sourced inputs | tag "calc" |
| `estimated` | Your engineering estimate, with written reasoning in `note` | amber |
| `assumed` | No source found; placeholder pending the user or a test | amber or red, "needs confirmation", listed in Open decisions |

## 3. Researching a component

1. **Define the requirement first**, from the analysis and calculations: the key specs, with numbers. For example: "motor: ≥ 0.15 N·m continuous at ≥ 60 rpm output, ≤ 80 g, 12 V".
2. **Search broadly**, then narrow down. Use several queries: the generic type plus the key spec, known manufacturers, and "datasheet".
3. **Open the actual product page or datasheet** for each candidate (WebFetch, or the browser if the page needs JavaScript or a PDF). Read the specs from it.
4. **Record per candidate:**
   - manufacturer and exact part number
   - the key specs used, with units as written
   - mass
   - dimensions needed for the model
   - datasheet URL and the date it was accessed
   - availability
5. **At least two real candidates** per subsystem. If the user fixed a part in intake, still verify its specs from a source.
6. **Decide** using a decision record (`docs/decisions/D-NN-topic.md`): options table, criteria, choice, trade-offs, "revisit if".
7. **Enter it into the spec:** each adopted number becomes a `Sourced` value (see `06-spec-format.md`).
8. **Custom parts** (printed brackets, machined plates) have no part number. Record the material (with a sourced density), the process, the dimensions from the design, and the mass calculated from volume × density (`calculated`).

## 4. Researching an architecture

When the right *type* of component isn't obvious (brushed vs brushless, servo vs stepper, belt vs gear, printed vs extruded aluminium):
- Find 2–3 credible comparisons (rank 2–4, or well-known engineering references).
- Compare against this project's drivers and priorities from Phase 2.
- Record it as its own decision record before researching specific parts.

## 5. Researching a formula

See `05-engineering-calcs.md` for the full vetting procedure. In short:
- source
- validity range
- assumptions
- known accuracy
- a worked example that becomes a test

## 6. Recording sources

- Every source goes in `docs/sources.md` *and* in `src/spec/sources.ts` (once the project is scaffolded), with a stable id (`S01`, `S02`…), title, URL, accessed date, and kind.
- Spec values reference sources by id.
- Decision records cite source ids in their options tables.

## 7. Banned habits

- Writing a part number, price, spec or formula from memory without opening a source in this session.
- "Typical value" or "about X" without a source. If it's your estimate, label it `estimated` and write the reasoning.
- Citing a URL you didn't open, or citing a search-results page.
- Dropping the uncertainty: if a source gives a range or a tolerance, keep it in the spec.
- Swapping a chosen part silently. Every substitution needs a decision record.
- Presenting an estimate on the page as if it were measured.
- Inventing a plausible-looking supplier, URL or product name when the search finds nothing.

## 8. When research comes up empty

Say so. Then, in order:
1. Try different queries, synonyms, other manufacturers, or another language (relevant for country sourcing).
2. Consider a different architecture that uses findable parts.
3. Use `estimated` with explicit reasoning, or `assumed`, list it as an open item, and tell the user what would resolve it (a measurement, a quote, a test).
4. Ask the user. They may know a supplier or a part.
