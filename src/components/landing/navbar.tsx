"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow">
            G
          </div>
          <span className="font-semibold text-zinc-100 tracking-tight">
            GEO Pulse AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a
            href="#features"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Features
          </a>
          <a
            href="#scanner"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Scanner
          </a>
          <a
            href="#pricing"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Pricing
          </a>
          <Link
            href="/login"
            className="ml-2 px-4 py-2 rounded-lg border border-zinc-700/80 text-zinc-200 hover:border-violet-500/50 hover:text-white transition-all text-sm font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 transition-all text-sm font-medium"
          >
            Dashboard
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-zinc-400 hover:text-zinc-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {[
                { href: "#features", label: "Features" },
                { href: "#scanner", label: "Scanner" },
                { href: "#pricing", label: "Pricing" },
                { href: "/login", label: "Sign in" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
