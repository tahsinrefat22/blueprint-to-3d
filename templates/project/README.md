# __TITLE__

An interactive, engineering-grade 3D model generated with the `blueprint-to-3d` Claude Code skill.

## Run

```bash
bun install
bun run dev      # http://localhost:4321
bun run check    # lint, typecheck, tests, provenance, clearance, build
```

## Where things live

| Path | What |
|---|---|
| `docs/` | Every phase of the design process; `docs/00-progress.md` is the master checklist |
| `src/spec/` | The single source of truth: every number with its source and confidence |
| `src/engine/` | Pure, tested engineering calculations (no three.js) |
| `src/model/` | three.js scene, modules, explode views, picking |
| `src/components/` | Page sections (Astro + Tailwind) |
| `tests/` | Formula, graph, spec and kinematics tests (`bun test`) |
| `scripts/` | Provenance and clearance checks |

Values marked `estimated` or `assumed` are not measured. Check them before ordering parts or building.
