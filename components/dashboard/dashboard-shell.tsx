"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  X, Menu, ChevronLeft, LogOut, 
  LayoutDashboard, Package, FolderTree, Settings, Factory as FactoryIcon, ShoppingCart, Users, DollarSign 
} from "lucide-react";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { signout } from "@/app/actions/signup.actions";

const adminNav = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/dashboard/admin/products", icon: Package },
  { label: "Collections", href: "/dashboard/admin/collections", icon: FolderTree },
  { label: "Affiliates", href: "/dashboard/admin/affiliates", icon: Users },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  { label: "Factory", href: "/dashboard/admin/factory", icon: FactoryIcon },
];

const factoryNav = [
  { label: "Overview", href: "/dashboard/factory", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/factory/orders", icon: ShoppingCart },
  { label: "Factory Profile", href: "/dashboard/factory/profile", icon: FactoryIcon },
];

const userNav = [
  { label: "Overview", href: "/dashboard/user", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/user/orders", icon: ShoppingCart },
  { label: "Affiliate Portal", href: "/dashboard/affiliate", icon: Users },
];

const affiliateNav = [
  { label: "Dashboard", href: "/dashboard/affiliate", icon: LayoutDashboard },
  { label: "Referrals", href: "/dashboard/affiliate/referrals", icon: Users },
  { label: "Payouts", href: "/dashboard/affiliate/payouts", icon: DollarSign },
  { label: "Assigned Products", href: "/dashboard/affiliate/products", icon: Package },
];

const portalNames = {
  admin: "Admin Panel",
  factory: "Factory Portal",
  user: "User Account",
  affiliate: "Affiliate Portal",
};

export interface DashboardShellProps {
  children: React.ReactNode;
  role: "admin" | "factory" | "user" | "affiliate";
  user?: { email?: string };
}

export function DashboardShell({ children, role, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = 
    role === "admin" ? adminNav : 
    role === "factory" ? factoryNav : 
    role === "affiliate" ? affiliateNav : 
    userNav;
  const portalName = portalNames[role] || "Dashboard";

  useEffect(() => {
    const saved = localStorage.getItem(`${portalName}-sidebar-collapsed`);
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, [portalName]);

  useEffect(() => {
    localStorage.setItem(`${portalName}-sidebar-collapsed`, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed, portalName]);

  const SideNav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`space-y-1 ${mobile ? "px-2" : "px-4"}`}>
      {navItems.map((item: any) => {
        const isHome = item.href === `/dashboard/${role}`;
        const isActive = isHome ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-black text-white shadow-md"
                : "text-muted hover:text-black hover:bg-black/5"
            } ${sidebarCollapsed && !mobile ? "justify-center px-2" : ""}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {(!sidebarCollapsed || mobile) && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-black/5 shadow-premium z-40 transition-all duration-300 flex flex-col ${sidebarCollapsed ? "w-16" : "w-64"} hidden lg:flex`}>
        <div className={`p-6 border-b border-black/5 ${sidebarCollapsed ? "px-3" : ""}`}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <Link href="/" className="text-xl font-sora font-bold tracking-tight text-black flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={28} height={28} />
                HIGHLINE
              </Link>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md hover:bg-black/5 transition-colors group"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <span className={`px-6 text-xs font-bold text-muted uppercase tracking-wider mb-2 block ${sidebarCollapsed ? "hidden" : ""}`}>
            {portalName}
          </span>
          <SideNav />
        </div>

        {/* User profile & Logout */}
        <div className={`p-4 border-t border-black/5 bg-slate-50/50 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          {(!sidebarCollapsed) && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter shrink-0">
                {user?.email?.[0] || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-black truncate">{user?.email || "Account"}</span>
                <span className="text-[10px] text-black/40 font-medium capitalize">{portalName}</span>
              </div>
            </div>
          )}
          <form action={signout}>
            <button
              type="submit"
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors ${
                sidebarCollapsed ? "justify-center" : "w-full"
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {(!sidebarCollapsed) && "Sign Out"}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-premium z-50 flex lg:hidden items-center justify-between px-6">
        <Link href="/" className="text-lg font-sora font-bold tracking-tight text-black flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={24} height={24} />
          HIGHLINE
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-black/60 hover:text-black transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-60 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-elevated p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{portalName}</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SideNav mobile />
            </div>
            <div className="mt-auto pt-4 border-t border-black/5">
              <form action={signout}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="min-h-screen pt-24 lg:pt-8 pb-20 px-2 sm:px-4 max-w-7xl mx-auto w-full">
          <Breadcrumb />
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6 min-h-[calc(100vh-12rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
