"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCollection } from "@/app/actions/admin.action";

export default function NewCollectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    handle: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await createCollection(formData.title, formData.handle || undefined);
    
    if (result.success) {
      router.push("/dashboard/admin/collections");
    } else {
      setError(result?.errors?.[0]?.message || "Failed to create collection");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/collections" className="p-2 hover:bg-black/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-sora font-semibold text-[#111]">New Collection</h1>
          <p className="text-[#737373] text-sm">Create a new group for your products.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111]">Collection Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. FW25 Heavyweight Drop"
              className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111]">Handle (Optional)</label>
            <input 
              type="text" 
              value={formData.handle}
              onChange={(e) => setFormData({...formData, handle: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              placeholder="e.g. fw25-heavyweight"
              className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all font-mono"
            />
            <p className="text-[10px] text-[#737373] italic">Leave blank to auto-generate from title.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link 
            href="/dashboard/admin/collections"
            className="px-6 py-2.5 bg-white border border-black/10 rounded-xl text-sm font-semibold hover:bg-[#fafafa] transition-all"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Collection
          </button>
        </div>
      </form>
    </div>
  );
}
