import { pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

export const userRoles = pgTable('user_roles', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').notNull(),
    role: text('role').default('user').notNull(),
});