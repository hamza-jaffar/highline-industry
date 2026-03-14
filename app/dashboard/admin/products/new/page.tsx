"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/app/actions/admin.action";
import ProductForm from "../ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    const result = await saveProduct(formData);
    
    if (result.success) {
      router.push("/dashboard/admin/products");
    } else {
      setError(result.error || "Failed to create product");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/products" className="p-2 hover:bg-black/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-sora font-semibold text-[#111]">New Product</h1>
          <p className="text-muted text-sm">Create a new item in your catalog.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <ProductForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Publish Product"
      />
    </div>
  );
}
