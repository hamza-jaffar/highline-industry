"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, X, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const links = [
    { name: "New Arrivals", href: "/shop?sort=new" },
    { name: "Shop", href: "/shop" },
    { name: "Collection", href: "/shop?category=collections" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-lg font-sora font-bold tracking-tight text-black flex items-center"
          >
            HIGHLINE
          </Link>

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
              <Search className="w-[18px] h-[18px]" />
            </button>
            
            <Link 
              href="/login"
              className="hidden md:flex text-black/60 hover:text-black transition-colors"
              aria-label="Account"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>

            <Link 
              href="/shop"
              className="hidden md:flex items-center justify-center h-8 px-4 bg-black text-white text-xs font-semibold rounded-md hover:bg-black/80 transition-colors shadow-sm"
            >
              Shop Now
            </Link>

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
            <div className="h-[1px] w-full bg-black/5 my-2" />
            <Link 
              href="/login"
              className="text-sm font-medium text-black/80 hover:text-black flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Account
            </Link>
          </div>
        )}
      </nav>

      {/* Search Modal (Precision Look) */}
      <div 
        className={`fixed inset-0 z-[200] bg-white/95 backdrop-blur-sm transition-opacity duration-300 flex flex-col items-center pt-32 px-6 ${
          searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button 
          onClick={() => setSearchOpen(false)}
          className="absolute top-6 right-6 p-2 text-black/50 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="w-full max-w-2xl space-y-6">
          <form className="relative w-full flex items-center border-b border-black/10 pb-4" onSubmit={(e) => { e.preventDefault(); setSearchOpen(false); }}>
            <Search className="w-6 h-6 text-black/40 mr-4" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-transparent text-2xl font-inter font-medium text-black focus:outline-none placeholder:text-black/20"
              autoFocus={searchOpen}
            />
          </form>
          <div className="flex gap-4 pt-4">
            <span className="text-xs font-semibold text-black/40 uppercase tracking-wider">Suggestions:</span>
            {["T-Shirts", "Outerwear", "Heavyweight", "Accessories"].map(term => (
              <button key={term} className="text-xs font-medium text-black/60 hover:text-black transition-colors">
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
