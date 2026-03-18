"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, X, Menu, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signout } from "@/app/actions/signup.actions";
import Image from "next/image";
import AppLogo from "./app-logo";
import { ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleCart } from "@/lib/store/cartSlice";

export default function NavBar({ user }: { user?: any }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart.data);
  const cartItemsCount = cart?.lines?.edges?.length || 0;

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setSearchTerm("");
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleSuggestionClick = (term: string) => {
    router.push(`/shop?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

  const links = [
    { name: "New Arrivals", href: "/shop?sort=new" },
    { name: "Shop", href: "/shop" },
    { name: "Collection", href: "/collections" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-100 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <AppLogo />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-black/60 hover:text-black transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-black/60 hover:text-black transition-colors"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {user ? (
              <div className="flex gap-4">
                <form action={signout} className="hidden md:flex">
                  <button
                    type="submit"
                    className="text-black/60 hover:text-black transition-colors flex items-center gap-2"
                    title="Sign Out"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </form>
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center justify-center h-8 px-4 bg-black text-white text-xs font-semibold rounded-md hover:bg-black/80 transition-colors shadow-sm"
                  aria-label="Dashboard"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex text-black/60 hover:text-black transition-colors"
                aria-label="Account"
              >
                <User className="w-4.5 h-4.5" />
              </Link>
            )}


            <button
              onClick={() => dispatch(toggleCart())}
              className="relative text-black/60 hover:text-black transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in-0 duration-300">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-black/80 hover:text-black transition-colors"
              aria-label="Toggle Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-black/5 shadow-premium flex flex-col py-4 px-6 gap-4">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-black/80 hover:text-black"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px w-full bg-black/5 my-2" />

            {user ? (
              <form action={signout}>
                <button
                  type="submit"
                  className="text-sm font-medium text-black/80 hover:text-black flex items-center gap-2 w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-black/80 hover:text-black flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Account
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Search Modal (Precision Look) */}
      <div
        className={`fixed inset-0 z-200 bg-white/95 backdrop-blur-sm transition-opacity duration-300 flex flex-col items-center pt-32 px-6 ${searchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      >
        <button
          onClick={() => setSearchOpen(false)}
          className="absolute top-6 right-6 p-2 text-black/50 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full max-w-2xl space-y-6">
          <form
            className="relative w-full flex items-center border-b border-black/10 pb-4"
            onSubmit={handleSearchSubmit}
          >
            <Search className="w-6 h-6 text-black/40 mr-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-2xl font-inter font-medium text-black focus:outline-none placeholder:text-black/20"
              autoFocus={searchOpen}
            />
          </form>
          <div className="flex gap-4 pt-4">
            <span className="text-xs font-semibold text-black/40 uppercase tracking-wider">
              Suggestions:
            </span>
            {["T-Shirts", "Outerwear", "Heavyweight", "Accessories"].map(
              (term) => (
                <button
                  key={term}
                  onClick={() => handleSuggestionClick(term)}
                  className="text-xs font-medium text-black/60 hover:text-black transition-colors"
                >
                  {term}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
}
