import React from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createServerClient } from "@/lib/supabase/server-client";
import CartDrawer from "@/components/cart-drawer";

const FrontendLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col min-h-screen">
      <NavBar user={user} />
      <div className="grow pt-16">
        {children}
      </div>
      <Footer />
      <CartDrawer />
    </main>
  );
};

export default FrontendLayout;
