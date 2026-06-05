# CareReward

A React Native (Expo) mobile app that helps health plan members save money on healthcare costs and earn rewards for healthy behaviors.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, React Native, expo-router (file-based routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/` — Expo React Native app
- `artifacts/mobile/app/` — All screens (expo-router file-based routing)
- `artifacts/mobile/app/(auth)/` — Login & Register screens
- `artifacts/mobile/app/(tabs)/` — Main tab screens (Dashboard, Opportunities, Claims, Rewards, Profile)
- `artifacts/mobile/app/opportunity/[id].tsx` — Opportunity detail
- `artifacts/mobile/app/claim/[id].tsx` — Claim detail
- `artifacts/mobile/app/redeem.tsx` — Points redemption flow
- `artifacts/mobile/constants/colors.ts` — Design tokens (light + dark mode)
- `artifacts/mobile/constants/data.ts` — Mock data types and sample data
- `artifacts/mobile/context/AuthContext.tsx` — Auth state (AsyncStorage)
- `artifacts/mobile/components/OpportunityCard.tsx` — Reusable opportunity card
- `artifacts/mobile/components/ClaimCard.tsx` — Reusable claim card
- `artifacts/api-server/` — Express API server
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)

## Architecture decisions

- Frontend-only first build: AsyncStorage for persistence, no backend calls from mobile yet.
- Auth is mocked (any email/password signs in) — by design for demo. Real auth backend needed before launch.
- All mock data lives in `constants/data.ts` and mirrors the real API shape the backend will eventually serve.
- Color system supports both light and dark mode via `constants/colors.ts` + `useColors()` hook.
- Expo Router file-based routing — auth group `(auth)`, main tabs `(tabs)`, modal screens at root.

## Product

- **Dashboard** — Points balance, savings this year, deductible progress, top opportunities, recent claims
- **Opportunities** — Browse/filter by category (medication, preventive, mail delivery, specialist); savings + points per opportunity; detail screen with steps and doctor note generation
- **Claims** — Claims history with status (processed/pending/in-review); plan deductible & OOP progress; cost breakdown
- **Rewards** — Points balance, earn methods, redemption options (premium reduction, copay credit, gift cards, healthcare services), transaction history
- **Profile** — User info, plan details, notification toggles, health records, support links

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `npx expo start` directly — use `restart_workflow` tool instead
- Do NOT create `app.config.ts` — must use static `app.json`
- Mock data in `constants/data.ts` must be replaced with real API calls before launch
- Auth in `context/AuthContext.tsx` is mocked — needs real auth integration (Auth0, Cognito, etc.)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile-specific guidelines
