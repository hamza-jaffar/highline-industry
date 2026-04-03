"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { logAffiliateClickAction } from "@/app/actions/affiliate.action";

export default function RefTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      // 1. Log the click in the database
      logAffiliateClickAction(ref).then((res) => {
        if (res.success) {
          // 2. Store the affiliate code in a cookie for 30 days
          // Using document.cookie for simplicity in client component, 
          // though a server action could also do it.
          document.cookie = `highline_affiliate_id=${ref}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
          console.log("Affiliate referral tracked:", ref);
        }
      });
    }
  }, [ref]);

  return null; // This component doesn't render anything
}
