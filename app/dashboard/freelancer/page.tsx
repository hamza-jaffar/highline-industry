import { createServerClient } from '@/lib/supabase/server-client';
import { getUserRole } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { ExternalLink, ShoppingBag, BarChart3 } from 'lucide-react';

export default async function FreelancerDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await getUserRole(user.id);
  if (role !== 'freelancer') redirect(`/dashboard/${role}`);

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold text-black tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Freelancer Portal
            </div>
            <h1 className="text-3xl font-sora font-semibold text-[#111]">Client Workspace</h1>
            <p className="text-[#737373] text-sm mt-1">Manage designs and client fulfillment orders.</p>
          </div>
          <button className="px-4 py-2 bg-[#111] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-black transition-colors">
            Upload Design
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Client Revenue', val: '$4,204', icon: BarChart3 },
            { label: 'Orders Fulfilled', val: '42', icon: ShoppingBag },
            { label: 'Active Drafts', val: '8', icon: ExternalLink },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white border border-black/10 rounded-xl shadow-sm">
               <div className="flex justify-between items-start mb-4">
                 <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider">{stat.label}</p>
                 <stat.icon className="w-4 h-4 text-black/40" />
               </div>
               <p className="text-2xl font-sora font-semibold text-[#111]">{stat.val}</p>
            </div>
          ))}
        </div>

        <div className="p-8 bg-white border border-black/10 rounded-xl shadow-sm">
            <h2 className="text-xl font-sora font-semibold text-[#111] mb-6">Pending Client Approvals</h2>
            <div className="text-center py-12 border-2 border-dashed border-black/5 rounded-lg">
                <p className="text-[#737373] text-sm">All designs are up to date and approved.</p>
            </div>
        </div>

      </div>
    </div>
  );
}
