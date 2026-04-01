import Hero from "@/components/landing/hero";
import ProductShowcase from "@/components/landing/product-showcase";
import Features from "@/components/landing/features";
import Integrations from "@/components/landing/integrations";
import Link from "next/link";
import { getProducts } from "../../lib/shopify/product.query";

export default async function HomePage() {
  const { edges } = await getProducts({ first: 8, sortKey: "RELEVANCE" });

  const formattedProducts = (edges || []).map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    price: edge.node.priceRange.minVariantPrice.amount,
    image: edge.node.featuredImage?.url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    tag: edge.node.tags.includes("new") ? "NEW" : edge.node.tags.includes("bestseller") ? "BESTSELLER" : undefined
  }));

  return (
    <div className="flex flex-col w-full">
      <Hero />

      <ProductShowcase products={formattedProducts.length > 0 ? formattedProducts : undefined} />

      <Features />

      {/* <Integrations /> */}

      {/* Final Conversion Block */}
      <section className="py-12 px-6 bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl md:text-6xl font-sora font-semibold tracking-tight text-[#111]">
            Ready to elevate <br /><span className="text-black/30">your game?</span>
          </h2>
          <p className="text-lg text-black/60 font-inter max-w-2xl mx-auto leading-relaxed">
            Join thousands of athletes pushing their limits with Highline's professional sports gear.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-12 py-5 bg-black text-white text-sm font-bold rounded-full shadow-2xl hover:bg-black/80 hover:scale-[1.02] transition-all"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
