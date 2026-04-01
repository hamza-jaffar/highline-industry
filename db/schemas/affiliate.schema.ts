import { pgTable, text, uuid, timestamp, numeric, boolean } from "drizzle-orm/pg-core";

// Main Affiliate Account
export const affiliates = pgTable("affiliates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(), // Connects to the main user/auth table if applicable
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  affiliateCode: text("affiliate_code").notNull().unique(), // The ?ref= code
  socialMediaUrl: text("social_media_url"),
  defaultCommissionRate: numeric("default_commission_rate", { precision: 5, scale: 2 }).default("10.00").notNull(),
  status: text("status", { enum: ["pending", "approved", "suspended"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Logs individual hits on the ?ref URL
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id, { onDelete: "cascade" }).notNull(),
  ipAddress: text("ip_address"),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

// Links a Shopify order to an Affiliate
export const affiliateOrders = pgTable("affiliate_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id, { onDelete: "set null" }), // Don't wipe record if affiliate deleted
  shopifyOrderId: text("shopify_order_id").notNull().unique(),
  orderSubtotal: numeric("order_subtotal", { precision: 10, scale: 2 }).notNull(),
  customerEmail: text("customer_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual Payout lines per order
export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id, { onDelete: "cascade" }).notNull(),
  orderId: uuid("order_id").references(() => affiliateOrders.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "approved", "paid", "rejected"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

// Product-level overrides for commissions (e.g. VIP items pay 20% instead of 10%)
export const affiliateProductAssignments = pgTable("affiliate_product_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id, { onDelete: "cascade" }).notNull(),
  productHandle: text("product_handle").notNull(), // Mapped to string handle from Shopify
  overrideCommissionRate: numeric("override_commission_rate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
