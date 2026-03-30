"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Loader2, Save, Building2, Mail, Phone, MapPin, 
  FileText, ImageIcon, Layout 
} from "lucide-react";
import { updateFactoryProfile } from "@/app/actions/factory.action";
import { type Factory } from "@/db/schemas/factory.schema";

interface FactoryProfileFormProps {
  initialData: Factory | null;
}

export function FactoryProfileForm({ initialData }: FactoryProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
    logoUrl: initialData?.logoUrl || "",
    coverImageUrl: initialData?.coverImageUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await updateFactoryProfile(formData);
      
      if (result.success) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-black/5">
            <Building2 className="w-5 h-5 text-black/40" />
            <h2 className="text-lg font-semibold text-black">Company Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-black/70">Factory Name</label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter factory name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all font-inter text-sm"
                  required
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-black/70">Business Email</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="factory@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all font-inter text-sm"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-black/70">Phone Number</label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all font-inter text-sm"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="address" className="text-sm font-medium text-black/70">Location Address</label>
              <div className="relative">
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Industrial Way, Suite 100"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all font-inter text-sm"
                />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Branding & Media */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-black/5">
            <Layout className="w-5 h-5 text-black/40" />
            <h2 className="text-lg font-semibold text-black">Branding & Media</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-black/70">Factory Description</label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe your factory's specialties and capabilities..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all font-inter text-sm resize-none"
                />
                <FileText className="absolute left-3.5 top-4 w-4 h-4 text-black/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="logoUrl" className="text-sm font-medium text-black/70">Logo URL</label>
              <div className="relative">
                <input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all font-inter text-sm"
                />
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="coverImageUrl" className="text-sm font-medium text-black/70">Cover Image URL</label>
              <div className="relative">
                <input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-black/10 rounded-xl focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all font-inter text-sm"
                />
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-black/5 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all shadow-premium disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
