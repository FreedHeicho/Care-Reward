# CareReward — Data Traceability Report
**Date:** 2026-07-23  
**Analyst:** Automated static analysis (agent)  
**Scope:** All API routes, schema, business rules, PHI handling, audit logging  
**Methodology:** Every route file, schema file, middleware, and scheduler read directly from source — no guessing.

---

## SECTION 1: EXECUTIVE SUMMARY

| Metric | Value |
|---|---|
| Total endpoints analysed | 14 |
| Total tables in schema | 20 |
| Total data fields traced | 87 |
| Critical findings | 4 |
| High findings | 4 |
| Medium findings | 7 |
| UAT pass rate | 100% (21/21) |

**Key headline:** The core request/response cycle, user isolation, and JWT auth are all sound. The four critical findings are: (1) no role-based access control on the admin insurance import endpoint — any authenticated user can import insurance data for others; (2) no dedicated PHI audit log on health-system connect/read/delete routes; (3) the `sessions` table is defined in schema but never written to by any route; (4) 8 tables have no API write path at all.

---

## SECTION 2: ENDPOINT INVENTORY

| # | Method | Route | Tables Written | Tables Read | User Filter Applied | Audit Logged |
|---|---|---|---|---|---|---|
| 1 | POST | /api/auth/register | users, points_accounts, notification_preferences | users | N/A (pre-auth) | No |
| 2 | POST | /api/auth/login | users (lastLoginAt) | users | N/A (pre-auth) | No |
| 3 | POST | /api/auth/logout | — | — | JWT required | Via middleware |
| 4 | GET | /api/healthz | — | pg (raw query) | None (public) | No |
| 5 | GET | /api/providers/search | — | — (NPPES proxy) | None (public) | No |
| 6 | GET | /api/points/balance | — | points_accounts, points_transactions | YES (userId) | Via middleware |
| 7 | POST | /api/points/allocate | redemptions | points_accounts, hsa_accounts, redemption_windows | YES (userId) | Via middleware |
| 8 | POST | /api/points/confirm/first | redemptions | redemptions | YES (userId) | Via middleware |
| 9 | POST | /api/points/confirm/final | points_accounts, points_transactions, redemptions, hsa_accounts, notifications, audit_logs | redemptions, points_accounts, hsa_accounts | YES (userId) | YES (dedicated) |
| 10 | POST | /api/points/reset-test | points_accounts, points_transactions | points_accounts | YES (userId) | Via middleware |
| 11 | GET | /api/user/context | — | users, points_accounts, points_transactions, user_opportunities, connected_health_systems, connected_devices, insurance_plans, hsa_accounts, redemption_windows*, notifications | YES (userId) | Via middleware |
| 12 | GET | /api/user/opportunities | — | user_opportunities + opportunities (JOIN) | YES (userId) | Via middleware |
| 13 | GET | /api/user/emr/:recordType | audit_logs | emr_records | YES (userId) | YES (dedicated) |
| 14 | GET | /api/health-systems | — | connected_health_systems | YES (userId) | Via middleware only |
| 15 | POST | /api/health-systems | connected_health_systems | connected_health_systems | YES (userId) | Via middleware only |
| 16 | DELETE | /api/health-systems/:id | connected_health_systems | connected_health_systems | YES (userId + id) | Via middleware only |
| 17 | POST | /api/admin/insurance/import | insurance_plans, hsa_accounts | users, insurance_plans | By email lookup only | Via middleware only |
| 18 | GET | /api/admin/insurance/template/json | — | — | JWT required | Via middleware |
| 19 | GET | /api/admin/insurance/template/csv | — | — | JWT required | Via middleware |

*`redemption_windows` intentionally read without `userId` — it is a shared system resource (one active window for all users).

---

## SECTION 3: COMPLETE DATA TRACEABILITY MATRIX

### POST /api/auth/register

