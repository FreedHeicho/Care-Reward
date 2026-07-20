---
name: DB lib typecheck order
description: Why typecheck:libs must run before leaf artifact typechecks to avoid false schema export errors
---

After adding new exports to `lib/db/src/schema/index.ts`, the TypeScript compiler for leaf artifacts (api-server, etc.) reads the compiled `.d.ts` from `lib/db/dist/`. If those declarations are stale, every new export appears as "Module '@workspace/db/schema' has no exported member 'X'".

**Why:** Composite libs emit to `dist/` via `tsc --build`. Leaf artifacts depend on the emitted `.d.ts`, not the source `.ts`.

**How to apply:** Always run `pnpm run typecheck:libs` after editing any `lib/*` package, before running `pnpm --filter @workspace/<artifact> run typecheck`. The root `pnpm run typecheck` script does this automatically; only per-artifact checks skip it.
