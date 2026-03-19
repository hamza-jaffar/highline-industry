import type { Metadata } from "next";
import { 
  Inter, 
  Sora, 
  Permanent_Marker, 
  Dancing_Script, 
  Bungee, 
  Press_Start_2P, 
  Bebas_Neue, 
  Monoton, 
  Fascinate 
} from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ["latin"], variable: "--font-permanent-marker", display: "swap" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script", display: "swap" });
const bungee = Bungee({ weight: '400', subsets: ["latin"], variable: "--font-bungee", display: "swap" });
const pressStart2P = Press_Start_2P({ weight: '400', subsets: ["latin"], variable: "--font-press-start", display: "swap" });
const bebasNeue = Bebas_Neue({ weight: '400', subsets: ["latin"], variable: "--font-bebas-neue", display: "swap" });
const monoton = Monoton({ weight: '400', subsets: ["latin"], variable: "--font-monoton", display: "swap" });
const fascinate = Fascinate({ weight: '400', subsets: ["latin"], variable: "--font-fascinate", display: "swap" });

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
        className={`${inter.variable} ${sora.variable} ${permanentMarker.variable} ${dancingScript.variable} ${bungee.variable} ${pressStart2P.variable} ${bebasNeue.variable} ${monoton.variable} ${fascinate.variable} font-sans antialiased bg-surface text-[#111] min-h-screen selection:bg-black selection:text-white relative`}
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
