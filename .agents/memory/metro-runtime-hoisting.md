---
name: metro-runtime pnpm hoisting
description: Why metro-runtime must be hoisted in .npmrc and what breaks when it isn't
---

## Rule
`metro-runtime` (and other `metro*` packages) must be hoisted to root `node_modules` via `.npmrc`. Without it, `@expo/cli` crashes at startup with `Cannot find module 'metro-runtime/package.json'`.

**Why:** `@expo/cli` calls `require.resolve('metro-runtime/package.json')` directly from its own source (in `withMetroMultiPlatform.ts`), not via a peer package. In pnpm's strict isolation model, each package can only see its declared dependencies. `metro-runtime` is a transitive dep of `@expo/metro` which is a dep of `@expo/cli`, but pnpm doesn't hoist transitives by default — so `@expo/cli` can't find it. Hoisting makes `metro-runtime` appear in root `node_modules`, which is in the Node.js resolution path.

**How to apply:** `.npmrc` must have:
```
public-hoist-pattern[]=metro*
public-hoist-pattern[]=@expo/metro*
```

After adding, run `CI=true pnpm install` to rebuild the modules dir (the `CI=true` is needed because non-TTY environments otherwise refuse to remove the modules dir).

**Trigger:** This broke when `expo-dev-client` was removed. That package happened to pull `metro-runtime` into the dep tree in a way that satisfied `@expo/cli`'s resolution. Without it, hoisting is required.
