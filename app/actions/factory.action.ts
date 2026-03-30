"use server";

import { revalidatePath } from "next/cache";
import { type NewFactory } from "@/db/schemas/factory.schema";
import { upsertFactory } from "@/lib/queries/factory";

export async function updateFactoryProfile(
  data: Omit<NewFactory, "id" | "createdAt" | "updatedAt">,
) {
  try {
    const result = await upsertFactory(data);

    if (!result) {
      return { success: false, error: "Failed to update factory profile." };
    }

    revalidatePath("/dashboard/factory/profile");
    revalidatePath("/dashboard/factory");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in updateFactoryProfile action:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}
