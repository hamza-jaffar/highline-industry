import { createServerClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { Box, MapPin, CreditCard, Edit2, Clock, Package } from 'lucide-react';
import Link from 'next/link';
import { getUserRole } from '@/lib/queries/userRole';
import { db } from '@/db';
import { userDesigns } from '@/db/schemas/product-customization.schema';
import { eq, desc } from 'drizzle-orm';

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
    <div className="min-h-screen bg-surface pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold text-black tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              Standard Account
            </div>
            <h1 className="text-3xl font-sora font-semibold text-[#111]">Dashboard</h1>
            <p className="text-muted text-sm mt-1">Manage your active manufacturing orders.</p>
          </div>
          <Link href="/shop" className="px-4 py-2 bg-[#111] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-black transition-colors">
            New Project
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Order Pipeline', desc: 'Track active physical production.', icon: Box },
            { label: 'Saved Addresses', desc: 'Manage your distribution hubs.', icon: MapPin },
            { label: 'Billing Settings', desc: 'Update payment instruments.', icon: CreditCard },
          ].map((item, i) => (
            <button key={i} className="flex flex-col text-left p-6 bg-white border border-black/10 rounded-xl shadow-sm hover:border-black/30 hover:shadow-premium transition-all">
               <div className="w-10 h-10 rounded-lg bg-surface border border-black/5 flex items-center justify-center mb-4">
                 <item.icon className="w-5 h-5 text-black" />
               </div>
               <h3 className="text-base font-sora font-semibold text-[#111] mb-1">{item.label}</h3>
               <p className="text-sm text-muted">{item.desc}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-sora font-semibold text-[#111]">Saved Designs</h2>
            <Link href="/shop" className="text-xs font-semibold text-black hover:underline">View Catalog</Link>
          </div>

          {designs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map((design) => (
                <div key={design.id} className="group bg-white border border-black/10 rounded-xl overflow-hidden hover:border-black/20 transition-all shadow-sm">
                  <div className="aspect-video bg-surface relative flex items-center justify-center p-4">
                    {design.previewUrl ? (
                      <img src={design.previewUrl} alt={design.name || 'Design'} className="max-h-full object-contain" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
                        <Package className="w-8 h-8 text-black/20" />
                      </div>
                    )}
                    <Link 
                      href={`/customizer/${design.productHandle}?designId=${design.id}`}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Edit2 className="w-3 h-3" />
                        Edit Design
                      </button>
                    </Link>
                  </div>
                  <div className="p-4 border-t border-black/5">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-sm font-semibold text-[#111] truncate max-w-[150px]">
                         {design.name || `${design.productHandle} - ${design.color}`}
                       </h3>
                       <span className="text-[10px] font-bold text-black/40 px-2 py-0.5 rounded bg-black/5 uppercase tracking-wider">
                         {design.color}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
                       <Clock className="w-3 h-3" />
                       {new Date(design.updatedAt!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white border border-black/10 rounded-xl shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-surface border border-black/5 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-black/20" />
                </div>
                <h3 className="text-base font-sora font-semibold text-[#111] mb-1">No saved designs</h3>
                <p className="text-sm text-muted mb-6">Your customized projects will appear here for future editing.</p>
                <Link href="/shop" className="inline-flex px-4 py-2 bg-black text-white text-xs font-bold rounded-md hover:bg-black/90 transition-colors">
                    Start Customizing
                </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
