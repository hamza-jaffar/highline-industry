import { db } from "@/db";
import { affiliates, affiliateProductAssignments } from "@/db/schemas/affiliate.schema";
import { getProducts } from "@/lib/shopify/product.query";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server-client";
import Heading from "@/components/ui/heading";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ProductAssignmentManager from "./product-assignment-manager";

export default async function AffiliateProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch Affiliate
  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.id, id),
  });

  if (!affiliate) notFound();

  // Fetch all Shopify products
  const { edges: products } = await getProducts({ first: 250 });

  // Fetch current assignments
  const assignments = await db
    .select()
    .from(affiliateProductAssignments)
    .where(eq(affiliateProductAssignments.affiliateId, id))
    .orderBy(desc(affiliateProductAssignments.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/affiliates"
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <Heading
          title={`Manage Products: ${affiliate.name}`}
          description={`Set custom commission rates for specific products for this partner.`}
        />
      </div>

      <ProductAssignmentManager
        affiliateId={id}
        products={products.map(p => p.node)}
        initialAssignments={assignments}
      />
    </div>
  );
}
