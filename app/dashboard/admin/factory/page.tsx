"use client";

import { useState, useEffect, useRef } from "react";
import { Factory, Save, Upload, X, CheckCircle, AlertCircle, Loader2, Building2, Phone, Mail, MapPin, FileText, Image as ImageIcon } from "lucide-react";
import Heading from "@/components/ui/heading";

type FactoryData = {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    description: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    updatedAt: string | null;
};

type Toast = { type: "success" | "error"; message: string };

export default function FactoryPage() {
    const [factory, setFactory] = useState<FactoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [description, setDescription] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");

    // Upload states
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!factory;

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/factory");
                if (res.ok) {
                    const data: FactoryData | null = await res.json();
                    if (data) {
                        setFactory(data);
                        setName(data.name ?? "");
                        setAddress(data.address ?? "");
                        setPhone(data.phone ?? "");
                        setEmail(data.email ?? "");
                        setDescription(data.description ?? "");
                        setLogoUrl(data.logoUrl ?? "");
                        setCoverImageUrl(data.coverImageUrl ?? "");
                    }
                }
            } catch {
                // No factory yet — form stays empty
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function showToast(type: Toast["type"], message: string) {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    }

    async function handleUpload(file: File, type: "logo" | "cover") {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", type);
        const res = await fetch("/api/factory/upload", { method: "POST", body: fd });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error ?? "Upload failed");
        }
        const { url } = await res.json();
        return url as string;
    }

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingLogo(true);
        try {
            const url = await handleUpload(file, "logo");
            setLogoUrl(url);
        } catch (err: unknown) {
            showToast("error", err instanceof Error ? err.message : "Logo upload failed");
        } finally {
            setUploadingLogo(false);
        }
    }

    async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCover(true);
        try {
            const url = await handleUpload(file, "cover");
            setCoverImageUrl(url);
        } catch (err: unknown) {
            showToast("error", err instanceof Error ? err.message : "Cover upload failed");
        } finally {
            setUploadingCover(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            showToast("error", "Factory name is required");
            return;
        }
        if (!email.trim()) {
            showToast("error", "Email is required to create a factory account");
            return;
        }
        // Password is only required when creating a new factory
        if (!isEditing && (!password || password.length < 6)) {
            showToast("error", "Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/factory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, address, phone, email, password, description, logoUrl, coverImageUrl }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? "Save failed");
            }
            const saved = await res.json();
            setFactory(saved);

            // If it was a new creation, clear the password field after creation
            if (!isEditing) setPassword("");

            showToast("success",
                isEditing
                    ? "Factory updated (Confirmation email sent if email changed)"
                    : "Factory created! A confirmation email has been sent."
            );
        } catch (err: unknown) {
            showToast("error", err instanceof Error ? err.message : "Failed to save factory");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-black/30" />
                    <p className="text-muted text-sm font-medium">Loading factory data…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-elevated border backdrop-blur-sm transition-all duration-300 ${toast.type === "success"
                        ? "bg-green-50/95 border-green-200 text-green-800"
                        : "bg-red-50/95 border-red-200 text-red-800"
                        }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}



            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                {isEditing ?
                    <Heading
                        title="Factory Settings"
                        description="Update your factory information. Changes take effect immediately."
                    /> : <Heading
                        title="Create Your Factory"
                        description="Set up your factory profile. You can only have one factory — this is your global identity."
                    />}
                {isEditing && (
                    <div className="px-4 py-2 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shrink-0">
                        <div className="flex items-center gap-2 text-green-700">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium">Factory Active</span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cover Image */}
                {/* <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-premium bg-gradient-to-br from-gray-50 to-gray-100 group">
                    <div
                        className="w-full h-48 md:h-64 flex items-center justify-center cursor-pointer"
                        onClick={() => coverInputRef.current?.click()}
                    >
                        {coverImageUrl ? (
                            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-black/30 group-hover:text-black/50 transition-colors">
                                <ImageIcon className="w-10 h-10" />
                                <p className="text-sm font-medium">Click to upload cover image</p>
                                <p className="text-xs">PNG, JPG or WebP — max 5MB</p>
                            </div>
                        )}
                        {coverImageUrl && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full text-sm font-medium text-black">
                                    <Upload className="w-4 h-4" />
                                    Change Cover
                                </div>
                            </div>
                        )}
                        {uploadingCover && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-medium">Uploading…</span>
                            </div>
                        )}
                    </div>
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    <div className="absolute bottom-4 left-6">
                        <div
                            className="w-20 h-20 rounded-2xl border-4 border-white shadow-elevated bg-white flex items-center justify-center cursor-pointer overflow-hidden group/logo"
                            onClick={() => logoInputRef.current?.click()}
                        >
                            {logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-black/30 group-hover/logo:text-black/60 transition-colors">
                                    <Building2 className="w-6 h-6" />
                                    <span className="text-[9px] font-semibold uppercase tracking-wider">Logo</span>
                                </div>
                            )}
                            {uploadingLogo && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            )}
                        </div>
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </div>
                </div> */}

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Factory Name */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-black/80">
                            <Factory className="w-4 h-4" />
                            Factory Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Highline Manufacturing"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all text-sm placeholder:text-black/25 font-medium"
                        />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-black/80">
                            <MapPin className="w-4 h-4" />
                            Address
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Industrial Ave, City, Country"
                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all text-sm placeholder:text-black/25"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-black/80">
                            <Phone className="w-4 h-4" />
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all text-sm placeholder:text-black/25"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-black/80">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="factory@company.com"
                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all text-sm placeholder:text-black/25"
                        />
                    </div>

                    {/* Password - Only shown when creating */}
                    {!isEditing && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-black/80">
                                <AlertCircle className="w-4 h-4" />
                                Password <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Secure password for the factory"
                                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all text-sm placeholder:text-black/25"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-black/80">
                            <FileText className="w-4 h-4" />
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief overview of your factory, its specialties, and capabilities…"
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all text-sm placeholder:text-black/25 resize-none leading-relaxed"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                    {isEditing && (
                        <p className="text-xs text-muted">
                            Last saved: {factory?.updatedAt ? new Date(factory.updatedAt).toLocaleString() : "—"}
                        </p>
                    )}
                    <div className={isEditing ? "ml-auto" : "w-full"}>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-black to-gray-800 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-elevated hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditing ? "Update Factory" : "Create Factory"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}