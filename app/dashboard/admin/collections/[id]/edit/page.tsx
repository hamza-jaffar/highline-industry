"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAdminCollection, saveCollection } from "@/app/actions/admin.action";
import CollectionForm from "../../CollectionForm";

export default function EditCollectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    setIsLoading(true);
    const fullId = `gid://shopify/Collection/${id}`;
    const result = await getAdminCollection(fullId);
    
    if (result.success) {
      // Transform Shopify data back into the format the form expects
      const transformedData = {
        id: result.data.id,
        title: result.data.title,
        handle: result.data.handle,
        description: result.data.descriptionHtml || "",
        parentId: result.data.metafield?.value || "",
        imageUrl: result.data.image?.url || ""
      };
      setCollection(transformedData);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (formData: any) => {
    setIsSaving(true);
    setError(null);

    const result = await saveCollection(formData);
    
    if (result.success) {
      router.push("/dashboard/admin/collections");
      router.refresh();
    } else {
      setError(result.error || "Failed to update collection. Please check your input and try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        <p className="text-sm text-[#737373] mt-4">Retrieving collection metadata...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-sora font-semibold text-[#111]">Collection Not Found</h2>
        <p className="text-[#737373]">{error || "The collection you are trying to edit could not be found."}</p>
        <Link 
          href="/dashboard/admin/collections"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/collections/${id}`} className="p-2 hover:bg-black/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-sora font-semibold text-[#111]">Edit Collection</h1>
          <p className="text-[#737373] text-sm">Modify the structure and content of this group.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <CollectionForm 
        initialData={collection}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitLabel="Save Changes"
      />
    </div>
  );
}
