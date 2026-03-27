import { Factory, LayoutDashboard, TrendingUp, Package, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getFactory } from "@/lib/queries/factory";

export default async function FactoryDashboardHome() {
  const factory = await getFactory();

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-50 border border-blue-200 text-xs font-semibold text-blue-900 tracking-wide mb-4 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            Factory Access Level
          </div>
          <h1 className="text-4xl font-sora font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-950 to-indigo-800">
            Welcome, {factory?.name || "Factory Manager"}
          </h1>
          <p className="text-muted text-base mt-2 max-w-xl">
            This is your secure factory portal. From here you can manage your operations, view upcoming orders, and update your factory profile.
          </p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { label: "Active Orders", val: "—", icon: Package, color: "from-blue-50 to-indigo-50", text: "text-blue-600" },
          { label: "Production Load", val: "—", icon: LayoutDashboard, color: "from-purple-50 to-fuchsia-50", text: "text-purple-600" },
          { label: "Completed (This Month)", val: "—", icon: TrendingUp, color: "from-emerald-50 to-teal-50", text: "text-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className={`p-6 bg-gradient-to-br ${stat.color} rounded-2xl border border-black/5 shadow-premium hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-sora font-bold text-black">{stat.val}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white shadow-sm ${stat.text}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Link href="/dashboard/factory/orders" className="group p-8 bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 flex flex-col items-start hover:border-blue-200">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-700 mb-6 group-hover:scale-110 transition-transform">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-sora font-bold text-gray-900 mb-2">View Incoming Orders</h3>
          <p className="text-muted text-sm flex-1">Check new approved user designs and product requests queued for manufacturing.</p>
          <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 gap-2 group-hover:gap-3 transition-all">
            See Orders <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
        <Link href="/dashboard/factory/profile" className="group p-8 bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 flex flex-col items-start hover:border-blue-200">
          <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-gray-200 rounded-2xl flex items-center justify-center text-slate-700 mb-6 group-hover:scale-110 transition-transform">
            <Factory className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-sora font-bold text-gray-900 mb-2">Update Factory Profile</h3>
          <p className="text-muted text-sm flex-1">Manage your public information, cover photo, address, and contact details.</p>
          <div className="mt-6 flex items-center text-sm font-semibold text-slate-600 gap-2 group-hover:gap-3 transition-all">
            Manage Profile <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
