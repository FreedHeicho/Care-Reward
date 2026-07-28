---
name: CRIT-004 write paths
description: All 8 previously write-less tables now have API routes; key patterns and gotchas.
---

## Rule
All 8 tables listed in CRIT-004 now have write paths. Do not add new tables without wiring both read AND write routes.

## Table → endpoint map (summary)
| Table | Route file | Key endpoint |
|---|---|---|
| `opportunities` | adminOpportunities.ts | POST /api/admin/opportunities |
| `sessions` | auth.ts | POST /api/auth/login + /register |
| `emr_records` | emrRecords.ts | POST /api/user/emr |
| `connected_devices` | connectedDevices.ts | POST /api/user/devices |
| `device_readings` | deviceReadings.ts | POST /api/user/device-readings |
| `copay_records` | copayRecords.ts | POST /api/user/copay |
| `push_tokens` | pushTokens.ts | POST /api/user/push-token |
| `employers` | adminEmployers.ts | POST /api/admin/employers (admin role only) |

## Gotchas
- `GET /api/user/emr/:recordType` used `db.query.emrRecords.findMany({ with: { healthSystem: true } })` which threw a 500 because no `emrRecordsRelations` exists in the schema. Fixed by switching to a plain `db.select().from(emrRecords)` query. **Do not use relational queries on emrRecords until emrRecordsRelations is defined in the schema.**
- `connected_devices.isActive` soft-delete pattern: DELETE endpoint sets `isActive = false`; GET filters by `isActive = true`.
- `push_tokens` upsert deactivates all existing tokens for user+platform before creating new one (handles re-login correctly).
- `POST /api/admin/employers` requires `admin` role only (not employer_admin); the guard differs from other admin routes.

**Why:** These tables had no write path so data only ever came from the seed script — a bank-app pattern requires every action to persist to the DB immediately.

**How to apply:** Any new table added to the schema must get both a read route AND a write route before the feature ships. Mobile contexts must start `loading = true` and re-fetch after login.