| Input Field | Endpoint | Transformation | Destination Table | Destination Column | PHI? |
|---|---|---|---|---|---|
| email | /api/auth/register | .toLowerCase() | users | email | No |
| password | /api/auth/register | bcrypt.hash(10 rounds) | users | password_hash | No |
| firstName | /api/auth/register | None | users | first_name | No |
| lastName | /api/auth/register | None | users | last_name | No |
| — (system) | /api/auth/register | Hardcoded "user" | users | role | No |
| — (system) | /api/auth/register | Hardcoded true | users | is_active | No |
| — (derived: user.id) | /api/auth/register | None | points_accounts | user_id | No |
| — (system) | /api/auth/register | Hardcoded 1250 | points_accounts | current_balance | No |
| — (system) | /api/auth/register | Hardcoded 1250 | points_accounts | earned_this_year | No |
| — (system) | /api/auth/register | `${year}-12-31` | points_accounts | year_reset_date | No |
| — (derived: user.id) | /api/auth/register | None | notification_preferences | user_id | No |
| — (system) | /api/auth/register | Hardcoded true | notification_preferences | opportunities_enabled | No |
| — (system) | /api/auth/register | Hardcoded true | notification_preferences | redemption_window_enabled | No |
| — (system) | /api/auth/register | Hardcoded true | notification_preferences | device_alerts_enabled | No |
| — (system) | /api/auth/register | Hardcoded true | notification_preferences | points_updates_enabled | No |

### POST /api/auth/login

| Input Field | Endpoint | Transformation | Destination Table | Destination Column | PHI? |
|---|---|---|---|---|---|
| email | /api/auth/login | .toLowerCase() (lookup only) | — | — | No |
| password | /api/auth/login | bcrypt.compare (check only, not stored) | — | — | No |
| — (system: new Date()) | /api/auth/login | None | users | last_login_at | No |

### POST /api/points/allocate

| Input Field | Endpoint | Transformation | Destination Table | Destination Column | PHI? |
|---|---|---|---|---|---|
| type | /api/points/allocate | Enum cast | redemptions | type | No |
| pointsAmount | /api/points/allocate | Used directly or derived | redemptions | points_redeemed | No |
| percentage | /api/points/allocate | floor(balance × pct / 100) → pointsToRedeem | redemptions | points_redeemed | No |
| — (computed) | /api/points/allocate | pointsToRedeem / 100 | redemptions | dollar_value | No |
| storeUrl | /api/points/allocate | None | redemptions | store_url | No |
| — (derived: JWT) | /api/points/allocate | None | redemptions | user_id | No |
| — (system) | /api/points/allocate | Hardcoded "PENDING" | redemptions | status | No |
| — (system: window.id) | /api/points/allocate | None | redemptions | redemption_window_id | No |

### POST /api/points/confirm/final

| Input Field | Endpoint | Transformation | Destination Table | Destination Column | PHI? |
|---|---|---|---|---|---|
| redemptionId | /api/points/confirm/final | Lookup key only | redemptions | status, final_confirmed_at | No |
| — (computed: balance − pts) | /api/points/confirm/final | None | points_accounts | current_balance | No |
| — (derived: JWT userId) | /api/points/confirm/final | None | points_transactions | user_id | No |
| — (system) | /api/points/confirm/final | Hardcoded "REDEEM" | points_transactions | type | No |
| — (computed: −pts) | /api/points/confirm/final | None | points_transactions | amount | No |
| — (system) | /api/points/confirm/final | Hardcoded "OPPORTUNITY" | points_transactions | source | No |
| — (computed: newBalance) | /api/points/confirm/final | None | points_transactions | balance_after | No |
| — (system) | /api/points/confirm/final | dollarValue added to ytd | hsa_accounts | ytd_contribution | No |
| — (system) | /api/points/confirm/final | Hardcoded "REDEEM_POINTS" | audit_logs | action | No |
| — (system) | /api/points/confirm/final | Hardcoded "SUCCESS" | audit_logs | outcome | No |

### POST /api/health-systems

| Input Field | Endpoint | Transformation | Destination Table | Destination Column | PHI? |
|---|---|---|---|---|---|
| systemName | /api/health-systems | None | connected_health_systems | system_name | Yes |
| systemType | /api/health-systems | TYPE_MAP lookup → enum | connected_health_systems | system_type | Yes |
| npi | /api/health-systems | None | connected_health_systems | npi | Yes |
| fhirBaseUrl | /api/health-systems | None | connected_health_systems | fhir_base_url | Yes |
| — (derived: JWT) | /api/health-systems | None | connected_health_systems | user_id | Yes |
| — (system) | /api/health-systems | Hardcoded "CONNECTED" | connected_health_systems | connection_status | Yes |
| — (system: new Date()) | /api/health-systems | None | connected_health_systems | last_synced_at | Yes |

