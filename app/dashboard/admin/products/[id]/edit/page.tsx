"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAdminProduct, saveProduct } from "@/app/actions/admin.action";
import ProductForm from "../../ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    const fullId = `gid://shopify/Product/${id}`;
    const result = await getAdminProduct(fullId);
    
    if (result.success) {
      // Transform Shopify data back into the format the form expects
      const transformedData = {
        id: result.data.id,
        title: result.data.title,
        descriptionHtml: result.data.descriptionHtml,
        status: result.data.status,
        productType: result.data.productType || "",
        vendor: result.data.vendor || "Highline Industry",
        options: result.data.options,
        variants: result.data.variants,
        images: result.data.images,
        collections: result.data.collections
      };
      setProduct(transformedData);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (formData: any) => {
    setIsSaving(true);
    setError(null);

    const fullId = `gid://shopify/Product/${id}`;
    const result = await saveProduct(formData, fullId);
    
    if (result.success) {
      router.push(`/dashboard/admin/products/${id}`);
      router.refresh();
    } else {
      setError(result.error || "Failed to update product");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        <p className="text-sm text-muted mt-4">Loading product data...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-sora font-semibold text-[#111]">Product Not Found</h2>
        <p className="text-muted">{error || "The product you are trying to edit could not be found."}</p>
        <Link 
          href="/dashboard/admin/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/products/${id}`} className="p-2 hover:bg-black/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-sora font-semibold text-[#111]">Edit Product</h1>
          <p className="text-muted text-sm">Update your product details and variants.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <ProductForm 
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitLabel="Save Changes"
      />
    </div>
  );
}
