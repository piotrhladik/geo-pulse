"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

export function Hero({ onScrollToScanner }: { onScrollToScanner: () => void }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-300 text-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generative Engine Optimization Platform</span>
          <Zap className="h-3 w-3" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-[family-name:var(--font-fraunces)] text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
        >
          Is Your Brand{" "}
          <span className="gradient-text">Visible</span>
          <br />
          to AI Models?
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          GEO Pulse AI analyzes how ChatGPT, Perplexity, and Gemini see your
          website. Get your AI visibility score and optimized JSON-LD schemas
          in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onScrollToScanner}
            className="glow-button text-base flex items-center gap-2 group"
          >
            Scan Your Website
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#features"
            className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-600 transition-all text-base"
          >
            Learn More
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 flex items-center justify-center gap-8 text-zinc-600 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
            <span>Real-time Analysis</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-zinc-800" />
          <span className="hidden sm:block">1,200+ Sites Analyzed</span>
          <div className="hidden sm:block w-px h-4 bg-zinc-800" />
          <span className="hidden sm:block">JSON-LD Generator</span>
        </motion.div>
      </div>
    </section>
  );
}