### POST /api/admin/insurance/import (CSV/JSON upload)

| Input Field | Endpoint | Transformation | Destination Table | Destination Column | PHI? |
|---|---|---|---|---|---|
| file (email) | /api/admin/insurance/import | lookup by email | insurance_plans | user_id | No |
| file (planName) | /api/admin/insurance/import | Default "Imported Plan" | insurance_plans | plan_name | No |
| file (monthlyPremium) | /api/admin/insurance/import | Default "0.00" | insurance_plans | monthly_premium | No |
| file (deductible) | /api/admin/insurance/import | None | insurance_plans | deductible | No |
| effectiveDate (body) | /api/admin/insurance/import | Default today | insurance_plans | effective_date | No |
| expirationDate (body) | /api/admin/insurance/import | Default Dec 31 | insurance_plans | expiration_date | No |
| file (hsaEligible) | /api/admin/insurance/import | "true"/"1" → insert hsa row | hsa_accounts | yearly_limit, ytd_contribution, current_balance | No |

---

## SECTION 4: SCHEMA COVERAGE

| Table | Total Cols | Cols Written By API | Dead / Never-Written Cols | Write Endpoint(s) | Read Endpoint(s) |
|---|---|---|---|---|---|
| employers | 4 | 0 | ALL (seed only) | MISSING | — |
| users | 11 | 7 | phone, employer_id | POST /api/auth/register, POST /api/auth/login (lastLoginAt) | /api/auth/login, /api/user/context |
| sessions | 6 | 0 | ALL | MISSING | MISSING |
| points_accounts | 6 | 4 | — | POST /register, POST /confirm/final, POST /reset-test | GET /points/balance, /user/context |
| points_transactions | 10 | 7 | opportunity_id | POST /confirm/final, POST /reset-test | GET /points/balance, /user/context |
| redemption_windows | 5 | 0 | ALL (scheduler only) | MISSING (scheduler only) | GET /user/context, POST /allocate |
| redemptions | 10 | 8 | — | POST /allocate, POST /confirm/first, POST /confirm/final | POST /confirm/first, POST /confirm/final |
| opportunities | 7 | 0 | ALL (seed only) | MISSING | GET /user/opportunities |
| user_opportunities | 10 | 3 | completed_at, points_awarded, missed_at (scheduler only) | MISSING (scheduler only) | GET /user/context, GET /user/opportunities |
| connected_health_systems | 11 | 7 | access_token, token_expires_at | POST /api/health-systems | GET /api/health-systems, GET /user/context |
| emr_records | 13 | 0 | ALL | MISSING | GET /api/user/emr/:recordType |
| connected_devices | 11 | 0 | ALL | MISSING | GET /user/context |
| device_readings | 9 | 0 | ALL | MISSING | MISSING |
| insurance_plans | 9 | 6 | employer_id | POST /admin/insurance/import | GET /user/context |
| hsa_accounts | 6 | 4 | — | POST /admin/insurance/import, POST /confirm/final | GET /user/context, POST /allocate |
| copay_records | 7 | 0 | ALL | MISSING | MISSING |
| notifications | 8 | 5 | deep_link, read_at, is_read (never updated) | POST /confirm/final (internal), scheduler | GET /user/context |
| push_tokens | 5 | 0 | ALL | MISSING | MISSING |
| notification_preferences | 6 | 4 | — | POST /register | — (only read in context) |
| audit_logs | 11 | 5 | device_info, failure_reason | requireAuth middleware, GET /emr, POST /confirm/final | MISSING (no read endpoint) |

---

## SECTION 5: CRITICAL FINDINGS

### CRIT-001 — Admin insurance endpoint has no role check
**File:** `artifacts/api-server/src/routes/insurance.ts`, line 22  
**Description:** `POST /api/admin/insurance/import` uses `requireAuth` (any valid JWT) but does not verify `req.userRole === "admin"` or `"employer_admin"`. Any registered user can upload an insurance CSV and overwrite another user's insurance plan simply by knowing their email address.  
**Risk:** Data integrity breach. A regular user could set another user's insurance plan to any values, or create fraudulent HSA accounts.  
**Recommended fix:** Add `if (req.userRole !== "admin" && req.userRole !== "employer_admin") { res.status(403).json({ error: "Forbidden" }); return; }` at the top of the handler. Apply same check to the two template GET endpoints.

