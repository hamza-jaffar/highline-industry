import React from "react";
import NavBar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { createServerClient } from "@/lib/supabase/server-client";

const FrontendLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col min-h-screen">
      <NavBar user={user} />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default FrontendLayout;
