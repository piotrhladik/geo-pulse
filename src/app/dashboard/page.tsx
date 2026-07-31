"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  Search,
  ArrowRight,
  Loader2,
  BarChart3,
  Code2,
  Target,
  Lightbulb,
  FileJson,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { GlassCard } from "@/components/ui/glass-card";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Paywall } from "@/components/paywall";
import type { GeoAuditResult } from "@/types/geo";

interface SubscriptionStatus {
  isPro: boolean;
  plan: string;
  credits: number;
  canAudit: boolean;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";
  const initialBrand = searchParams.get("brand") || "";
  const checkoutSuccess = searchParams.get("success") === "true";

  const [url, setUrl] = useState(initialUrl);
  const [brand, setBrand] = useState(initialBrand);
  const [result, setResult] = useState<GeoAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "gaps" | "schema" | "recommendations">("overview");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const { addToast } = useToast();

  // Show success message after checkout
  useEffect(() => {
    if (checkoutSuccess) {
      addToast("Payment successful! You now have Pro access.", "success");
      // Clean URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [checkoutSuccess, addToast]);

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        }
      } catch (err) {
        console.error("[Dashboard] Subscription check failed:", err);
        // Default to allowing audits
        setSubscription({ isPro: false, plan: "free", credits: 3, canAudit: true });
      }
    };
    checkSubscription();
  }, []);

  const runAudit = useCallback(async (siteUrl: string, brandName: string) => {
    if (!siteUrl || !brandName) return;

    // Check if user can audit
    if (subscription && !subscription.canAudit) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, brandName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Audit failed" }));
        
        // Check if it's a credits error
        if (res.status === 403 && data.error?.includes("credits")) {
          setShowPaywall(true);
          return;
        }
        
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: GeoAuditResult = await res.json();
      setResult(data);

      // Update credits locally
      if (subscription && !subscription.isPro) {
        setSubscription((prev) =>
          prev
            ? { ...prev, credits: Math.max(0, prev.credits - 1), canAudit: prev.credits > 1 }
            : null
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audit failed";
      console.error("[Dashboard] Error:", message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, subscription]);

  useEffect(() => {
    if (initialUrl && initialBrand && subscription?.canAudit) {
      runAudit(initialUrl, initialBrand);
    }
  }, [initialUrl, initialBrand, subscription?.canAudit, runAudit]);

  const handleNewAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !brand.trim()) {
      addToast("Please fill in both URL and brand name", "error");
      return;
    }
    await runAudit(url, brand);
  };

  const copySchema = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.jsonLdSchema, null, 2));
    setCopied(true);
    addToast("JSON-LD schema copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSchema = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.jsonLdSchema, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `geo-schema-${brand.toLowerCase().replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    addToast("JSON-LD schema downloaded!", "success");
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: BarChart3 },
    { key: "gaps" as const, label: "AI Gaps", icon: Target },
    { key: "schema" as const, label: "JSON-LD", icon: Code2 },
    { key: "recommendations" as const, label: "Actions", icon: Lightbulb },
  ];

  // Show paywall if user has no credits
  if (showPaywall || (subscription && !subscription.canAudit && !result)) {
    return (
      <div className="min-h-screen">
        <DashboardHeader subscription={subscription} />
        <Paywall creditsUsed={3} totalCredits={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader subscription={subscription} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Credits Banner for Free Users */}
        {subscription && !subscription.isPro && subscription.credits > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-amber-200">
                You have <span className="font-bold">{subscription.credits}</span> free audit{subscription.credits !== 1 ? "s" : ""} remaining this month.
              </span>
            </div>
            <a
              href="/#pricing"
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Upgrade to Pro →
            </a>
          </motion.div>
        )}

        {/* Pro Badge */}
        {subscription?.isPro && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-violet-400" />
            <span className="text-sm text-violet-200">
              <span className="font-bold">Pro Plan Active</span> — Unlimited audits enabled
            </span>
          </motion.div>
        )}

        {/* New Audit Form */}
        <form onSubmit={handleNewAudit} className="mb-8">
          <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand name..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="glow-button flex items-center gap-2 text-sm px-6 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Analyze
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-10 w-10 text-violet-400 animate-spin mb-4" />
            <p className="text-zinc-400">Analyzing AI visibility...</p>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-20 w-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">
              <FileJson className="h-10 w-10 text-violet-400" />
            </div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold mb-3">
              Ready to Analyze
            </h2>
            <p className="text-zinc-400 max-w-md">
              Enter a website URL and brand name above to generate your AI
              visibility report and JSON-LD schema.
            </p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Tab Navigation */}
              <div className="flex gap-1 mb-8 p-1 glass-card w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Score Card */}
                  <GlassCard className="lg:row-span-2 flex flex-col items-center justify-center">
                    <ScoreRing score={result.geoScore} />
                    <p className="text-sm text-zinc-400 mt-4 text-center max-w-xs">
                      {result.aiSummary}
                    </p>
                  </GlassCard>

                  {/* LLM Breakdown */}
                  <GlassCard delay={0.1}>
                    <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-violet-400" />
                      LLM Visibility
                    </h3>
                    <div className="space-y-4">
                      {(
                        [
                          ["ChatGPT", result.llmVisibilityBreakdown.chatgpt, "from-green-500 to-emerald-400"],
                          ["Perplexity", result.llmVisibilityBreakdown.perplexity, "from-blue-500 to-cyan-400"],
                          ["Gemini", result.llmVisibilityBreakdown.gemini, "from-violet-500 to-purple-400"],
                        ] as const
                      ).map(([name, score, gradient]) => (
                        <div key={name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">{name}</span>
                            <span className="text-zinc-200 font-medium">{score}%</span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Entity Coverage */}
                  <GlassCard delay={0.2}>
                    <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      Entity Coverage
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-cyan-400">
                        {result.entityCoverage}%
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.entityCoverage}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-3">
                      {result.structuredDataPresent
                        ? "Some structured data detected"
                        : "No structured data found"}
                    </p>
                  </GlassCard>

                  {/* Missing Keywords */}
                  <GlassCard delay={0.3} className="lg:col-span-2">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Missing AI Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsMissing.map((kw) => (
                        <span
                          key={kw}
                          className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Gaps Tab */}
              {activeTab === "gaps" && (
                <div className="space-y-4">
                  {result.gaps.map((gap, i) => (
                    <GlassCard key={i} delay={i * 0.05} hoverGlow>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-3 w-3 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-200">{gap}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Priority: {i < 2 ? "Critical" : i < 4 ? "High" : "Medium"}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* JSON-LD Tab */}
              {activeTab === "schema" && (
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-violet-400" />
                      Generated JSON-LD Schema
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={copySchema}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800/50 transition-all"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={downloadSchema}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/20 text-xs hover:bg-violet-600/30 transition-all"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="relative rounded-xl bg-zinc-900/80 border border-zinc-700/30 p-4 overflow-auto max-h-[500px]">
                    <pre className="text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre">
                      {JSON.stringify(result.jsonLdSchema, null, 2)}
                    </pre>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3">
                    Paste this script tag into your website&apos;s{" "}
                    <code className="text-violet-400">&lt;head&gt;</code> section:
                  </p>
                  <div className="mt-2 rounded-lg bg-zinc-900/80 border border-zinc-700/30 p-3">
                    <code className="text-xs text-emerald-400 font-mono">
                      {`<script type="application/ld+json">`}
                      {"\n"}
                      {`  ${JSON.stringify(result.jsonLdSchema).slice(0, 60)}...`}
                      {"\n"}
                      {`</script>`}
                    </code>
                  </div>
                </GlassCard>
              )}

              {/* Recommendations Tab */}
              {activeTab === "recommendations" && (
                <div className="space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <GlassCard key={i} delay={i * 0.05} hoverGlow>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                          {i + 1}
                        </div>
                        <p className="text-sm text-zinc-200">{rec}</p>
                      </div>
                    </GlassCard>
                  ))}

                  {!subscription?.isPro && (
                    <GlassCard delay={0.5} className="border-violet-500/20 text-center">
                      <p className="text-sm text-zinc-400 mb-4">
                        Want unlimited audits and historical tracking?
                      </p>
                      <a href="/#pricing" className="glow-button inline-flex items-center gap-2 text-sm">
                        Upgrade to Pro
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </GlassCard>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardHeader({ subscription }: { subscription: SubscriptionStatus | null }) {
  return (
    <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </a>
          <div className="w-px h-6 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <span className="font-semibold text-zinc-200 text-sm">
              Audit Dashboard
            </span>
          </div>
        </div>

        {/* Plan Badge */}
        <div className="flex items-center gap-3">
          {subscription?.isPro ? (
            <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium border border-violet-500/20">
              Pro Plan
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
              Free Plan
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </ToastProvider>
  );
}
