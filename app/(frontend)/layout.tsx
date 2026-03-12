import React from "react";
import NavBar from "@/app/components/navbar";
import Footer from "@/app/components/footer";

const FrontendLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default FrontendLayout;
