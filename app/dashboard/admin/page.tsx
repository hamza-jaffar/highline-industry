import { Users, Package, Activity, FolderTree, TrendingUp, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-black/10 to-gray-100 border border-black/10 text-xs font-semibold text-black tracking-wide mb-4 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm" />
            HQ Access Level
          </div>
          <h1 className="text-4xl font-sora font-bold text-transparent bg-linear-to-r from-black to-gray-800 bg-clip-text">
            Command Center
          </h1>
          <p className="text-muted text-base mt-2 max-w-md">
            Manage global factory operations and user nodes with precision and control.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">System Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Users', val: '1,204', icon: Users, trend: '+12%', color: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-600' },
          { label: 'Live Systems', val: '42', icon: Package, trend: '+3', color: 'from-purple-50 to-violet-50', iconColor: 'text-purple-600' },
          { label: 'Network Load', val: '98%', icon: Activity, trend: 'Stable', color: 'from-orange-50 to-red-50', iconColor: 'text-orange-600' },
          { label: 'System Health', val: 'Optimal', icon: Zap, trend: '99.9%', color: 'from-green-50 to-emerald-50', iconColor: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 bg-linear-to-br ${stat.color} border border-black/5 rounded-2xl shadow-premium hover:shadow-elevated transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-sora font-bold text-transparent group-hover:scale-105 transition-transform">{stat.val}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/80 shadow-sm ${stat.iconColor}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <TrendingUp className="w-3 h-3" />
              <span>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/products" className="group p-8 bg-linear-to-br from-white to-gray-50 border border-black/5 rounded-2xl shadow-premium hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <Activity className="w-5 h-5 text-black/20 group-hover:text-black/40 transition-colors" />
          </div>
          <h3 className="text-2xl font-sora font-bold text-transparent mb-2 group-hover:text-black/80 transition-colors">
            Product Management
          </h3>
          <p className="text-muted text-base leading-relaxed">
            Create, update and track inventory across all variations with advanced analytics.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted group-hover:text-black/70 transition-colors">
            <span>Manage Products</span>
            <div className="w-2 h-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>
        </Link>

        <Link href="/dashboard/admin/collections" className="group p-8 bg-linear-to-br from-white to-gray-50 border border-black/5 rounded-2xl shadow-premium hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <FolderTree className="w-7 h-7 text-white" />
            </div>
            <Activity className="w-5 h-5 text-black/20 group-hover:text-black/40 transition-colors" />
          </div>
          <h3 className="text-2xl font-sora font-bold text-transparent mb-2 group-hover:text-black/80 transition-colors">
            Collection Management
          </h3>
          <p className="text-muted text-base leading-relaxed">
            Group products into meaningful categories and sets for better organization.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted group-hover:text-black/70 transition-colors">
            <span>Organize Collections</span>
            <div className="w-2 h-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>
        </Link>
        
        <Link href="/dashboard/admin/affiliates" className="group p-8 bg-linear-to-br from-white to-gray-50 border border-black/5 rounded-2xl shadow-premium hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <Activity className="w-5 h-5 text-black/20 group-hover:text-black/40 transition-colors" />
          </div>
          <h3 className="text-2xl font-sora font-bold text-transparent mb-2 group-hover:text-black/80 transition-colors">
            Affiliate Management
          </h3>
          <p className="text-muted text-base leading-relaxed">
            Manage your partner network, approve applications, and track referral performance.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted group-hover:text-black/70 transition-colors">
            <span>Manage Network</span>
            <div className="w-2 h-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="p-8 bg-linear-to-br from-white to-gray-50 border border-black/5 rounded-2xl shadow-premium">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-sora font-bold text-transparent">Recent Activity</h2>
          <div className="px-3 py-1 bg-black/5 rounded-full text-xs font-medium text-muted">
            Live Updates
          </div>
        </div>
        <div className="space-y-4">
          {[
            { action: 'System ready for global operations', time: '2 min ago', status: 'SECURE' },
            { action: 'Product inventory synchronized', time: '15 min ago', status: 'SUCCESS' },
            { action: 'User authentication logs updated', time: '1 hour ago', status: 'SECURE' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-black/5 last:border-0 hover:bg-black/2 rounded-lg px-4 -mx-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-linear-to-r from-green-400 to-green-600 shadow-sm" />
                <div>
                  <p className="text-sm font-medium text-transparent">{activity.action}</p>
                  <p className="text-xs text-muted mt-1">{activity.time}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                activity.status === 'SECURE' ? 'bg-green-100 text-green-700' :
                activity.status === 'SUCCESS' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
