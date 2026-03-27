import Link from "next/link";
import { MoveRight, FileSearch } from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 shadow-inner">
            <FileSearch className="w-12 h-12 text-slate-400" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-sora font-bold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-base text-slate-500 font-medium leading-relaxed">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/dashboard/user"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
          >
            Back to HQ
            <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
