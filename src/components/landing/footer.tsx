"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-12 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            G
          </div>
          <span className="font-semibold text-zinc-200">GEO Pulse AI</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-zinc-500">
          <a href="#features" className="hover:text-zinc-300 transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-zinc-300 transition-colors">
            Pricing
          </a>
          <a href="#scanner" className="hover:text-zinc-300 transition-colors">
            Scanner
          </a>
        </nav>

        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} GEO Pulse AI. All rights reserved.
        </p>
      </motion.div>
    </footer>
  );
}
