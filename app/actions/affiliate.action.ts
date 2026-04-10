"use server";

import { db } from "@/db";
import {
  affiliates,
  affiliateClicks,
  affiliateProductAssignments,
} from "@/db/schemas/affiliate.schema";
import { userRoles } from "@/db/schemas/user-roles.schema";
import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { eq, desc, and } from "drizzle-orm";

export async function registerAffiliateAction(formData: FormData) {
  try {
    const supabase = await createServerClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const socialMediaUrl = formData.get("socialMediaUrl") as string;

    if (!name || !email || !password) {
      return {
        success: false,
        error: "Name, email, and password are required",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    // 1. Authenticate / Create Supabase User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const userId = authData?.user?.id;
    if (!userId) {
      return { success: false, error: "Failed to generate user securely." };
    }

    // 2. See if they somehow applied already (edge case if re-using email)
    const existing = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, userId));
    if (existing.length > 0) {
      return {
        success: false,
        error: "An active affiliate application already exists for this email.",
      };
    }

    // 3. Generate random affiliate code (e.g., HIGH-1A2B)
    const randomHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const affiliateCode = `HIGH-${randomHash}`;

    // 4. Inject Affiliate Status
    await db.insert(affiliates).values({
      userId: userId,
      name,
      email,
      affiliateCode,
      socialMediaUrl,
      status: "pending", // Default to pending until admin approval
      defaultCommissionRate: "10.00", // base 10%
    });

    // 5. Inject User Role as Affiliate
    await db.insert(userRoles).values({
      userId: userId,
      role: "affiliate",
    });

    return {
      success: true,
      message:
        "Application submitted successfully! Please check your email to verify your account.",
    };
  } catch (err: any) {
    if (err.message?.includes("duplicate key")) {
      return {
        success: false,
        error: "This email is already registered to an affiliate account.",
      };
    }
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}

export async function approveAffiliateAction(affiliateId: string) {
  try {
    const supabase = await createServerClient();
    // Strict production: verify admin role here

    await db
      .update(affiliates)
      .set({ status: "approved" })
      .where(eq(affiliates.id, affiliateId));

    revalidatePath("/dashboard/admin/affiliates");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCommissionAction(
  affiliateId: string,
  margin: string,
) {
  try {
    await db
      .update(affiliates)
      .set({ defaultCommissionRate: margin })
      .where(eq(affiliates.id, affiliateId));

    revalidatePath("/dashboard/admin/affiliates");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logAffiliateClickAction(affiliateCode: string) {
  try {
    const affiliateRecord = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.affiliateCode, affiliateCode));
    if (affiliateRecord.length === 0)
      return { success: false, error: "Invalid affiliate code" };

    const affiliate = affiliateRecord[0];

    // Log the click
    await db.insert(affiliateClicks).values({
      affiliateId: affiliate.id,
    });

    return { success: true, affiliateId: affiliate.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function processPayoutAction(affiliateId: string) {
  try {
    const { affiliateCommissions } = await import(
      "@/db/schemas/affiliate.schema"
    );
    const { and } = await import("drizzle-orm");

    // Update all pending commissions for this affiliate to 'paid'
    await db
      .update(affiliateCommissions)
      .set({
        status: "paid",
        paidAt: new Date(),
      })
      .where(
        and(
          eq(affiliateCommissions.affiliateId, affiliateId),
          eq(affiliateCommissions.status, "pending"),
        ),
      );

    revalidatePath("/dashboard/admin/affiliates");
    revalidatePath("/dashboard/affiliate");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function assignProductToAffiliateAction(
  affiliateId: string,
  productHandle: string,
  rate: string,
) {
  try {
    // Check if assignment already exists
    const existing = await db
      .select()
      .from(affiliateProductAssignments)
      .where(
        and(
          eq(affiliateProductAssignments.affiliateId, affiliateId),
          eq(affiliateProductAssignments.productHandle, productHandle),
        ),
      );

    if (existing.length > 0) {
      return {
        success: false,
        error: "Product already assigned to this affiliate",
      };
    }

    await db.insert(affiliateProductAssignments).values({
      affiliateId,
      productHandle,
      overrideCommissionRate: rate,
    });

    revalidatePath("/dashboard/admin/affiliates");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function unassignProductFromAffiliateAction(assignmentId: string) {
  try {
    await db
      .delete(affiliateProductAssignments)
      .where(eq(affiliateProductAssignments.id, assignmentId));
    revalidatePath("/dashboard/admin/affiliates");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function bulkAssignProductsToAffiliateAction(
  affiliateId: string,
  productHandles: string[],
  rate: string,
) {
  try {
    for (const handle of productHandles) {
      // Check if already exists to avoid redundant inserts
      const existing = await db
        .select()
        .from(affiliateProductAssignments)
        .where(
          and(
            eq(affiliateProductAssignments.affiliateId, affiliateId),
            eq(affiliateProductAssignments.productHandle, handle),
          ),
        );

      if (existing.length === 0) {
        await db.insert(affiliateProductAssignments).values({
          affiliateId,
          productHandle: handle,
          overrideCommissionRate: rate,
        });
      } else {
        // Update the rate if it already exists
        await db
          .update(affiliateProductAssignments)
          .set({ overrideCommissionRate: rate })
          .where(
            and(
              eq(affiliateProductAssignments.affiliateId, affiliateId),
              eq(affiliateProductAssignments.productHandle, handle),
            ),
          );
      }
    }

    revalidatePath(`/dashboard/admin/affiliates/${affiliateId}/products`);
    revalidatePath("/dashboard/admin/affiliates");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAffiliateAssignedProducts(affiliateId: string) {
  try {
    const assignments = await db
      .select()
      .from(affiliateProductAssignments)
      .where(eq(affiliateProductAssignments.affiliateId, affiliateId))
      .orderBy(desc(affiliateProductAssignments.createdAt));

    return { success: true, assignments };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
