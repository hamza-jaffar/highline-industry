"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 selection:bg-black selection:text-white py-12">
      {/* Brand */}
      <Link 
        href="/" 
        className="text-2xl font-sora font-bold tracking-tight text-black mb-8"
      >
        HIGHLINE
      </Link>
      
      {/* Card */}
      <div className="w-full max-w-[400px] bg-white border border-black/10 shadow-elevated rounded-2xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-sora font-semibold text-[#111] mb-2">Create Account</h1>
          <p className="text-[#737373] text-sm font-inter">
            Get your factory dashboard up and running in seconds.
          </p>
        </div>

        {/* Form */}
        <form className="w-full space-y-5">
          <div className="space-y-1.5">
            <label 
              htmlFor="name" 
              className="text-sm font-medium text-[#111]"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fafafa] border border-black/10 rounded-md focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-shadow font-inter text-sm placeholder:text-[#a3a3a3]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label 
              htmlFor="email" 
              className="text-sm font-medium text-[#111]"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fafafa] border border-black/10 rounded-md focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-shadow font-inter text-sm placeholder:text-[#a3a3a3]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label 
              htmlFor="password" 
              className="text-sm font-medium text-[#111]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fafafa] border border-black/10 rounded-md focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-shadow font-inter text-sm placeholder:text-[#a3a3a3]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-[#111] text-white text-sm font-semibold rounded-md hover:bg-black transition-colors shadow-sm"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-black/5 text-center">
          <p className="text-sm text-[#737373] font-inter">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}