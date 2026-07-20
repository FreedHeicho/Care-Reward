import {
  boolean,
  date,
  decimal,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "employer_admin",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "EARN",
  "REDEEM",
  "REVERSAL",
  "RESET",
]);
export const transactionSourceEnum = pgEnum("transaction_source", [
  "OPPORTUNITY",
  "MANUAL_RESET",
  "YEAR_RESET",
]);
export const redemptionTypeEnum = pgEnum("redemption_type", [
  "PREMIUM",
  "HSA",
  "GIFTCARD",
  "COPAY",
]);
export const redemptionStatusEnum = pgEnum("redemption_status", [
  "PENDING",
  "FIRST_CONFIRMED",
  "FINAL_CONFIRMED",
  "REVERSED",
]);
export const opportunityCategoryEnum = pgEnum("opportunity_category", [
  "CARE_SITE_ALTERNATIVE",
  "CARE_PROTOCOL",
  "PREVENTATIVE_CARE",
  "CARE_QUALITY",
]);
export const opportunityStatusEnum = pgEnum("opportunity_status", [
  "AVAILABLE",
  "UPCOMING",
  "COMPLETED",
  "MISSED",
]);
export const healthSystemTypeEnum = pgEnum("health_system_type", [
  "HOSPITAL",
  "CLINIC",
  "PHARMACY",
  "PROVIDER",
]);
export const connectionStatusEnum = pgEnum("connection_status", [
  "CONNECTED",
  "DISCONNECTED",
  "PENDING",
  "ERROR",
]);
export const emrRecordTypeEnum = pgEnum("emr_record_type", [
  "IMMUNIZATION",
  "VISIT",
  "LAB_RESULT",
  "MEDICATION",
]);
export const deviceTypeEnum = pgEnum("device_type", [
  "BLOOD_PRESSURE",
  "GLUCOSE",
  "OXYGEN",
  "HEART_RATE",
  "STRESS",
]);
export const connectionTypeEnum = pgEnum("connection_type", [
  "BLUETOOTH",
  "WIFI",
  "NFC",
]);
export const platformEnum = pgEnum("platform", ["IOS", "ANDROID"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "OPPORTUNITY_AVAILABLE",
  "OPPORTUNITY_EXPIRING",
  "REDEMPTION_WINDOW_OPEN",
  "REDEMPTION_WINDOW_CLOSING",
  "DEVICE_READING_ALERT",
  "POINTS_EARNED",
  "SYNC_COMPLETE",
]);
export const auditOutcomeEnum = pgEnum("audit_outcome", [
  "SUCCESS",
  "FAILURE",
  "BLOCKED",
]);

// ─── Group 1: Users ───────────────────────────────────────────────────────────

