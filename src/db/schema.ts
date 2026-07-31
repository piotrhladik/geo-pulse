import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  plan: varchar("plan", { length: 32 }).notNull().default("free"),
  isPro: boolean("is_pro").notNull().default(false),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { withTimezone: true }),
  credits: integer("credits").notNull().default(3),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Audits ───────────────────────────────────────────────────────────
export const audits = pgTable("audits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  siteUrl: text("site_url").notNull(),
  brandName: varchar("brand_name", { length: 255 }),
  geoScore: integer("geo_score"),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  gaps: jsonb("gaps").$type<string[]>(),
  recommendations: jsonb("recommendations").$type<string[]>(),
  jsonLdSchema: jsonb("json_ld_schema"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Payments ─────────────────────────────────────────────────────────
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).notNull().unique(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  product: varchar("product", { length: 64 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Type Exports ─────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Audit = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
