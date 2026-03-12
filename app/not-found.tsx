import Link from "next/link";
import { MoveRight } from "lucide-react";
import NavBar from "@/app/components/navbar";
import Footer from "@/app/components/footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-grow flex flex-col items-center justify-center px-6 selection:bg-black selection:text-white py-32">
        <div className="max-w-xl text-center space-y-8">
          {/* 404 Typography */}
          <h1 className="text-[8rem] md:text-[12rem] font-sora font-semibold text-[#111] leading-none tracking-tighter">
            404
          </h1>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-sora font-semibold text-[#111]">
              Page Not Found
            </h2>
            <p className="text-base text-[#737373] font-inter max-w-sm mx-auto leading-relaxed">
              The infrastructure you are looking for has been moved, deleted, or does not exist.
            </p>
          </div>

          {/* Action */}
          <div className="pt-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#111] text-white text-sm font-semibold rounded-md shadow-premium hover:bg-black transition-colors group"
            >
              Return to HQ
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