export const employers = pgTable("employers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  planType: varchar("plan_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    employerId: uuid("employer_id").references(() => employers.id),
    role: userRoleEnum("role").default("user"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    lastLoginAt: timestamp("last_login_at"),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    jwtTokenHash: varchar("jwt_token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    deviceInfo: jsonb("device_info"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

// ─── Group 2: Points ──────────────────────────────────────────────────────────

export const pointsAccounts = pgTable("points_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique()
    .notNull(),
  currentBalance: integer("current_balance").default(0).notNull(),
  earnedThisYear: integer("earned_this_year").default(0).notNull(),
  yearResetDate: date("year_reset_date").notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export const pointsTransactions = pgTable(
  "points_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    type: transactionTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    source: transactionSourceEnum("source").notNull(),
    opportunityId: uuid("opportunity_id"),
    redemptionId: uuid("redemption_id"),
    description: text("description"),
    balanceAfter: integer("balance_after").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("points_tx_user_id_idx").on(t.userId),
    index("points_tx_created_at_idx").on(t.createdAt),
  ],
);

export const redemptionWindows = pgTable("redemption_windows", {
  id: uuid("id").primaryKey().defaultRandom(),
  windowStart: date("window_start").notNull(),
  windowEnd: date("window_end").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const redemptions = pgTable(
  "redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    type: redemptionTypeEnum("type").notNull(),
    pointsRedeemed: integer("points_redeemed").notNull(),
    dollarValue: decimal("dollar_value", { precision: 10, scale: 2 }).notNull(),
    status: redemptionStatusEnum("status").default("PENDING"),
    storeUrl: text("store_url"),
    redemptionWindowId: uuid("redemption_window_id").references(
      () => redemptionWindows.id,
    ),
    firstConfirmedAt: timestamp("first_confirmed_at"),
    finalConfirmedAt: timestamp("final_confirmed_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("redemptions_user_id_idx").on(t.userId)],
);

// ─── Group 3: Opportunities ───────────────────────────────────────────────────

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: opportunityCategoryEnum("category").notNull(),
  subCategory: varchar("sub_category", { length: 100 }),
  pointsValue: integer("points_value").notNull(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userOpportunities = pgTable(
  "user_opportunities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    opportunityId: uuid("opportunity_id")
      .references(() => opportunities.id)
      .notNull(),
    status: opportunityStatusEnum("status").default("AVAILABLE"),
    assignedAt: timestamp("assigned_at").defaultNow(),
    windowStart: date("window_start"),
    windowEnd: date("window_end"),
    completedAt: timestamp("completed_at"),
    missedAt: timestamp("missed_at"),
    pointsAwarded: integer("points_awarded"),
  },
  (t) => [
    index("user_opp_user_id_idx").on(t.userId),
    index("user_opp_status_idx").on(t.status),
  ],
);

// ─── Group 4: EMR ─────────────────────────────────────────────────────────────

export const connectedHealthSystems = pgTable(
  "connected_health_systems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    systemName: varchar("system_name", { length: 255 }).notNull(),
    systemType: healthSystemTypeEnum("system_type").notNull(),
    npi: varchar("npi", { length: 10 }),
    fhirBaseUrl: text("fhir_base_url"),
    connectionStatus: connectionStatusEnum("connection_status").default(
      "PENDING",
    ),
    accessToken: text("access_token"),
    tokenExpiresAt: timestamp("token_expires_at"),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("health_sys_user_id_idx").on(t.userId)],
);

export const emrRecords = pgTable(
  "emr_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    healthSystemId: uuid("health_system_id")
      .references(() => connectedHealthSystems.id)
      .notNull(),
    recordType: emrRecordTypeEnum("record_type").notNull(),
    fhirResourceType: varchar("fhir_resource_type", { length: 100 }).notNull(),
    fhirResourceId: varchar("fhir_resource_id", { length: 255 }).notNull(),
    loincCode: varchar("loinc_code", { length: 50 }),
    icd10Code: varchar("icd10_code", { length: 20 }),
    cvxCode: varchar("cvx_code", { length: 10 }),
    rawData: jsonb("raw_data").notNull(),
    displayData: jsonb("display_data").notNull(),
    recordDate: date("record_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [
    index("emr_user_id_idx").on(t.userId),
    index("emr_record_type_idx").on(t.recordType),
  ],
);

// ─── Group 5: Devices ─────────────────────────────────────────────────────────

export const connectedDevices = pgTable(
  "connected_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    deviceType: deviceTypeEnum("device_type").notNull(),
    deviceName: varchar("device_name", { length: 255 }).notNull(),
    deviceModel: varchar("device_model", { length: 255 }),
    manufacturer: varchar("manufacturer", { length: 255 }),
    connectionType: connectionTypeEnum("connection_type").notNull(),
    macAddress: varchar("mac_address", { length: 50 }),
    isActive: boolean("is_active").default(true),
    lastConnectedAt: timestamp("last_connected_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("devices_user_id_idx").on(t.userId)],
);

export const deviceReadings = pgTable(
  "device_readings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    deviceId: uuid("device_id")
      .references(() => connectedDevices.id)
      .notNull(),
    metricType: varchar("metric_type", { length: 100 }).notNull(),
    value: decimal("value", { precision: 10, scale: 3 }).notNull(),
    unit: varchar("unit", { length: 50 }).notNull(),
    recordedAt: timestamp("recorded_at").notNull(),
    syncedAt: timestamp("synced_at").defaultNow(),
    isFlagged: boolean("is_flagged").default(false),
  },
  (t) => [
    index("readings_user_id_idx").on(t.userId),
    index("readings_recorded_at_idx").on(t.recordedAt),
  ],
);

// ─── Group 6: Insurance ───────────────────────────────────────────────────────

export const insurancePlans = pgTable("insurance_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  planName: varchar("plan_name", { length: 255 }).notNull(),
  monthlyPremium: decimal("monthly_premium", {
    precision: 10,
    scale: 2,
  }).notNull(),
  employerId: uuid("employer_id").references(() => employers.id),
  deductible: decimal("deductible", { precision: 10, scale: 2 }),
  effectiveDate: date("effective_date").notNull(),
  expirationDate: date("expiration_date").notNull(),
  isActive: boolean("is_active").default(true),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export const hsaAccounts = pgTable("hsa_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique()
    .notNull(),
  yearlyLimit: decimal("yearly_limit", { precision: 10, scale: 2 }).default(
    "4400.00",
  ),
  ytdContribution: decimal("ytd_contribution", {
    precision: 10,
    scale: 2,
  }).default("0.00"),
  currentBalance: decimal("current_balance", {
    precision: 10,
    scale: 2,
  }).default("0.00"),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export const copayRecords = pgTable("copay_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  providerName: varchar("provider_name", { length: 255 }),
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }).notNull(),
  visitDate: date("visit_date").notNull(),
  status: varchar("status", { length: 50 }).default("PENDING"),
  emrRecordId: uuid("emr_record_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Group 7: Notifications ───────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    deepLink: text("deep_link"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    readAt: timestamp("read_at"),
  },
  (t) => [
    index("notif_user_id_idx").on(t.userId),
    index("notif_is_read_idx").on(t.isRead),
  ],
);

export const pushTokens = pgTable(
  "push_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    token: text("token").notNull(),
    platform: platformEnum("platform").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("push_tokens_user_id_idx").on(t.userId)],
);

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique()
    .notNull(),
  opportunitiesEnabled: boolean("opportunities_enabled").default(true),
  redemptionWindowEnabled: boolean("redemption_window_enabled").default(true),
  deviceAlertsEnabled: boolean("device_alerts_enabled").default(true),
  pointsUpdatesEnabled: boolean("points_updates_enabled").default(true),
});

// ─── Group 8: Audit (INSERT ONLY — no UPDATE or DELETE) ───────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", { length: 100 }).notNull(),
    resourceId: uuid("resource_id"),
    ipAddress: varchar("ip_address", { length: 50 }),
    deviceInfo: jsonb("device_info"),
    outcome: auditOutcomeEnum("outcome").notNull(),
    failureReason: text("failure_reason"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (t) => [
    index("audit_user_id_idx").on(t.userId),
    index("audit_timestamp_idx").on(t.timestamp),
    index("audit_action_idx").on(t.action),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  employer: one(employers, {
    fields: [users.employerId],
    references: [employers.id],
  }),
  pointsAccount: one(pointsAccounts, {
    fields: [users.id],
    references: [pointsAccounts.userId],
  }),
  hsaAccount: one(hsaAccounts, {
    fields: [users.id],
    references: [hsaAccounts.userId],
  }),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  sessions: many(sessions),
  pointsTransactions: many(pointsTransactions),
  redemptions: many(redemptions),
  userOpportunities: many(userOpportunities),
  connectedHealthSystems: many(connectedHealthSystems),
  emrRecords: many(emrRecords),
  connectedDevices: many(connectedDevices),
  deviceReadings: many(deviceReadings),
  insurancePlans: many(insurancePlans),
  copayRecords: many(copayRecords),
  notifications: many(notifications),
  pushTokens: many(pushTokens),
}));

export const employersRelations = relations(employers, ({ many }) => ({
  users: many(users),
}));

export const connectedHealthSystemsRelations = relations(
  connectedHealthSystems,
  ({ one, many }) => ({
    user: one(users, {
      fields: [connectedHealthSystems.userId],
      references: [users.id],
    }),
    emrRecords: many(emrRecords),
  }),
);

export const connectedDevicesRelations = relations(
  connectedDevices,
  ({ one, many }) => ({
    user: one(users, {
      fields: [connectedDevices.userId],
      references: [users.id],
    }),
    readings: many(deviceReadings),
  }),
);

export const userOpportunitiesRelations = relations(
  userOpportunities,
  ({ one }) => ({
    user: one(users, {
      fields: [userOpportunities.userId],
      references: [users.id],
    }),
    opportunity: one(opportunities, {
      fields: [userOpportunities.opportunityId],
      references: [opportunities.id],
    }),
  }),
);
