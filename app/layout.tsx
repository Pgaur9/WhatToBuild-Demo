import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
        <div className="min-h-screen w-full relative bg-black">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
            }}
          />
          <main className="relative z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
