import React from 'react';
import Link from 'next/link';
import AppLogo from './app-logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-black/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-6">
            <AppLogo size={40} />
            <p className="text-muted text-sm leading-relaxed max-w-sm font-inter">
              Your factory as a service. Redefining the apparel supply chain through digital infrastructure and premium craftsmanship.
            </p>
          </div>

          {/* Market Section */}
          <div>
            <h4 className="font-sora text-sm font-semibold tracking-tight mb-6 text-black">Market</h4>
            <ul className="space-y-4">
              {['New Arrivals', 'Shop All', 'Collections', 'Accessories'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-muted hover:text-black text-sm transition-colors block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Assistance Section */}
          <div>
            <h4 className="font-sora text-sm font-semibold tracking-tight mb-6 text-black">Assistance</h4>
            <ul className="space-y-4">
              {['Shipping', 'Size Guide', 'FAQ', 'Contact'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-muted hover:text-black text-sm transition-colors block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="font-sora text-sm font-semibold tracking-tight mb-6 text-black">Stay Updated</h4>
            <p className="text-muted text-sm mb-6 font-inter leading-relaxed">Early access to drops and industrial insights.</p>
            <form className="relative flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-surface border border-black/5 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/20 transition-all placeholder:text-[#a3a3a3]"
              />
              <button 
                type="submit" 
                className="w-full bg-black text-white text-sm font-semibold rounded-md py-3 hover:bg-black/80 transition-colors shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[#a3a3a3] font-inter">
            © {currentYear} Highline Industry Inc. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
              <Link key={social} href="#" className="text-xs text-[#a3a3a3] hover:text-black transition-colors font-inter">
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;