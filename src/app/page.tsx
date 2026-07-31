"use client";

import { useRef } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Scanner } from "@/components/landing/scanner";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import { ToastProvider } from "@/components/ui/toast";

export default function HomePage() {
  const scannerRef = useRef<HTMLDivElement>(null);

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ToastProvider>
      <div className="relative min-h-screen">
        <Navbar />
        <main className="pt-16">
          <Hero onScrollToScanner={scrollToScanner} />
          <Features />
          <div ref={scannerRef}>
            <Scanner />
          </div>
          <Pricing />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
