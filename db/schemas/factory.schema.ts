import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Singleton table — the app always upserts a single row with id = 'singleton'
export const factory = pgTable("factory", {
  id: text("id").primaryKey().default("singleton"),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  description: text("description"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Factory = typeof factory.$inferSelect;
export type NewFactory = typeof factory.$inferInsert;
