import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Highline | Premium Apparel",
  description: "Fashion-forward clothing and accessories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased bg-surface text-[#111] min-h-screen selection:bg-black selection:text-white relative`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" toastOptions={{
          style: {
            background: 'white',
            color: '#111',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            fontFamily: 'var(--font-inter)',
          }
        }} />
      </body>
    </html>
  );
}