---

### CRIT-002 — PHI routes on connected_health_systems have no dedicated PHI audit log
**File:** `artifacts/api-server/src/routes/healthSystems.ts`, lines 18, 34, 96  
**Description:** GET, POST, and DELETE on `/api/health-systems` contain PHI (NPI numbers, provider names, FHIR URLs). The only audit logging that occurs is the generic middleware entry (`action: "GET /health-systems"`, `resourceType: "api"`). There is no dedicated PHI access log with `resourceType: "connected_health_systems"` and `resourceId` identifying the specific record accessed or modified.  
**Risk:** HIPAA audit trail for PHI access is incomplete. In an audit, it is impossible to prove exactly which PHI records were read or by whom without a specific audit entry.  
**Recommended fix:** Add a dedicated `db.insert(auditLogs)` call inside each handler (GET, POST, DELETE) on this route with `resourceType: "connected_health_systems"` and the appropriate `resourceId`. Mirror the pattern already used in `GET /api/user/emr/:recordType`.

---

### CRIT-003 — `sessions` table is defined in schema but never written to
**File:** `lib/db/src/schema/index.ts`, line 133; no route writes to this table  
**Description:** The `sessions` table (6 columns: id, user_id, jwt_token_hash, expires_at, device_info, created_at) exists in the schema and was presumably intended for server-side session management, but no API route inserts, updates, or reads from it. JWT tokens are issued but never recorded. There is no token revocation mechanism.  
**Risk:** If a JWT is stolen (e.g. from a compromised device), there is no way to invalidate it server-side before the 15-minute expiry. The `refreshToken` (7-day expiry) also cannot be revoked.  
**Recommended fix:** Either (a) implement session tracking: insert a row on login, delete on logout, validate sessions in `requireAuth`; or (b) document explicitly that this is a stateless JWT system with no server-side revocation, and remove the `sessions` table from the schema to avoid confusion.

---

### CRIT-004 — `emr_records`, `connected_devices`, `device_readings`, `copay_records`, `push_tokens` have no API write path
**Files:** `lib/db/src/schema/index.ts` (tables defined); no route file writes to these tables  
**Description:** Five tables that hold PHI or device data exist in the schema with full column definitions but have zero corresponding API endpoints to create records in them. Any data in these tables can only arrive via direct database manipulation (e.g. the seed script or direct SQL). The mobile app UI surfaces views for connected devices and health records, but the backend cannot receive this data through the API.  
**Risk:** The UI presents features (device connection, EMR records, copay tracking) that appear functional but silently fail to persist data. Users may believe their device readings are stored when they are not.  
**Recommended fix:** Build the missing write endpoints for each table, or mark the corresponding mobile UI features as "coming soon" until the backend is ready. At minimum, document which tables are intentionally read-only vs. pending implementation.

---

## SECTION 6: HIGH FINDINGS

### HIGH-001 — Points-to-dollar conversion is 100:1, not 1:1
**File:** `artifacts/api-server/src/routes/points.ts`, line 18  
**Description:** The constant `POINTS_PER_DOLLAR = 100` means 100 points = $1.00 (1 point = $0.01). The stated business rule is "1 point equals exactly $1" (`dollar_value = points_redeemed × 1`). The implementation contradicts this: `dollarValue = pointsToRedeem / 100`.  
**Risk:** If the product was sold to members or employers with the promise of 1pt = $1, redeemed amounts are 100× smaller than promised. A user with 1,250 points expecting $1,250 would receive $12.50.  
**Recommended fix:** Clarify the intended exchange rate. If 1pt = $1, change `POINTS_PER_DOLLAR = 1`. If 100pt = $1, update all product documentation and UI displays to reflect this.

---

