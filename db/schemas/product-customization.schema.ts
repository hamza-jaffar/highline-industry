import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const ProductViews = pgTable("product_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: text("product_id").notNull(),
  name: text("name"),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customizationZones = pgTable("customization_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  viewId: uuid("view_id").notNull(),
  name: text("name").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  allowedType: text("allowed_type"), // Image, Text, Empty for both
  textPrice: integer("text_price").default(0),
  imagePrice: integer("image_price").default(0),
});
