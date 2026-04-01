"use client";

import { useState } from "react";
import { registerAffiliateAction } from "@/app/actions/affiliate.action";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AffiliateRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await registerAffiliateAction(formData);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "An unknown error occurred");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Visual / Branding Sidebar */}
      <div className="hidden md:flex flex-col justify-end w-2/5 min-h-[calc(100vh-4rem)] p-12 bg-black text-white relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&q=80&w=1200"
          alt="Athlete Working Out"
          fill
          className="object-cover opacity-40 mix-blend-luminosity brightness-75 grayscale"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black via-black/80 to-transparent" />

        <div className="relative z-10 space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
            Highline Industry
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9]">
            Build <br />
            Your <br />
            <span className="italic text-white/40">Legacy.</span>
          </h1>
          <p className="font-medium text-white/70 max-w-sm mt-4">
            Join the definitive athletic partner program. Drive traffic, earn
            massive commissions, and equip athletes securely.
          </p>

          <div className="flex items-center gap-6 mt-12 text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-4xl tracking-tighter text-white">10%</span>
              <span className="text-white/40">Base Margin</span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex flex-col gap-1">
              <span className="text-4xl tracking-tighter text-white">30d</span>
              <span className="text-white/40">Cookie Life</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Registration Area */}
      <div className="flex-1 flex items-center justify-center p-6 py-24 md:py-12 bg-[#fcfcfc]">
        <div className="max-w-md w-full">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-4xl font-sora font-black tracking-tight text-[#111] uppercase">
              Partner Access
            </h2>
            <p className="mt-3 text-sm text-black/50 font-medium leading-relaxed">
              Create your account immediately to unlock your referral URL and
              dashboard.
            </p>
          </div>

          {success ? (
            <div className="bg-white border-2 border-black rounded-xl p-10 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700">
              <div className="absolute top-0 inset-x-0 h-1 bg-black animate-pulse" />
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <MailCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-4">
                Verification Required
              </h3>
              <p className="text-sm text-black/60 mb-8 font-medium leading-relaxed">
                We've sent an exclusive verification link to your email. You
                MUST click it to authorize your account before accessing the
                affiliate dashboard.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-8 py-5 bg-black text-white text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black/80 hover:-translate-y-1 transition-all"
              >
                Proceed to Login
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-black/10 rounded-xl p-8 shadow-2xl">
              <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-xs font-bold tracking-wide rounded-2xl border border-red-100 flex gap-2 items-center">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-[10px] font-black text-black/70 uppercase tracking-widest pl-1"
                  >
                    Legal Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={loading}
                    className="w-full px-5 py-4 bg-black/3 border-2 border-transparent focus:border-black rounded-xl text-sm text-black placeholder:text-black/30 placeholder:font-medium focus:outline-none transition-all disabled:opacity-50"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-[10px] font-black text-black/70 uppercase tracking-widest pl-1"
                    >
                      Secure Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={loading}
                      className="w-full px-5 py-4 bg-black/3 border-2 border-transparent focus:border-black rounded-xl text-sm text-black placeholder:text-black/30 placeholder:font-medium focus:outline-none transition-all disabled:opacity-50"
                      placeholder="athlete@mail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-[10px] font-black text-black/70 uppercase tracking-widest pl-1"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      disabled={loading}
                      className="w-full px-5 py-4 bg-black/3 border-2 border-transparent focus:border-black rounded-xl text-sm text-black placeholder:text-black/30 placeholder:font-medium focus:outline-none transition-all disabled:opacity-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="socialMediaUrl"
                    className="text-[10px] font-black text-black/70 uppercase tracking-widest pl-1"
                  >
                    Primary Distribution URL
                  </label>
                  <input
                    id="socialMediaUrl"
                    name="socialMediaUrl"
                    type="url"
                    disabled={loading}
                    className="w-full px-5 py-4 bg-black/3 border-2 border-transparent focus:border-black rounded-xl text-sm text-black placeholder:text-black/30 placeholder:font-medium focus:outline-none transition-all disabled:opacity-50"
                    placeholder="https://instagram.com/johndoe"
                  />
                  <p className="text-[10px] font-medium text-black/40 pl-1 pt-1">
                    Optional, but strongly required for expedited approval.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 flex items-center justify-between px-8 py-5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer shadow-xl disabled:opacity-50 group"
                >
                  {loading ? "Authorizing..." : "Submit Application"}
                  {!loading && (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
              Already an affiliate?{" "}
              <Link href="/login" className="text-black hover:underline">
                Sign In.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
