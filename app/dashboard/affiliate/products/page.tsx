import { db } from "@/db";
import { affiliates, affiliateProductAssignments } from "@/db/schemas/affiliate.schema";
import { getProducts } from "@/lib/shopify/product.query";
import { createServerClient } from "@/lib/supabase/server-client";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Heading from "@/components/ui/heading";
import CopyProductLink from "@/components/affiliate/copy-product-link";

export default async function AffiliateProductsPage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const profileRecord = await db.select().from(affiliates).where(eq(affiliates.userId, session.user.id));
  const profile = profileRecord[0];
  if (!profile) redirect("/dashboard/affiliate");

  // Fetch assigned products
  const assignments = await db
    .select()
    .from(affiliateProductAssignments)
    .where(eq(affiliateProductAssignments.affiliateId, profile.id));

  const { edges: allShopifyProducts } = await getProducts({ first: 250 });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/affiliate"
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <Heading
          title="My Assigned Products"
          description="You can only earn commission on the products listed below. Use the links to promote them."
        />
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white border border-black/10 rounded-2xl p-12 text-center space-y-4">
          <p className="text-black/40 font-medium italic">No products have been assigned to you yet. Please contact administration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(as => {
            const product = allShopifyProducts.find(p => p.node.handle === as.productHandle);
            return (
              <div key={as.id} className="p-6 bg-white border border-black/10 rounded-2xl flex flex-col gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black/5 rounded-xl overflow-hidden shrink-0">
                    {product?.node.featuredImage ? (
                      <img src={product.node.featuredImage.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black/5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-black truncate">{product?.node.title || as.productHandle}</h3>
                    <p className="text-xs text-green-600 font-black uppercase tracking-tighter">{as.overrideCommissionRate}% commission</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Affiliate Link</span>
                  <CopyProductLink 
                    productHandle={as.productHandle}
                    affiliateCode={profile.affiliateCode}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
