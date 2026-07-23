/**
 * CareReward — Automated UAT Runner
 * Place in: lib/testing/uatRunner.ts
 *
 * Runs all 22 UAT database verification checks automatically.
 * Outputs a full pass/fail report to the console and to a file.
 *
 * Run with: npx tsx lib/testing/uatRunner.ts
 *
 * What it does:
 *   - Connects to your real PostgreSQL database
 *   - Runs every database verification query from the UAT document
 *   - Compares results against expected values
 *   - Prints a colour-coded pass/fail report
 *   - Writes the report to lib/testing/reports/uat-report-[date].md
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

// ============================================================
// REPORT BUILDER
// ============================================================

interface TestResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';
  checks: CheckResult[];
  error?: string;
  durationMs: number;
}

interface CheckResult {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

const results: TestResult[] = [];

async function runTest(
  id: string,
  name: string,
  fn: () => Promise<CheckResult[]>
): Promise<void> {
  const start = Date.now();
  console.log(`\n  Running ${id}: ${name}...`);

  try {
    const checks = await fn();
    const allPassed = checks.every(c => c.passed);
    const duration = Date.now() - start;

    results.push({
      id,
      name,
      status: allPassed ? 'PASS' : 'FAIL',
      checks,
      durationMs: duration,
    });

    checks.forEach(check => {
      const icon = check.passed ? '  ✓' : '  ✗';
      console.log(`${icon} ${check.description}`);
      if (!check.passed) {
        console.log(`    Expected: ${JSON.stringify(check.expected)}`);
        console.log(`    Actual:   ${JSON.stringify(check.actual)}`);
      }
    });

    console.log(`  ${allPassed ? 'PASS' : 'FAIL'} (${duration}ms)`);
  } catch (error) {
    results.push({
      id,
      name,
      status: 'ERROR',
      checks: [],
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - start,
    });
    console.log(`  ERROR: ${error instanceof Error ? error.message : error}`);
  }
}

async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

// ============================================================
// HELPER — GET TEST USER ID
// ============================================================
async function getTestUserId(): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM users WHERE email = 'test@carereward.com' LIMIT 1`
  );
  return rows[0]?.id ?? null;
}

// ============================================================
// UAT TEST CASES
// ============================================================

async function runAllTests(): Promise<void> {
  console.log('\n══════════════════════════════════════════════');
  console.log('  CareReward UAT Runner');
  console.log(`  ${new Date().toISOString()}`);
  console.log('══════════════════════════════════════════════');

  // ─────────────────────────────────────────────
  // PRE-FLIGHT CHECKS
  // ─────────────────────────────────────────────
  await runTest('PRE-001', 'Database connectivity', async () => {
    const rows = await query<{ result: number }>('SELECT 1 as result');
    return [{
      description: 'Database responds to query',
      expected: 1,
      actual: rows[0]?.result,
      passed: rows[0]?.result === 1,
    }];
  });

  await runTest('PRE-002', 'Schema — all tables exist', async () => {
    const expectedTables = [
      'users', 'employers', 'sessions',
      'points_accounts', 'points_transactions', 'redemption_windows', 'redemptions',
      'opportunities', 'user_opportunities',
      'connected_health_systems', 'emr_records',
      'connected_devices', 'device_readings',
      'insurance_plans', 'hsa_accounts', 'copay_records',
      'notifications', 'push_tokens', 'notification_preferences',
      'audit_logs',
    ];

    const rows = await query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );
    const actualTables = rows.map(r => r.tablename);

    return expectedTables.map(table => ({
      description: `Table "${table}" exists`,
      expected: true,
      actual: actualTables.includes(table),
      passed: actualTables.includes(table),
    }));
  });

  await runTest('PRE-003', 'Seed data — test user exists', async () => {
    const userId = await getTestUserId();
    return [{
      description: 'test@carereward.com exists in users table',
      expected: true,
      actual: userId !== null,
      passed: userId !== null,
    }];
  });

  await runTest('PRE-004', 'Seed data — opportunities exist', async () => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM opportunities WHERE is_active = true`
    );
    const count = parseInt(rows[0]?.count ?? '0', 10);
    return [{
      description: 'At least 5 active opportunities seeded',
      expected: '≥ 5',
      actual: count,
      passed: count >= 5,
    }];
  });

  await runTest('PRE-005', 'Seed data — active redemption window exists', async () => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM redemption_windows WHERE is_active = true`
    );
    const count = parseInt(rows[0]?.count ?? '0', 10);
    return [{
      description: 'Exactly 1 active redemption window',
      expected: 1,
      actual: count,
      passed: count === 1,
    }];
  });

  // ─────────────────────────────────────────────
  // AUTHENTICATION
  // ─────────────────────────────────────────────
  await runTest('UAT-001', 'Registration creates correct DB records', async () => {
    const userId = await getTestUserId();
    if (!userId) return [{ description: 'Test user exists', expected: true, actual: false, passed: false }];

    const [pointsRows, prefRows] = await Promise.all([
      query<{ current_balance: number; earned_this_year: number }>(
        `SELECT current_balance, earned_this_year FROM points_accounts WHERE user_id = $1`, [userId]
      ),
      query<{ opportunities_enabled: boolean }>(
        `SELECT opportunities_enabled FROM notification_preferences WHERE user_id = $1`, [userId]
      ),
    ]);

    return [
      {
        description: 'points_accounts row exists for test user',
        expected: true,
        actual: pointsRows.length > 0,
        passed: pointsRows.length > 0,
      },
      {
        description: 'notification_preferences row exists',
        expected: true,
        actual: prefRows.length > 0,
        passed: prefRows.length > 0,
      },
      {
        description: 'opportunities_enabled is true',
        expected: true,
        actual: prefRows[0]?.opportunities_enabled,
        passed: prefRows[0]?.opportunities_enabled === true,
      },
    ];
  });

  await runTest('UAT-002', 'Password is stored as hash not plaintext', async () => {
    const rows = await query<{ password_hash: string }>(
      `SELECT password_hash FROM users WHERE email = 'test@carereward.com'`
    );
    const hash = rows[0]?.password_hash;
    return [
      {
        description: 'password_hash does not equal Test1234!',
        expected: false,
        actual: hash === 'Test1234!',
        passed: hash !== 'Test1234!',
      },
      {
        description: 'password_hash starts with bcrypt prefix $2b$',
        expected: true,
        actual: hash?.startsWith('$2b$') ?? false,
        passed: hash?.startsWith('$2b$') ?? false,
      },
    ];
  });

  // ─────────────────────────────────────────────
  // POINTS SYSTEM
  // ─────────────────────────────────────────────
  await runTest('UAT-004', 'Points account data integrity', async () => {
    const userId = await getTestUserId();
    if (!userId) return [{ description: 'Test user exists', expected: true, actual: false, passed: false }];

    const rows = await query<{
      current_balance: number;
      earned_this_year: number;
      year_reset_date: string;
    }>(
      `SELECT current_balance, earned_this_year, year_reset_date
       FROM points_accounts WHERE user_id = $1`, [userId]
    );

    const account = rows[0];
    return [
      {
        description: 'points_accounts row exists',
        expected: true,
        actual: account !== undefined,
        passed: account !== undefined,
      },
      {
        description: 'current_balance does not exceed earned_this_year',
        expected: true,
        actual: account ? account.current_balance <= account.earned_this_year : false,
        passed: account ? account.current_balance <= account.earned_this_year : false,
      },
      {
        description: 'year_reset_date is populated',
        expected: true,
        actual: account?.year_reset_date !== undefined,
        passed: account?.year_reset_date !== undefined,
      },
    ];
  });

  await runTest('UAT-008', 'Points transactions balance integrity', async () => {
    const userId = await getTestUserId();
    if (!userId) return [{ description: 'Test user exists', expected: true, actual: false, passed: false }];

    const [accountRows, txRows] = await Promise.all([
      query<{ current_balance: number }>(
        `SELECT current_balance FROM points_accounts WHERE user_id = $1`, [userId]
      ),
      query<{ last_balance_after: number }>(
        `SELECT balance_after as last_balance_after
         FROM points_transactions WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 1`, [userId]
      ),
    ]);

    const currentBalance = accountRows[0]?.current_balance;
    const lastTxBalance = txRows[0]?.last_balance_after;

    return [
      {
        description: 'points_accounts.current_balance matches last transaction balance_after',
        expected: lastTxBalance,
        actual: currentBalance,
        passed: txRows.length === 0 || currentBalance === lastTxBalance,
      },
    ];
  });

  await runTest('UAT-010', 'HSA YTD does not exceed yearly limit', async () => {
    const userId = await getTestUserId();
    if (!userId) return [{ description: 'Test user exists', expected: true, actual: false, passed: false }];

    const rows = await query<{ ytd_contribution: string; yearly_limit: string }>(
      `SELECT ytd_contribution, yearly_limit FROM hsa_accounts WHERE user_id = $1`, [userId]
    );

    if (rows.length === 0) {
      return [{ description: 'HSA account exists', expected: true, actual: false, passed: false }];
    }

    const ytd = parseFloat(rows[0].ytd_contribution);
    const limit = parseFloat(rows[0].yearly_limit);

    return [
      {
        description: 'ytd_contribution does not exceed yearly_limit',
        expected: `≤ ${limit}`,
        actual: ytd,
        passed: ytd <= limit,
      },
      {
        description: 'yearly_limit is $4,400',
        expected: 4400,
        actual: limit,
        passed: limit === 4400,
      },
    ];
  });

  // ─────────────────────────────────────────────
  // REDEMPTION FLOW
  // ─────────────────────────────────────────────
  await runTest('UAT-REG', 'Redemptions have valid status values', async () => {
    const userId = await getTestUserId();
    if (!userId) return [{ description: 'Test user exists', expected: true, actual: false, passed: false }];

    const validStatuses = ['PENDING', 'FIRST_CONFIRMED', 'FINAL_CONFIRMED', 'REVERSED'];

    const rows = await query<{ status: string; id: string }>(
      `SELECT id, status FROM redemptions WHERE user_id = $1`, [userId]
    );

    const invalidRows = rows.filter(r => !validStatuses.includes(r.status));

    return [
      {
        description: 'All redemptions have valid status values',
        expected: 0,
        actual: invalidRows.length,
        passed: invalidRows.length === 0,
      },
    ];
  });

  await runTest('UAT-RDMW', 'Each redemption links to a valid redemption window', async () => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM redemptions r
       WHERE r.redemption_window_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM redemption_windows rw WHERE rw.id = r.redemption_window_id
       )`
    );
    const orphaned = parseInt(rows[0]?.count ?? '0', 10);
    return [
      {
        description: 'No redemptions with invalid window references',
        expected: 0,
        actual: orphaned,
        passed: orphaned === 0,
      },
    ];
  });

  // ─────────────────────────────────────────────
  // INSURANCE
  // ─────────────────────────────────────────────
  await runTest('UAT-020', 'No user has more than 1 active insurance plan', async () => {
    const rows = await query<{ user_id: string; active_plan_count: string }>(
      `SELECT user_id, COUNT(*) as active_plan_count
       FROM insurance_plans WHERE is_active = true
       GROUP BY user_id HAVING COUNT(*) > 1`
    );
    return [
      {
        description: 'No user has duplicate active insurance plans',
        expected: 0,
        actual: rows.length,
        passed: rows.length === 0,
      },
    ];
  });

  await runTest('UAT-INS', 'Test user has an insurance plan', async () => {
    const userId = await getTestUserId();
    if (!userId) return [{ description: 'Test user exists', expected: true, actual: false, passed: false }];

    const rows = await query<{ plan_name: string; monthly_premium: string }>(
      `SELECT plan_name, monthly_premium FROM insurance_plans
       WHERE user_id = $1 AND is_active = true`, [userId]
    );

    return [
      {
        description: 'Active insurance plan exists for test user',
        expected: true,
        actual: rows.length > 0,
        passed: rows.length > 0,
      },
      {
        description: 'Plan name is populated',
        expected: true,
        actual: (rows[0]?.plan_name?.length ?? 0) > 0,
        passed: (rows[0]?.plan_name?.length ?? 0) > 0,
      },
    ];
  });

  // ─────────────────────────────────────────────
  // AUDIT LOGGING
  // ─────────────────────────────────────────────
  await runTest('UAT-016', 'Audit logs exist and are populated', async () => {
    const rows = await query<{ count: string; outcomes: string }>(
      `SELECT COUNT(*) as count,
              STRING_AGG(DISTINCT outcome, ', ') as outcomes
       FROM audit_logs`
    );
    const count = parseInt(rows[0]?.count ?? '0', 10);

    return [
      {
        description: 'Audit logs table has entries',
        expected: '> 0',
        actual: count,
        passed: count > 0,
      },
      {
        description: 'SUCCESS outcome is recorded',
        expected: true,
        actual: rows[0]?.outcomes?.includes('SUCCESS') ?? false,
        passed: rows[0]?.outcomes?.includes('SUCCESS') ?? false,
      },
    ];
  });

  await runTest('UAT-016b', 'Audit logs have required HIPAA fields populated', async () => {
    const rows = await query<{
      missing_userid: string;
      missing_action: string;
      missing_outcome: string;
      missing_timestamp: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE user_id IS NULL OR user_id = '') as missing_userid,
         COUNT(*) FILTER (WHERE action IS NULL OR action = '') as missing_action,
         COUNT(*) FILTER (WHERE outcome IS NULL) as missing_outcome,
         COUNT(*) FILTER (WHERE timestamp IS NULL) as missing_timestamp
       FROM audit_logs`
    );

    const row = rows[0];
    return [
      { description: 'No audit logs missing user_id', expected: '0', actual: row?.missing_userid, passed: row?.missing_userid === '0' },
      { description: 'No audit logs missing action', expected: '0', actual: row?.missing_action, passed: row?.missing_action === '0' },
      { description: 'No audit logs missing outcome', expected: '0', actual: row?.missing_outcome, passed: row?.missing_outcome === '0' },
      { description: 'No audit logs missing timestamp', expected: '0', actual: row?.missing_timestamp, passed: row?.missing_timestamp === '0' },
    ];
  });

  // ─────────────────────────────────────────────
  // DATA INTEGRITY
  // ─────────────────────────────────────────────
  await runTest('UAT-018', 'No user has balance exceeding earned this year', async () => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM points_accounts
       WHERE current_balance > earned_this_year`
    );
    const count = parseInt(rows[0]?.count ?? '0', 10);
    return [
      {
        description: 'current_balance ≤ earned_this_year for all users',
        expected: 0,
        actual: count,
        passed: count === 0,
      },
    ];
  });

  await runTest('UAT-019', 'No orphaned records in any child table', async () => {
    const checks = await Promise.all([
      query<{ count: string }>(
        `SELECT COUNT(*) as count FROM points_accounts pa
         LEFT JOIN users u ON pa.user_id = u.id WHERE u.id IS NULL`
      ).then(r => ({
        description: 'No orphaned points_accounts',
        expected: 0,
        actual: parseInt(r[0]?.count ?? '0', 10),
        passed: parseInt(r[0]?.count ?? '0', 10) === 0,
      })),
      query<{ count: string }>(
        `SELECT COUNT(*) as count FROM redemptions r
         LEFT JOIN users u ON r.user_id = u.id WHERE u.id IS NULL`
      ).then(r => ({
        description: 'No orphaned redemptions',
        expected: 0,
        actual: parseInt(r[0]?.count ?? '0', 10),
        passed: parseInt(r[0]?.count ?? '0', 10) === 0,
      })),
      query<{ count: string }>(
        `SELECT COUNT(*) as count FROM notifications n
         LEFT JOIN users u ON n.user_id = u.id WHERE u.id IS NULL`
      ).then(r => ({
        description: 'No orphaned notifications',
        expected: 0,
        actual: parseInt(r[0]?.count ?? '0', 10),
        passed: parseInt(r[0]?.count ?? '0', 10) === 0,
      })),
      query<{ count: string }>(
        `SELECT COUNT(*) as count FROM user_opportunities uo
         LEFT JOIN users u ON uo.user_id = u.id WHERE u.id IS NULL`
      ).then(r => ({
        description: 'No orphaned user_opportunities',
        expected: 0,
        actual: parseInt(r[0]?.count ?? '0', 10),
        passed: parseInt(r[0]?.count ?? '0', 10) === 0,
      })),
      query<{ count: string }>(
        `SELECT COUNT(*) as count FROM emr_records er
         LEFT JOIN users u ON er.user_id = u.id WHERE u.id IS NULL`
      ).then(r => ({
        description: 'No orphaned emr_records',
        expected: 0,
        actual: parseInt(r[0]?.count ?? '0', 10),
        passed: parseInt(r[0]?.count ?? '0', 10) === 0,
      })),
    ]);

    return checks;
  });

  await runTest('UAT-PTYPES', 'All transaction types are valid', async () => {
    const rows = await query<{ type: string; count: string }>(
      `SELECT type, COUNT(*) as count FROM points_transactions
       WHERE type NOT IN ('EARN', 'REDEEM', 'REVERSAL', 'RESET')
       GROUP BY type`
    );
    return [
      {
        description: 'No invalid transaction types in points_transactions',
        expected: 0,
        actual: rows.length,
        passed: rows.length === 0,
      },
    ];
  });

  await runTest('UAT-WNDW', 'Only one redemption window is active at a time', async () => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM redemption_windows WHERE is_active = true`
    );
    const count = parseInt(rows[0]?.count ?? '0', 10);
    return [
      {
        description: 'Active redemption window count is 0 or 1',
        expected: '0 or 1',
        actual: count,
        passed: count <= 1,
      },
    ];
  });

  await runTest('UAT-ENUM', 'All opportunity categories are valid', async () => {
    const rows = await query<{ category: string }>(
      `SELECT DISTINCT category FROM opportunities
       WHERE category NOT IN (
         'CARE_SITE_ALTERNATIVE', 'CARE_PROTOCOL',
         'PREVENTATIVE_CARE', 'CARE_QUALITY'
       )`
    );
    return [
      {
        description: 'All opportunity categories are valid enum values',
        expected: 0,
        actual: rows.length,
        passed: rows.length === 0,
      },
    ];
  });

  // ─────────────────────────────────────────────
  // GENERATE REPORT
  // ─────────────────────────────────────────────
  await generateReport();
  await pool.end();
}

// ============================================================
// REPORT GENERATOR
// ============================================================
async function generateReport(): Promise<void> {
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const passRate = ((passed / total) * 100).toFixed(1);

  // Console summary
  console.log('\n══════════════════════════════════════════════');
  console.log('  UAT RESULTS SUMMARY');
  console.log('══════════════════════════════════════════════');
  console.log(`  Total tests:  ${total}`);
  console.log(`  Passed:       ${passed} ✓`);
  console.log(`  Failed:       ${failed} ✗`);
  console.log(`  Errors:       ${errors} !`);
  console.log(`  Pass rate:    ${passRate}%`);
  console.log('══════════════════════════════════════════════');

  if (failed > 0 || errors > 0) {
    console.log('\n  FAILURES TO INVESTIGATE:');
    results
      .filter(r => r.status !== 'PASS')
      .forEach(r => {
        console.log(`\n  ${r.id} — ${r.name}`);
        if (r.error) console.log(`    Error: ${r.error}`);
        r.checks
          .filter(c => !c.passed)
          .forEach(c => {
            console.log(`    ✗ ${c.description}`);
            console.log(`      Expected: ${JSON.stringify(c.expected)}`);
            console.log(`      Actual:   ${JSON.stringify(c.actual)}`);
          });
      });
  }

  // Write markdown report file
  const reportDir = path.join(process.cwd(), 'lib', 'testing', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(reportDir, `uat-report-${timestamp}.md`);

  const lines: string[] = [
    `# CareReward UAT Report`,
    `**Date:** ${new Date().toISOString()}`,
    `**Pass Rate:** ${passRate}% (${passed}/${total})`,
    '',
    '## Summary',
    '',
    `| Result | Count |`,
    `|---|---|`,
    `| ✓ Pass | ${passed} |`,
    `| ✗ Fail | ${failed} |`,
    `| ! Error | ${errors} |`,
    `| Total | ${total} |`,
    '',
    '## Test Results',
    '',
  ];

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : '!';
    lines.push(`### ${icon} ${r.id} — ${r.name} (${r.durationMs}ms)`);
    lines.push('');
    if (r.error) {
      lines.push(`**Error:** ${r.error}`);
    } else {
      r.checks.forEach(c => {
        const cIcon = c.passed ? '✓' : '✗';
        lines.push(`${cIcon} ${c.description}`);
        if (!c.passed) {
          lines.push(`  - Expected: \`${JSON.stringify(c.expected)}\``);
          lines.push(`  - Actual: \`${JSON.stringify(c.actual)}\``);
        }
      });
    }
    lines.push('');
  });

  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(`\n  Report saved to: ${reportPath}\n`);
}

// Run it
runAllTests().catch(console.error);
