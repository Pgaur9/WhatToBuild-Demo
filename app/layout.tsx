
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import LiquidGlassHeader from "@/components/LiquidGlassHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "What To Build - AI Project Generator",
  description: "Get AI-powered project ideas, find similar repositories, and get a visual plan to build it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-black text-white")}> 
        <div className="min-h-screen w-full relative">
          <LiquidGlassHeader />
          <main className="relative z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