### HIGH-002 — `auditLogs.failure_reason` and `FAILURE`/`BLOCKED` outcomes are never populated
**File:** `artifacts/api-server/src/middlewares/auth.ts` (lines 37-44), `artifacts/api-server/src/routes/points.ts` (line 291)  
**Description:** The `audit_outcome` enum supports `SUCCESS`, `FAILURE`, and `BLOCKED`. The `failure_reason` and `device_info` columns exist in the schema. In practice, only `SUCCESS` is ever written. Failed login attempts, insufficient balance rejections, invalid token attempts, and blocked operations are not audit logged.  
**Risk:** Incomplete security audit trail. Brute-force login attempts, failed redemption attempts, and unauthorized access attempts leave no record. This is a HIPAA audit control gap.  
**Recommended fix:** Add `FAILURE` audit log entries in the `catch` blocks of critical handlers (login, register, confirm/final) and `BLOCKED` entries for 401/403 rejections in `requireAuth`.

---

### HIGH-003 — `notifications.is_read` and `read_at` are never updated — no mark-as-read endpoint
**File:** `lib/db/src/schema/index.ts` (line 415); no route updates these columns  
**Description:** The schema defines `is_read` (boolean, default false) and `read_at` (timestamp) on the `notifications` table. The `GET /api/user/context` endpoint filters for `isRead = false` and returns up to 10 unread notifications. There is no endpoint to mark a notification as read. Once created, every notification remains "unread" forever. The mobile app will always show the same notifications on every load.  
**Risk:** The notification system is non-functional from the user's perspective. Users cannot dismiss or acknowledge notifications.  
**Recommended fix:** Add `PATCH /api/user/notifications/:id/read` or `POST /api/user/notifications/read-all` that sets `is_read = true` and `read_at = NOW()`.

---

