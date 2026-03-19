import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const ProductViews = pgTable("product_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: text("product_id").notNull(),
  name: text("name"), // Part Name (Front, Back, etc.)
  color: text("color"), // Null if common
  isCommon: boolean("is_common").default(false),
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

export const userDesigns = pgTable("user_designs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  productId: text("product_id").notNull(),
  productHandle: text("product_handle").notNull(),
  color: text("color").notNull(),
  name: text("name"), // Optional name for the design
  elements: text("elements").notNull(), // JSON stringified DesignElement[]
  previewUrl: text("preview_url"), // URL to a preview image
  price: integer("price").default(0), // Total price at the time of design
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"), // Nullable for guest users
  shopifyCartId: text("shopify_cart_id").notNull(),
  productId: text("product_id").notNull(),
  variantId: text("variant_id").notNull(),
  quantity: integer("quantity").default(1),
  designId: uuid("design_id").references(() => userDesigns.id),
  isDesigned: boolean("is_designed").default(false),
  price: integer("price").notNull(), // Price per item in cents
  color: text("color"),
  size: text("size"),
  createdAt: timestamp("created_at").defaultNow(),
});
