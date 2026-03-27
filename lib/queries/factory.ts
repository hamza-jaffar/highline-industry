import { db } from "@/db";
import { factory, type NewFactory } from "@/db/schemas/factory.schema";
import { userRoles } from "@/db/schemas/user-roles.schema";
import { eq } from "drizzle-orm";

const FACTORY_ID = "singleton";

export async function getFactory() {
  try {
    const result = await db
      .select()
      .from(factory)
      .where(eq(factory.id, FACTORY_ID))
      .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching factory:", error);
    return null;
  }
}

export async function assignFactoryRole(userId: string) {
  await db.insert(userRoles).values({
    userId,
    role: "factory",
  }).onConflictDoNothing(); // If they somehow already have a role, don't crash
}

export async function getFactoryUserId() {
  const result = await db.select({ userId: userRoles.userId }).from(userRoles).where(eq(userRoles.role, "factory")).limit(1);
  return result[0]?.userId ?? null;
}

export async function upsertFactory(data: Omit<NewFactory, "id" | "createdAt" | "updatedAt">) {
  const result = await db
    .insert(factory)
    .values({ ...data, id: FACTORY_ID })
    .onConflictDoUpdate({
      target: factory.id,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning();
  return result[0];
}