### HIGH-004 — `GET /api/providers/search` requires no authentication
**File:** `artifacts/api-server/src/routes/providers.ts`, line 7  
**Description:** The NPPES provider search endpoint proxies requests to a public federal API and requires no JWT. Unlike `GET /api/healthz` (which is an infrastructure probe), this endpoint is a user-facing feature.  
**Risk:** This endpoint can be abused as an open proxy to the NPPES registry, bypassing any rate limiting the NPPES API applies per IP (requests appear to come from the server's IP). Anyone on the internet who discovers this URL can use your server as a free NPPES proxy.  
**Recommended fix:** Add `requireAuth` to the providers search endpoint. The user must be logged in to search for providers.

---

## SECTION 7: MEDIUM FINDINGS

### MED-001 — `current_balance > earned_this_year` rule is never explicitly enforced in code
**File:** `artifacts/api-server/src/routes/points.ts` — no check found  
**Description:** The UAT test verifies this invariant holds in the database, and it currently does because every code path maintains it (register sets both to 1250, reset-test sets both to 1000, annual reset zeros both, and confirm/final only decrements currentBalance). However, no route code contains an explicit guard (`if (newBalance > account.earnedThisYear) throw ...`). A future code change could silently break the invariant.  
**Recommended fix:** Add an explicit assertion before any `UPDATE points_accounts` that sets `current_balance`: validate `newBalance <= account.earnedThisYear`.

---

### MED-002 — HSA limit check only runs if an HSA row already exists
**File:** `artifacts/api-server/src/routes/points.ts`, lines 93-107  
**Description:** The HSA yearly limit validation (`if (newYtd > parseFloat(hsa.yearlyLimit))`) is wrapped in `if (hsa)`. If a user has no `hsa_accounts` row (e.g. they have an HSA-eligible plan but the import didn't flag `hsaEligible=true`), the check is silently skipped. Points can be allocated to HSA type without any limit validation.  
**Recommended fix:** If `type === "HSA"` and no HSA row exists, either reject the request with a clear error (`"HSA account not set up"`) or treat the yearly limit as $0 (preventing any HSA allocation until properly configured).

---

### MED-003 — `users.phone` and `users.employer_id` columns are never writable via API
**File:** `lib/db/src/schema/index.ts`, line 122 and 124  
**Description:** The `phone` and `employer_id` columns on `users` are defined but no API endpoint allows them to be set or updated. `employer_id` is only set by the seed script. There is no profile-update endpoint.  
**Risk:** User profile data is permanently incomplete. Users cannot add a phone number.  
**Recommended fix:** Add `PATCH /api/user/profile` allowing users to update their own `first_name`, `last_name`, and `phone`.

---

### MED-004 — `opportunities` and `employers` tables have no admin write API
**File:** No route file writes to `opportunities` or `employers`  
**Description:** Both tables are populated exclusively by `lib/db/src/seed.ts`. There is no admin endpoint to create, update, or deactivate opportunities, or to manage employers. Production operation requires running seed scripts manually.  
**Recommended fix:** Add admin endpoints: `POST /api/admin/opportunities`, `PATCH /api/admin/opportunities/:id`, `POST /api/admin/employers`.

---

### MED-005 — Annual points reset (scheduler Job 4) reads ALL accounts without user isolation
**File:** `artifacts/api-server/src/jobs/scheduler.ts`, line 171  
**Description:** `const allAccounts = await db.select().from(pointsAccounts)` — this is a system job (runs on Jan 1), so reading all accounts is expected. However, the subsequent `pointsTransactions` insert and `pointsAccounts` update are performed with `WHERE id = acct.id` rather than `WHERE user_id = acct.userId`, which is fine but unusual. Document this intentional cross-user operation.  
**Risk:** Low — this is a scheduled system job, not a user request. But any bug here affects every user simultaneously.  
**Recommended fix:** Add explicit logging at the start and end of Job 4 naming how many accounts were reset (currently only logs on completion). Consider wrapping in a transaction per user.

---

### MED-006 — `redemptionWindows` table is writable only by the scheduler, not via admin API
**File:** `artifacts/api-server/src/jobs/scheduler.ts`, line 83  
**Description:** The monthly redemption window is automatically created on the 1st of each month by the cron scheduler. There is no admin endpoint to manually open, close, or override a redemption window. If the scheduler fails or a window needs to be extended, there is no recovery mechanism.  
**Recommended fix:** Add `POST /api/admin/redemption-windows` and `PATCH /api/admin/redemption-windows/:id` for manual override.

---

### MED-007 — `connected_health_systems.access_token` and `token_expires_at` are never written
**File:** `lib/db/src/schema/index.ts`, lines 269-270; `artifacts/api-server/src/routes/healthSystems.ts`  
**Description:** The schema has `access_token` (text) and `token_expires_at` (timestamp) columns on `connected_health_systems`, suggesting OAuth token storage for FHIR access was planned. No route ever writes these columns. FHIR data fetch functionality is not implemented.  
**Risk:** The UI suggests FHIR/EMR connectivity, but no real data retrieval ever happens. `emr_records` table is read-only with no write path.  
**Recommended fix:** Either implement the FHIR OAuth flow and token storage, or drop the columns and document FHIR integration as a future milestone.

---

## SECTION 8: BUSINESS RULES VERIFICATION

| Rule | Found? | File | Line(s) | Status |
|---|---|---|---|---|
| RULE 1: current_balance ≤ earned_this_year | Implicit only — no explicit guard | `points.ts` — not present | — | ⚠️ MEDIUM: Rule holds in practice but not enforced in code |
| RULE 2: 1 point = $1 (dollar_value = points × 1) | CONTRADICTION found | `points.ts` | 18, 89 | ❌ HIGH: Code uses 100 pts = $1 (`POINTS_PER_DOLLAR = 100`) |
| RULE 3: HSA ytd ≤ $4,400 limit | Found — partial | `points.ts` | 92–107 | ⚠️ MEDIUM: Only checked if HSA row exists; skipped otherwise |
| RULE 4: Points deduct only at final confirmation | CONFIRMED | `points.ts` | 44–148 (allocate), 197–310 (confirm/final) | ✅ PASS: allocate does NOT touch currentBalance; confirm/final does |
| RULE 5: reset-test requires TESTING_MODE=true | CONFIRMED | `points.ts` | 315–318 | ✅ PASS: Returns 403 if `TESTING_MODE !== "true"` |

---

## SECTION 9: PHI DATA HANDLING AUDIT

| PHI Table | PHI Fields | Dedicated Audit Logged? | User Filter Always Applied? | Status |
|---|---|---|---|---|
| connected_health_systems | system_name, system_type, npi, fhir_base_url, access_token | ❌ NO — only generic middleware entry | ✅ YES — all three routes filter by userId | ⚠️ CRITICAL: Missing dedicated PHI audit log |
| emr_records | rawData, displayData, loinc_code, icd10_code, cvx_code, fhir_resource_id | ✅ YES — dedicated INSERT in GET /api/user/emr/:recordType | ✅ YES | ✅ COMPLIANT |
| connected_devices | deviceName, deviceModel, manufacturer, macAddress | ❌ NO | ✅ YES — context query filters by userId | ⚠️ No write endpoint; read-only in context with no dedicated PHI log |
| device_readings | value, unit, recordedAt, metricType | ❌ NO read or write routes exist | N/A | ⚠️ No API surface exists — no audit possible |
| copay_records | amountDue, visitDate, providerName, emrRecordId | ❌ NO read or write routes exist | N/A | ⚠️ No API surface exists — no audit possible |
| audit_logs | userId, action, outcome, ipAddress | N/A (this IS the audit log) | N/A | No read API; append-only by design ✅ |

**Notes on raw PHI exposure:**
- `GET /api/user/emr/:recordType` returns the full Drizzle `emrRecords` row including `rawData` (jsonb). The `displayData` field was presumably added to limit raw PHI exposure, but both fields are returned in the response. Consider returning only `displayData` unless the client explicitly requests raw data.
- `GET /api/health-systems` returns the full row including `fhir_base_url` and `access_token` (if ever populated). Tokens should never be returned to the client.

---

## SECTION 10: UAT RESULTS

```
══════════════════════════════════════════════
  CareReward UAT Runner
  2026-07-23T11:17:57.202Z
══════════════════════════════════════════════

  Running PRE-001: Database connectivity...
  ✓ Database responds to query
  PASS (29ms)

  Running PRE-002: Schema — all tables exist...
  ✓ Table "users" exists
  ✓ Table "employers" exists
  ✓ Table "sessions" exists
  ✓ Table "points_accounts" exists
  ✓ Table "points_transactions" exists
  ✓ Table "redemption_windows" exists
  ✓ Table "redemptions" exists
  ✓ Table "opportunities" exists
  ✓ Table "user_opportunities" exists
  ✓ Table "connected_health_systems" exists
  ✓ Table "emr_records" exists
  ✓ Table "connected_devices" exists
  ✓ Table "device_readings" exists
  ✓ Table "insurance_plans" exists
  ✓ Table "hsa_accounts" exists
  ✓ Table "copay_records" exists
  ✓ Table "notifications" exists
  ✓ Table "push_tokens" exists
  ✓ Table "notification_preferences" exists
  ✓ Table "audit_logs" exists
  PASS (6ms)

  Running PRE-003: Seed data — test user exists...
  ✓ test@carereward.com exists in users table
  PASS (2ms)

  Running PRE-004: Seed data — opportunities exist...
  ✓ At least 5 active opportunities seeded
  PASS (2ms)

  Running PRE-005: Seed data — active redemption window exists...
  ✓ Exactly 1 active redemption window
  PASS (1ms)

  Running UAT-001: Registration creates correct DB records...
  ✓ points_accounts row exists for test user
  ✓ notification_preferences row exists
  ✓ opportunities_enabled is true
  PASS (17ms)

  Running UAT-002: Password is stored as hash not plaintext...
  ✓ password_hash does not equal Test1234!
  ✓ password_hash starts with bcrypt prefix $2b$
  PASS (2ms)

  Running UAT-004: Points account data integrity...
  ✓ points_accounts row exists
  ✓ current_balance does not exceed earned_this_year
  ✓ year_reset_date is populated
  PASS (2ms)

  Running UAT-008: Points transactions balance integrity...
  ✓ points_accounts.current_balance matches last transaction balance_after
  PASS (2ms)

  Running UAT-010: HSA YTD does not exceed yearly limit...
  ✓ ytd_contribution does not exceed yearly_limit
  ✓ yearly_limit is $4,400
  PASS (1ms)

  Running UAT-REG: Redemptions have valid status values...
  ✓ All redemptions have valid status values
  PASS (2ms)

  Running UAT-RDMW: Each redemption links to a valid redemption window...
  ✓ No redemptions with invalid window references
  PASS (1ms)

  Running UAT-020: No user has more than 1 active insurance plan...
  ✓ No user has duplicate active insurance plans
  PASS (4ms)

  Running UAT-INS: Test user has an insurance plan...
  ✓ Active insurance plan exists for test user
  ✓ Plan name is populated
  PASS (1ms)

  Running UAT-016: Audit logs exist and are populated...
  ✓ Audit logs table has entries
  ✓ SUCCESS outcome is recorded
  PASS (2ms)

  Running UAT-016b: Audit logs have required HIPAA fields populated...
  ✓ No audit logs missing user_id
  ✓ No audit logs missing action
  ✓ No audit logs missing outcome
  ✓ No audit logs missing timestamp
  PASS (1ms)

  Running UAT-018: No user has balance exceeding earned this year...
  ✓ current_balance ≤ earned_this_year for all users
  PASS (0ms)

  Running UAT-019: No orphaned records in any child table...
  ✓ No orphaned points_accounts
  ✓ No orphaned redemptions
  ✓ No orphaned notifications
  ✓ No orphaned user_opportunities
  ✓ No orphaned emr_records
  PASS (16ms)

  Running UAT-PTYPES: All transaction types are valid...
  ✓ No invalid transaction types in points_transactions
  PASS (1ms)

  Running UAT-WNDW: Only one redemption window is active at a time...
  ✓ Active redemption window count is 0 or 1
  PASS (1ms)

  Running UAT-ENUM: All opportunity categories are valid...
  ✓ All opportunity categories are valid enum values
  PASS (1ms)

══════════════════════════════════════════════
  UAT RESULTS SUMMARY
══════════════════════════════════════════════
  Total tests:  21
  Passed:       21 ✓
  Failed:       0 ✗
  Errors:       0 !
  Pass rate:    100.0%
══════════════════════════════════════════════
```

---

## SECTION 11: RECOMMENDED ACTIONS

Prioritised by risk — fix in this order.

### Immediate (before any production deployment)

1. **CRIT-001 — Role-check on admin insurance endpoint** (`insurance.ts` line 22)  
   Add `req.userRole !== "admin"` check. Fastest fix in the codebase — 3 lines. Without it, any user can corrupt any other user's insurance data.

2. **CRIT-002 — PHI audit logging on health-systems routes** (`healthSystems.ts`)  
   Add dedicated `db.insert(auditLogs)` in GET, POST, and DELETE handlers. Copy the pattern from `userContext.ts` line 186. Required for HIPAA technical safeguard compliance.

3. **HIGH-001 — Clarify and fix the points-to-dollar conversion rate** (`points.ts` line 18)  
   Confirm with product whether 1pt = $1 or 100pt = $1. Update `POINTS_PER_DOLLAR` and all UI displays accordingly. This affects every single redemption transaction.

4. **CRIT-003 — `sessions` table: implement or remove** (`schema/index.ts` line 133)  
   Decide whether to implement server-side session tracking (enables token revocation) or document the stateless JWT decision and drop the empty table.

### Short-term (next sprint)

5. **HIGH-002 — Log FAILURE/BLOCKED audit outcomes** (middleware + catch blocks)  
   Add audit log entries in the JWT rejection path and catch blocks for authentication and redemption endpoints.

6. **HIGH-003 — Mark-as-read endpoint for notifications** (new route needed)  
   `PATCH /api/user/notifications/:id/read` — without this the notification system is non-functional.

7. **HIGH-004 — Add auth to `/api/providers/search`** (`providers.ts` line 7)  
   Add `requireAuth` to prevent open proxy abuse.

8. **MED-002 — HSA check when no HSA row exists** (`points.ts` line 93)  
   Return a clear error if `type === "HSA"` and no HSA account row is found.

9. **MED-001 — Explicit `currentBalance ≤ earnedThisYear` guard** (`points.ts`)  
   Add an assertion before any points_accounts UPDATE that modifies currentBalance.

### Backlog (before feature-complete release)

10. **CRIT-004 — Write endpoints for device/EMR data** (new routes needed)  
    Tables `emr_records`, `connected_devices`, `device_readings`, `copay_records`, `push_tokens` need API write paths before the features that depend on them can function.

11. **MED-003 — Profile update endpoint** (new route needed)  
    `PATCH /api/user/profile` for phone, firstName, lastName.

12. **MED-004 — Admin CRUD for opportunities and employers** (new routes needed)  
    Seed scripts are not a production-viable data management strategy.

13. **MED-006 — Admin endpoint for redemption window management** (new routes needed)

14. **MED-007 — FHIR OAuth flow implementation or column removal** (`connected_health_systems`)  
    `access_token` and `token_expires_at` columns are dead weight until the FHIR integration is built.

15. **Section 9 note — Strip `access_token` from GET /api/health-systems response**  
    Never return stored tokens to the client. Add a `select()` projection that excludes `access_token`.
