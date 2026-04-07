import { db } from "@/db";
import { affiliates, affiliateProductAssignments } from "@/db/schemas/affiliate.schema";
import { eq } from "drizzle-orm";
import { getProducts, getSingleProduct } from "@/lib/shopify/product.query";
import ProductShowcase from "@/components/landing/product-showcase";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function AffiliateStorePage({ params }: Props) {
  const { handle } = await params;

  // 1. Find the affiliate by their unique referral code (handle)
  const affiliateRecord = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.affiliateCode, handle))
    .limit(1);
    
  const affiliate = affiliateRecord[0];

  // Only show active and approved affiliate stores
  if (!affiliate || affiliate.status !== "approved") {
    notFound();
  }

  // 2. Resolve Products
  // Priority A: Show products explicitly assigned to this affiliate
  const assignments = await db
    .select()
    .from(affiliateProductAssignments)
    .where(eq(affiliateProductAssignments.affiliateId, affiliate.id));
  
  let formattedProducts;

  if (assignments.length > 0) {
    const handles = assignments.map(a => a.productHandle);
    // Fetch specifically assigned products
    const productPromises = handles.map(h => getSingleProduct(h));
    const rawProducts = await Promise.all(productPromises);
    
    formattedProducts = rawProducts.filter(Boolean).map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      price: p.priceRange.minVariantPrice.amount,
      image: p.images.edges[0]?.node.url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
      tag: "PARTNER PICK"
    }));
  } else {
    // Priority B: Show all products (fallback)
    const { edges } = await getProducts({ first: 12, sortKey: "RELEVANCE" });
    formattedProducts = (edges || []).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      price: edge.node.priceRange.minVariantPrice.amount,
      image: edge.node.featuredImage?.url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
      tag: edge.node.tags.includes("new") ? "NEW" : undefined
    }));
  }

  return (
    <div className="flex flex-col w-full pb-24 animate-in fade-in duration-700">
      {/* Branded Header Section */}
      <section className="bg-black text-white py-24 md:py-32 px-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-black uppercase tracking-widest text-white/80">
             <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
             Verified Influencer Selection
           </div>
           
           <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
             {affiliate.name}<br />
             <span className="text-white/20">Collection</span>
           </h1>
           
           <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4">
             <p className="text-white/50 font-medium tracking-wide text-lg max-w-xl">
               Exclusive professional-grade gear curated by {affiliate.name}. Gear up with the selection built for elite performance.
             </p>
             <div className="h-px md:h-20 w-12 md:w-px bg-white/20" />
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Affiliate Code</p>
               <p className="text-2xl font-mono font-bold text-white uppercase">{affiliate.affiliateCode}</p>
             </div>
           </div>
        </div>
      </section>

      {/* Product List */}
      <div className="-mt-8 relative z-20">
        <ProductShowcase products={formattedProducts.length > 0 ? formattedProducts : undefined} />
      </div>

      {/* Footer Support */}
      <section className="mt-12 text-center px-6">
        <p className="text-black/30 text-xs font-black uppercase tracking-widest">
          Every purchase supports {affiliate.name}
        </p>
      </section>
    </div>
  );
}
