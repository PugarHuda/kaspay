import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  boolean,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  kaspaAddress: varchar("kaspa_address", { length: 100 }).notNull(),
  apiKey: uuid("api_key").notNull().unique().defaultRandom(),
  paymentExpiry: integer("payment_expiry").notNull().default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentLinks = pgTable("payment_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("KAS"),
  redirectUrl: text("redirect_url"),
  successMessage: text("success_message"),
  expiryMinutes: integer("expiry_minutes").notNull().default(30),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentLinkId: uuid("payment_link_id").references(() => paymentLinks.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  kaspaAddress: varchar("kaspa_address", { length: 100 }).notNull(),
  amountExpected: decimal("amount_expected", {
    precision: 20,
    scale: 8,
  }).notNull(),
  initialBalance: decimal("initial_balance", { precision: 20, scale: 8 }).notNull().default("0"),
  amountReceived: decimal("amount_received", { precision: 20, scale: 8 }),
  txId: varchar("tx_id", { length: 100 }),
  blockHash: varchar("block_hash", { length: 100 }),
  confirmations: integer("confirmations").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  expiresAt: timestamp("expires_at"),
});

export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  url: text("url").notNull(),
  events: text("events").array().notNull(),
  secret: uuid("secret").notNull().defaultRandom(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  webhookId: uuid("webhook_id")
    .notNull()
    .references(() => webhooks.id),
  paymentId: uuid("payment_id")
    .notNull()
    .references(() => payments.id),
  event: varchar("event", { length: 50 }).notNull(),
  payload: jsonb("payload").notNull(),
  statusCode: integer("status_code"),
  response: text("response"),
  error: text("error"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  paymentLinks: many(paymentLinks),
  payments: many(payments),
  webhooks: many(webhooks),
}));

export const paymentLinksRelations = relations(
  paymentLinks,
  ({ one, many }) => ({
    user: one(users, {
      fields: [paymentLinks.userId],
      references: [users.id],
    }),
    payments: many(payments),
  })
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  paymentLink: one(paymentLinks, {
    fields: [payments.paymentLinkId],
    references: [paymentLinks.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
  logs: many(webhookLogs),
}));

export const webhookLogsRelations = relations(webhookLogs, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookLogs.webhookId],
    references: [webhooks.id],
  }),
  payment: one(payments, {
    fields: [webhookLogs.paymentId],
    references: [payments.id],
  }),
}));
