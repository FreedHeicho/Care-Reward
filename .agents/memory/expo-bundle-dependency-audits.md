---
name: Expo bundle dependency audits
description: Why Expo production bundles need explicit verification after dependency and vulnerability cleanup.
---

After dependency or vulnerability cleanup, run the full iOS and Android production bundle rather than relying only on install success or TypeScript checks. Strict pnpm isolation can expose undeclared build-time imports in Expo Babel plugins that previously worked through incidental hoisting.

**Why:** A dependency cleanup removed incidental access to Babel modules used by the worklets transform. Package installation and server builds still passed, but Metro failed immediately during the publish build.

**How to apply:** After lockfile-wide upgrades, removals, overrides, or audits, verify both native production bundles. When a third-party package imports undeclared modules, use a scoped pnpm package extension rather than adding unrelated dependencies to the app or workspace root.