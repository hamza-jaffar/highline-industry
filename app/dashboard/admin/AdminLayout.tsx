"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, FolderTree, LayoutDashboard, Settings, X } from "lucide-react";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
              ? "bg-black text-white shadow-shadow-sm"
              : "text-[#737373] hover:text-black hover:bg-black/5"
              }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-black/5 z-40 hidden lg:block">
        <div className="p-8">
          <Link href="/" className="text-xl font-sora font-bold tracking-tight text-black flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-black rounded-lg" /> */}
            <Image src="/logo.png" alt="Logo" width={28} height={28} />
            HIGHLINE
          </Link>
        </div>
        <SideNav />
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-black/5 z-50 flex lg:hidden items-center justify-between px-6">
        <Link href="/" className="text-lg font-sora font-bold tracking-tight text-black flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-lg" />
          HIGHLINE
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-black/60 hover:text-black transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <div className="space-y-1.5"><div className="w-6 h-0.5 bg-black" /><div className="w-6 h-0.5 bg-black" /></div>}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <SideNav mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 min-w-0 overflow-x-hidden">
        <div className="min-h-screen pt-24 lg:pt-12 pb-20 px-4 md:px-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
