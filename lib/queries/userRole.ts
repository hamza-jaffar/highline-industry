import { db } from "@/db";
import { userRoles } from "@/db/schemas/user-roles.schema";
import { eq } from "drizzle-orm";

export async function getUserRole(userId: string) {
  try {
    const result = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    return result[0]?.role || "user";
  } catch (error) {
    console.error("Error fetching user role from database:", error);

    // Fallback to default role in production
    if (process.env.NODE_ENV === "production") {
      console.warn("Database error in production, returning default user role");
      return "user";
    }

    throw error;
  }
}
