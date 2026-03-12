"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { saveCollection } from "@/app/actions/admin.action";
import CollectionForm from "../CollectionForm";

export default function NewCollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parentId");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialData = parentId ? {
    title: "",
    handle: "",
    description: "",
    parentId: parentId,
    imageUrl: ""
  } : undefined;

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    const result = await saveCollection(formData);
    
    if (result.success) {
      router.push("/dashboard/admin/collections");
    } else {
      setError(result.error || "Failed to create collection. Please check your input and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/collections" className="p-2 hover:bg-black/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-sora font-semibold text-[#111]">New Collection</h1>
          <p className="text-[#737373] text-sm">Create a new group for your products.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <CollectionForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Collection"
      />
    </div>
  );
}
