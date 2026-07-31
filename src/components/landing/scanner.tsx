"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import type { GeoAuditResult } from "@/types/geo";
import { useToast } from "@/components/ui/toast";

const SCAN_STEPS = [
  "Checking structured data...",
  "Analyzing entity markup...",
  "Querying LLM visibility...",
  "Evaluating knowledge graph...",
  "Generating recommendations...",
];

export function Scanner() {
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [scanning, setScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<GeoAuditResult | null>(null);
  const { addToast } = useToast();

  const handleScan = async (e: FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      addToast("Please enter a website URL", "error");
      return;
    }
    if (!brand.trim()) {
      addToast("Please enter your brand name", "error");
      return;
    }

    setScanning(true);
    setResult(null);
    setCurrentStep(0);

    // Animate through scanning steps
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: url, brandName: brand }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Audit failed" }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data: GeoAuditResult = await res.json();
      setResult(data);
      addToast(`Audit complete! GEO Score: ${data.geoScore}/100`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audit failed";
      console.error("[Scanner] Audit error:", message);
      addToast(message, "error");
    } finally {
      setScanning(false);
    }
  };

  return (
    <section id="scanner" className="py-24 px-6 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl sm:text-4xl font-bold mb-4">
            Scan Your <span className="gradient-text">Website</span>
          </h2>
          <p className="text-zinc-400">
            Enter your URL below to get your AI visibility report in seconds.
          </p>
        </motion.div>

        {/* Scanner Form */}
        <motion.form
          onSubmit={handleScan}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                disabled={scanning}
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand Name"
                disabled={scanning}
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={scanning}
            className="glow-button w-full text-center flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze AI Visibility
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.form>

        {/* Scanning Animation */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 glass-card p-6 space-y-3 overflow-hidden"
            >
              {SCAN_STEPS.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: i <= currentStep ? 1 : 0.3,
                    x: 0,
                  }}
                  className="flex items-center gap-3 text-sm"
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : i === currentStep ? (
                    <Loader2 className="h-4 w-4 text-violet-400 animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span
                    className={
                      i <= currentStep ? "text-zinc-200" : "text-zinc-600"
                    }
                  >
                    {step}
                  </span>
                </motion.div>
              ))}

              {/* Progress bar */}
              <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  animate={{ width: `${((currentStep + 1) / SCAN_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Result Preview */}
        <AnimatePresence>
          {result && !scanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass-card p-8"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Score */}
                <div className="text-center">
                  <div
                    className={`text-5xl font-bold ${
                      result.geoScore >= 70
                        ? "text-emerald-400"
                        : result.geoScore >= 45
                          ? "text-amber-400"
                          : "text-red-400"
                    }`}
                  >
                    {result.geoScore}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                    GEO Score
                  </div>
                </div>

                <div className="hidden sm:block w-px h-16 bg-zinc-800" />

                {/* Summary */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-zinc-200">
                      {result.gaps.length} Gaps Detected
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {result.aiSummary}
                  </p>
                </div>
              </div>

              {/* LLM Breakdown */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800">
                {(
                  [
                    ["ChatGPT", result.llmVisibilityBreakdown.chatgpt],
                    ["Perplexity", result.llmVisibilityBreakdown.perplexity],
                    ["Gemini", result.llmVisibilityBreakdown.gemini],
                  ] as const
                ).map(([name, score]) => (
                  <div key={name} className="text-center">
                    <div className="text-xs text-zinc-500 mb-1">{name}</div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <div className="text-sm text-zinc-300 mt-1">{score}%</div>
                  </div>
                ))}
              </div>

              {/* CTA to full dashboard */}
              <div className="mt-6 text-center">
                <a
                  href={`/dashboard?url=${encodeURIComponent(url)}&brand=${encodeURIComponent(brand)}`}
                  className="glow-button inline-flex items-center gap-2 text-sm"
                >
                  View Full Report
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
