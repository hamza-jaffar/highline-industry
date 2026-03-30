import { Metadata } from "next";
import { getFactory } from "@/lib/queries/factory";
import { FactoryProfileForm } from "@/components/dashboard/factory/factory-profile-form";
import { 
  Building2, 
  ShieldCheck, 
  Clock 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Factory Profile | Highline Industry",
  description: "Manage your factory's information and branding.",
};

export default async function FactoryProfilePage() {
  const factory = await getFactory();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-black px-8 py-10 text-white shadow-elevated">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-sora font-bold tracking-tight">Factory Profile</h1>
            <p className="text-white/60 font-inter max-w-xl">
              Configure your factory's identity, contact information, and public presence. Matches and updates are reflected immediately.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400">Verified Factory</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-tight">Enterprise Identity</h3>
            <p className="text-xs text-black/50 font-medium mt-1">Standalone factory configuration.</p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-tight">Secure Management</h3>
            <p className="text-xs text-black/50 font-medium mt-1">Role-based access protection.</p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-tight">Instant Updates</h3>
            <p className="text-xs text-black/50 font-medium mt-1">Low-latency data synchronization.</p>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-8">
        <FactoryProfileForm initialData={factory} />
      </div>
    </div>
  );
}
