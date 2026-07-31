"use client";

import { motion } from "framer-motion";
import { Brain, Code2, BarChart3, Shield, Zap, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const features = [
  {
    icon: Brain,
    title: "LLM Visibility Audit",
    description:
      "Analyze how ChatGPT, Perplexity, and Gemini perceive your brand. Get a comprehensive AI readiness score.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: Code2,
    title: "JSON-LD Generator",
    description:
      "Auto-generate optimized Schema.org markup ready to paste into your website. Organization, FAQ, HowTo schemas included.",
    gradient: "from-cyan-500 to-blue-400",
  },
  {
    icon: BarChart3,
    title: "GEO Score Analytics",
    description:
      "Track your AI visibility score over time. Understand which LLMs surface your content and which don't.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: Shield,
    title: "Entity Coverage",
    description:
      "Verify your brand's Knowledge Graph connections. Ensure sameAs links, author markup, and entity relationships are intact.",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    icon: Zap,
    title: "Instant Recommendations",
    description:
      "Get actionable optimization steps prioritized by impact. Fix the highest-value gaps first.",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    icon: Globe,
    title: "Multi-Engine Coverage",
    description:
      "Visibility breakdown across ChatGPT, Perplexity, and Gemini. Know exactly where you're missing out.",
    gradient: "from-indigo-500 to-violet-400",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="gradient-text">AI Visibility</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            A complete toolkit to audit, optimize, and monitor how generative AI
            models reference your brand.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <GlassCard key={feature.title} hoverGlow delay={i * 0.1}>
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
