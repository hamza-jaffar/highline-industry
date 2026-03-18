"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  ShoppingCart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppLogo from "../app-logo";
import { signout } from "@/app/actions/signup.actions";

const navItems = [
  { name: "Overview", href: "/dashboard/user", icon: LayoutDashboard },
  // { name: "My Projects", href: "/dashboard/user/projects", icon: Palette },
  // { name: "Orders", href: "/dashboard/user/orders", icon: ShoppingCart },
  // { name: "Addresses", href: "/dashboard/user/addresses", icon: MapPin },
  // { name: "Billing", href: "/dashboard/user/billing", icon: CreditCard },
  // { name: "Settings", href: "/dashboard/user/settings", icon: Settings },
];

export function SidebarNav({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen border-r border-black/5 bg-white w-64 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 flex gap-2 items-center">
        <AppLogo size={32} />
        <span className="text-lg font-sora font-bold tracking-tight text-black">HIGHLINE</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between p-2 text-sm font-medium rounded-lg transition-all",
                isActive
                  ? "bg-black text-white shadow-sm"
                  : "text-black/60 hover:text-black hover:bg-black/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-black/40 group-hover:text-black")} />
                {item.name}
              </div>
              {/* {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/50" />} */}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-black/5 bg-surface/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
            {user?.email?.[0] || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-black truncate">{user?.email}</span>
            <span className="text-[10px] text-black/40 font-medium capitalize">User Account</span>
          </div>
        </div>
        <form action={signout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
