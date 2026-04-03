"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CopyProductLink({ productHandle, affiliateCode }: { productHandle: string, affiliateCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/product/${productHandle}?ref=${affiliateCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Affiliate link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-2 bg-black text-white rounded-lg hover:bg-black/80 transition-all shadow-sm flex items-center gap-2 group"
      title="Copy Affiliate Link"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">Copy Link</span>
    </button>
  );
}
