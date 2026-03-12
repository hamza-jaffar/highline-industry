import { createServerClient } from '@/lib/supabase/server-client';
import { getUserRole } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Settings, Users, Package, Activity, FolderTree } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await getUserRole(user.id);
  if (role !== 'admin') redirect(`/dashboard/${role}`);

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold text-black tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              HQ Access Level
            </div>
            <h1 className="text-3xl font-sora font-semibold text-[#111]">Command Center</h1>
            <p className="text-[#737373] text-sm mt-1">Manage global factory operations and user nodes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Users', val: '1,204', icon: Users },
            { label: 'Live Systems', val: '42', icon: Package },
            { label: 'Network Load', val: '98%', icon: Activity },
            { label: 'System Health', val: 'Optimal', icon: Settings },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/admin/products" className="group p-8 bg-white border border-black/10 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <Package className="w-6 h-6" />
              </div>
              <Activity className="w-4 h-4 text-black/20" />
            </div>
            <h3 className="text-xl font-sora font-semibold text-[#111]">Product Management</h3>
            <p className="text-[#737373] text-sm mt-1">Create, update and track inventory across all variations.</p>
          </Link>

          <Link href="/dashboard/admin/collections" className="group p-8 bg-white border border-black/10 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <FolderTree className="w-6 h-6" />
              </div>
              <Activity className="w-4 h-4 text-black/20" />
            </div>
            <h3 className="text-xl font-sora font-semibold text-[#111]">Collection Management</h3>
            <p className="text-[#737373] text-sm mt-1">Group products into meaningful categories and sets.</p>
          </Link>
        </div>

        <div className="p-8 bg-white border border-black/10 rounded-xl shadow-sm">
            <h2 className="text-xl font-sora font-semibold text-[#111] mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-black/5 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-black/10" />
                    <p className="text-sm text-[#111]">System ready for global operations.</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">SECURE</span>
                </div>
              ))}
            </div>
        </div>

      </div>
    </div>
  );
}
