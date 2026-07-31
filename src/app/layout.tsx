import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { Fraunces } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "GEO Pulse AI — Generative Engine Optimization Platform",
  description:
    "Analyze your website visibility in AI responses from ChatGPT, Perplexity & Gemini. Get optimized JSON-LD schemas and knowledge base entries.",
  keywords: ["GEO", "AI SEO", "JSON-LD", "schema.org", "ChatGPT visibility", "AI optimization"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="font-[family-name:var(--font-geist)] antialiased">
        {children}
      </body>
    </html>
  );
}
