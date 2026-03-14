import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  role: text("role").default("user").notNull(),
});
