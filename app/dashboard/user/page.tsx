import { createServerClient } from '@/lib/supabase/server-client';
import { getUserRole } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Box, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default async function UserDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await getUserRole(user.id);
  if (role !== 'user') redirect(`/dashboard/${role}`);

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

        <div className="p-8 bg-white border border-black/10 rounded-xl shadow-sm text-center py-16">
            <h2 className="text-lg font-sora font-semibold text-[#111] mb-2">No active projects</h2>
            <p className="text-muted text-sm mb-6">Head to the catalog to configure your first garment system.</p>
            <Link href="/shop" className="inline-flex px-4 py-2 border border-black/10 text-black text-sm font-semibold rounded-md shadow-sm hover:bg-surface transition-colors">
                Browse Catalog
            </Link>
        </div>

      </div>
    </div>
  );
}
