# Constraints (Phase 3) and Sourcing (Phase 5)

## Part A: Phase 3, budget and country

Ask, in one short round:
1. **Is budget a concern?** If yes, roughly what ceiling, and does it include tools and shipping?
2. **Which country do you live in?** City or region is optional; it helps with shipping estimates.
3. **Preferred currency** (default: the local currency).
4. Do you have a preference for or against particular shops or marketplaces?

Then research the **regulations and safety rules** that apply to this kind of build in that country, citing official sources. The usual checks:

| If the build has… | Check |
|---|---|
| Flight (drones, flapping robots, RC aircraft) | Registration and weight thresholds, where it's allowed to fly, remote ID |
| Radio (RC links, Wi-Fi, LoRa, telemetry) | Permitted frequency bands and power, certification |
| Lithium batteries | Transport and shipping rules, import rules |
| Mains voltage | Local voltage and frequency, plug standard, electrical safety rules |
| Strong magnets, chemicals, pressurised parts | Shipping limits |
| Lasers, blades, heat | Safety guidance |

Write `docs/03-constraints.md`:
- budget mode: `tight` (with the ceiling) or `open`
- country, region, currency
- the regulations found, with sources
- the implications for the design

## Part B: Phase 5, sourcing and cost

Phase 4 already chose *which* parts. Phase 5 finds *where to buy them, and at what cost*, for this user. If sourcing shows a chosen part can't reasonably be bought in or near their country, go back to Phase 4 for that subsystem: a new decision record, then tell the user.

### Budget modes

| | `tight` | `open` |
|---|---|---|
| Objective | Cheapest prototype that still meets the musts | Best performance and reliability |
| Levers | Cheaper equivalents, generic or clone parts (state the trade-offs), print or make instead of buy, common parts, salvage, fewer custom parts, buying from a regional hub | Best-in-class parts, quality suppliers, spares for parts likely to fail |
| Cost trimming | Main goal | Only where performance and reliability don't suffer; note each trim |
| Must state | What's given up (performance, life, tolerance, safety margin) and the risk | Where cost was trimmed and why it's safe |

Neither mode lowers the research standard. A cheap part still needs a sourced spec.

### Search order

1. **User's country.** Find local electronics, robotics, hobby, industrial-supply and maker shops, plus local marketplaces. Search in the local language too. Record the shops you found (name, URL, what they stock) in `docs/05-sourcing-bom.md`. They're useful for the edit loop.
2. **Nearest countries or a regional hub** with practical shipping to the user.
3. **Global:** manufacturer direct, Digi-Key, Mouser, LCSC, AliExpress, and others.

For each BOM line, record the best option in the nearest practical tier, plus **one backup** from another seller.

### BOM line fields

`id` (matches the part catalogue), manufacturer, part number, qty, supplier, supplier country, URL, unit price, currency, price date, shipping estimate, duty and VAT estimate (sourced rate or `estimated`), stock status, backup supplier and URL, restrictions or notes.

Prices are always dated. They go stale, and the page must say when they were checked.

### Totals

- Parts subtotal, shipping, duty and VAT, and the **landed total**, in the user's currency.
- The currency conversion rate, with its date and source.
- `tight` mode: compare against the ceiling. If over, give a ranked list of cuts or substitutions, with the performance cost of each.

### Write-up

`docs/05-sourcing-bom.md` contains:
- the shops found by tier
- the BOM table
- the totals
- the restrictions found
- what was given up or trimmed

The BOM data also goes into `src/spec/bom.ts` once the project is scaffolded.

### Gate

1. Every line has a URL and a dated price. The landed total is computed.
2. Present a short summary: the total vs the ceiling, notable substitutions, and restrictions.
3. **Wait** for the user's approval.
