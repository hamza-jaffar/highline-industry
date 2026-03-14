"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, FolderTree, LayoutDashboard, Settings, X, Menu, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Breadcrumb from "@/components/breadcrumb";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Products", href: "/dashboard/admin/products", icon: Package },
    { label: "Collections", href: "/dashboard/admin/collections", icon: FolderTree },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ];

  const SideNav = ({ mobile = false }) => (
    <nav className={`space-y-1 ${mobile ? "px-2" : "px-4"}`}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-linear-to-r from-black to-gray-900 text-white shadow-lg"
                : "text-muted hover:text-black hover:bg-linear-to-r hover:from-black/5 hover:to-gray-50"
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
    <div className="flex min-h-screen bg-linear-to-br from-surface to-[#f5f5f5]">
      {/* Sidebar Desktop */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-black/10 shadow-premium z-40 transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      } hidden lg:block`}>
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
              className="p-2 rounded-lg hover:bg-black/5 transition-colors group"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`} />
            </button>
          </div>
        </div>
        <div className="py-4">
          <SideNav />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-premium z-50 flex lg:hidden items-center justify-between px-6">
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
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-elevated p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <SideNav mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      }`}>
        <div className="min-h-screen pt-24 lg:pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <Breadcrumb />
          <div className="bg-white rounded-2xl shadow-premium border border-black/5 p-8 min-h-[calc(100vh-12rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
