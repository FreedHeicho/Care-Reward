---
name: API response shapes
description: Actual field names returned by the CareReward API — differ from what you might expect
---

## POST /api/auth/login
Returns `{ accessToken, refreshToken, user }` — NOT `{ token, user }`.

## GET /api/user/context
```
{
  user: { id, firstName, lastName, email },
  points: {
    account: { currentBalance, earnedThisYear, yearResetDate },
    recentTransactions: []
  },
  activeRedemptionWindow: { id, windowStart, windowEnd, isActive },
  insurancePlan: { planName, monthlyPremium, deductible, ... },
  hsaAccount: { yearlyLimit, ytdContribution, currentBalance },
  opportunityCounts: [{ status, count }]
}
```
**NOT** `{ pointsAccount, redemptionWindow }` — use `points.account` and `activeRedemptionWindow`.

## GET /api/user/opportunities
Returns an array of user_opportunity rows with the system opportunity nested:
```
[{
  id, userId, opportunityId, status, assignedAt,
  opportunity: { id, title, description, category, pointsValue, isActive }
}]
```
Access the display data via `item.opportunity.title`, `item.opportunity.pointsValue`, etc.

**Why:** The API was built before mobile types were finalised. The nesting makes sense (user_opportunity → opportunity join), but the field names catch you off guard.

**How to apply:** Whenever adding a new API endpoint in the mobile app, curl the endpoint with the real token first and check the actual JSON before writing TypeScript types.
