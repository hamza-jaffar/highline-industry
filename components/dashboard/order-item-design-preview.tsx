"use client";

import { useEffect, useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface OrderItemDesignPreviewProps {
  designId: string;
}

export default function RenderDesignPreview({ designId }: OrderItemDesignPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDesign() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_designs")
        .select("preview_url")
        .eq("id", designId)
        .single();

      if (!error && data) {
        setPreviewUrl(data.preview_url);
      }
      setLoading(false);
    }

    fetchDesign();
  }, [designId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
        <Package className="w-8 h-8" />
      </div>
    );
  }

  return (
    <img 
        src={previewUrl} 
        alt="Custom Design" 
        className="w-full h-full object-contain p-2 hover:scale-110 transition-transform duration-500" 
    />
  );
}
