"use server";

import { db } from "@/db";
import { orders, orderItems, userDesigns } from "@/db/schemas/product-customization.schema";
import { createServerClient } from "@/lib/supabase/server-client";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserOrders() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error("Unauthorized");

  const results = await db.query.orders.findMany({
    where: eq(orders.userId, session.user.id),
    orderBy: [desc(orders.createdAt)],
    with: {
        // Items will be fetched separately or via relation if defined
    }
  });

  return results;
}

export async function getAllOrders() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Check if admin/factory (Role check should ideally be here)
  // For now, let's assume the caller handles authorization or we add logic here
  
  const results = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return results;
}

export async function getOrderWithItems(orderId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) return null;

  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });

  return { ...order, items };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Admin only logic should go here
  
  await db.update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/dashboard/admin/orders");
  revalidatePath(`/dashboard/admin/orders/${orderId}`);
  revalidatePath("/dashboard/user/orders");
  revalidatePath("/dashboard/factory/orders");
  
  return { success: true };
}

export async function cancelOrder(orderId: string) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error("Unauthorized");

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) throw new Error("Order not found");

  // Only allow cancellation if Pending
  if (order.status !== "Pending") {
    throw new Error("Only pending orders can be cancelled");
  }

  // Ensure users can only cancel their own orders unless they are admin
  if (order.userId !== session.user.id) {
    // Check if admin...
  }

  await db.update(orders)
    .set({ status: "Cancelled", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/dashboard/user/orders");
  revalidatePath(`/dashboard/user/orders/${orderId}`);
  
  return { success: true };
}
