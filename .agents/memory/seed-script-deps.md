---
name: Seed script dependency scope
description: Packages imported by lib/db/src/seed.ts must live in lib/db/package.json, not api-server
---

`pnpm run db:seed` runs `tsx lib/db/src/seed.ts` from the workspace root. Node resolves imports against `lib/db/node_modules`, not `artifacts/api-server/node_modules`.

**Why:** Each workspace package has its own isolated `node_modules`. A package installed in `api-server` is not visible to code running in `lib/db` scope.

**How to apply:** Any package the seed script imports (e.g. `bcryptjs`) must be added with `pnpm --filter @workspace/db add <pkg>`. Do not assume a package installed in api-server is available to seed.ts.
