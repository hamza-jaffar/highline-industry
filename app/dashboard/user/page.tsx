import { createServerClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { PlusCircle, Search, SlidersHorizontal, Package } from 'lucide-react';
import Link from 'next/link';
import { getUserRole } from '@/lib/queries/userRole';
import { db } from '@/db';
import { userDesigns } from '@/db/schemas/product-customization.schema';
import { eq, desc } from 'drizzle-orm';
import { DesignCard } from '@/components/dashboard/design-card';

export default async function UserDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await getUserRole(user.id);
  if (role !== 'user') redirect(`/dashboard/${role}`);

  const designs = await db
    .select()
    .from(userDesigns)
    .where(eq(userDesigns.userId, user.id))
    .orderBy(desc(userDesigns.updatedAt));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-black/[0.03]">
        <div className="space-y-1">
          <h1 className="text-3xl font-sora font-semibold tracking-tight text-[#111]">Overview</h1>
          <p className="text-sm text-black/40 font-medium tracking-tight">Manage your designs and production projects.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-hover:text-black/40 transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-9 pr-4 py-2 bg-white border border-black/5 rounded-md text-xs font-semibold focus:outline-none focus:border-black/10 transition-all w-48 focus:w-64"
            />
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-md shadow-premium hover:shadow-elevated hover:bg-black/90 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            New Design
          </Link>
        </div>
      </div>

      {/* Stats/Quick Access - Refined Shadcn style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: designs.length.toString(), growth: '+2 this week' },
          { label: 'Orders in Production', value: '0', growth: 'Ready to ship' },
          { label: 'Saved Templates', value: '12', growth: 'Standard catalog' },
          { label: 'Unread Messages', value: '4', growth: 'From Factory' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-black/5 shadow-sm hover:border-black/10 transition-all">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.05em] mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h4 className="text-2xl font-sora font-semibold text-[#111]">{stat.value}</h4>
              <span className="text-[10px] font-bold text-black/40 px-2 py-0.5 rounded-full bg-black/5">{stat.growth}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Designs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-sora font-semibold text-[#111]">Saved Designs</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#111] text-white uppercase tracking-wider">
              {designs.length} Total
            </span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/5 text-[10px] font-bold text-black/60 hover:bg-black/5 transition-colors">
            <SlidersHorizontal className="w-3 h-3" />
            Filter View
          </button>
        </div>

        {designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : (
          <div className="py-20 bg-white border border-dashed border-black/10 rounded-3xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-surface border border-black/5 flex items-center justify-center mb-6 transform rotate-3">
              <Package className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="text-xl font-sora font-semibold text-[#111] mb-2">Create your first design</h3>
            <p className="text-sm text-black/40 font-medium max-w-xs mb-8">
              Customize your favorite products and save them here for easy ordering and team review.
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white text-xs font-bold rounded-full shadow-premium hover:shadow-elevated transition-all">
              Get Started <PlusCircle className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
