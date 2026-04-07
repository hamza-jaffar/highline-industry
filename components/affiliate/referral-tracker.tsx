"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const hasTracked = useRef(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    
    // Only track once per page load if the ref parameter is present
    if (ref && !hasTracked.current) {
      hasTracked.current = true;
      
      // Call the tracking API
      fetch("/api/affiliate/track-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: ref }),
      }).catch((err) => {
        console.error("Failed to track affiliate click:", err);
      });
    }
  }, [searchParams]);

  return null;
}
