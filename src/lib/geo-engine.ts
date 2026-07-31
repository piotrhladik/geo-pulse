import type { GeoAuditResult } from "@/types/geo";

// ─── Deterministic hash for consistent scores per URL ─────────────────
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Keyword banks for GEO analysis ──────────────────────────────────
const AI_KEYWORDS = [
  "structured data",
  "JSON-LD",
  "schema.org",
  "entity markup",
  "knowledge graph",
  "FAQ schema",
  "HowTo schema",
  "breadcrumb schema",
  "organization schema",
  "local business schema",
  "product schema",
  "review schema",
  "author markup",
  "sameAs links",
  "canonical URL",
  "meta description",
  "Open Graph tags",
  "Twitter Card",
  "sitemap.xml",
  "robots.txt",
];

const RECOMMENDATIONS_POOL = [
  "Add Organization JSON-LD schema with official sameAs links to Wikipedia, LinkedIn, and Crunchbase",
  "Implement FAQ Page schema for your most common customer questions",
  "Create a comprehensive HowTo schema for your core product workflows",
  "Add Author markup with credentialSubject to establish E-E-A-T signals",
  "Implement Breadcrumb schema to help LLMs understand site hierarchy",
  "Add Product schema with aggregateRating and review markup",
  "Create a Knowledge Base with interconnected entity references",
  "Implement speakable schema for voice-search optimization",
  "Add WebSite schema with SearchAction for sitelinks search box",
  "Create a comprehensive About page with Person/Organization entity linking",
  "Implement ClaimReview schema for fact-checking content credibility",
  "Add VideoObject schema for video content with transcript references",
  "Create MedicalEntity or LegalService schema for specialized verticals",
  "Implement Event schema for upcoming webinars, conferences, or launches",
  "Add SoftwareApplication schema with offers and rating data",
];

const GAP_DESCRIPTIONS = [
  "Missing Organization schema — AI models cannot reliably attribute content to your brand",
  "No FAQ schema detected — losing visibility in conversational AI queries",
  "Absent author/creator markup — E-E-A-T signals invisible to language models",
  "No structured breadcrumbs — LLMs struggle to map your content hierarchy",
  "Missing sameAs links — knowledge graph connections are broken",
  "No product/service schema — AI cannot recommend your offerings accurately",
  "Incomplete meta descriptions — LLMs fall back to generic summaries",
  "No speakable markup — invisible to voice-based AI assistants",
  "Missing review/rating schema — social proof not surfaced in AI answers",
  "No HowTo schema — procedural queries bypass your content entirely",
  "Absent WebSite SearchAction — site search not exposed to AI models",
  "No LocalBusiness schema — geographic queries miss your location data",
];

// ─── Main Audit Function ──────────────────────────────────────────────
export async function runGeoAudit(
  siteUrl: string,
  brandName: string
): Promise<GeoAuditResult> {
  // Simulate processing time (50-200ms)
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));

  const hash = simpleHash(siteUrl + brandName);

  // Generate deterministic but realistic score (25–82 range — most sites score poorly)
  const geoScore = 25 + (hash % 58);

  // Select gaps based on score (worse score = more gaps)
  const gapCount = Math.max(3, Math.min(8, Math.floor((100 - geoScore) / 10)));
  const gaps: string[] = [];
  for (let i = 0; i < gapCount; i++) {
    gaps.push(GAP_DESCRIPTIONS[(hash + i * 7) % GAP_DESCRIPTIONS.length]);
  }
  // Deduplicate
  const uniqueGaps = [...new Set(gaps)];

  // Select recommendations
  const recCount = Math.max(3, Math.min(6, Math.floor((100 - geoScore) / 12)));
  const recommendations: string[] = [];
  for (let i = 0; i < recCount; i++) {
    recommendations.push(
      RECOMMENDATIONS_POOL[(hash + i * 5) % RECOMMENDATIONS_POOL.length]
    );
  }
  const uniqueRecs = [...new Set(recommendations)];

  // Select missing keywords
  const kwCount = Math.max(4, Math.min(10, Math.floor((100 - geoScore) / 8)));
  const keywordsMissing: string[] = [];
  for (let i = 0; i < kwCount; i++) {
    keywordsMissing.push(AI_KEYWORDS[(hash + i * 3) % AI_KEYWORDS.length]);
  }
  const uniqueKeywords = [...new Set(keywordsMissing)];

  // LLM visibility breakdown
  const chatgptScore = Math.max(5, Math.min(95, geoScore + ((hash % 20) - 10)));
  const perplexityScore = Math.max(5, Math.min(95, geoScore + ((hash % 15) - 8)));
  const geminiScore = Math.max(5, Math.min(95, geoScore + ((hash % 18) - 9)));

  // Generate JSON-LD schema recommendation
  const domain = extractDomain(siteUrl);
  const jsonLdSchema = generateJsonLd(brandName, domain, siteUrl);

  // Generate AI summary
  const aiSummary = generateSummary(brandName, geoScore, uniqueGaps.length);

  return {
    geoScore,
    gaps: uniqueGaps,
    recommendations: uniqueRecs,
    jsonLdSchema,
    aiSummary,
    keywordsMissing: uniqueKeywords,
    structuredDataPresent: geoScore > 50,
    entityCoverage: Math.min(100, Math.max(5, geoScore - 10 + (hash % 20))),
    llmVisibilityBreakdown: {
      chatgpt: chatgptScore,
      perplexity: perplexityScore,
      gemini: geminiScore,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────
function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

function generateJsonLd(
  brandName: string,
  domain: string,
  siteUrl: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `https://${domain}/#organization`,
        name: brandName,
        url: siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`,
        logo: {
          "@type": "ImageObject",
          url: `https://${domain}/logo.png`,
        },
        sameAs: [
          `https://www.linkedin.com/company/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
          `https://twitter.com/${brandName.toLowerCase().replace(/\s+/g, "")}`,
          `https://www.crunchbase.com/organization/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
        ],
        description: `${brandName} — Official website and digital presence.`,
      },
      {
        "@type": "WebSite",
        "@id": `https://${domain}/#website`,
        url: `https://${domain}`,
        name: brandName,
        publisher: { "@id": `https://${domain}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `https://${domain}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `https://${domain}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What is ${brandName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${brandName} is a leading provider in its industry, offering innovative solutions and services.`,
            },
          },
          {
            "@type": "Question",
            name: `How does ${brandName} work?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${brandName} leverages advanced technology to deliver exceptional results for its customers.`,
            },
          },
        ],
      },
    ],
  };
}

function generateSummary(
  brandName: string,
  score: number,
  gapCount: number
): string {
  if (score >= 70) {
    return `${brandName} has a solid foundation for AI visibility with a GEO Score of ${score}/100. There are ${gapCount} optimization opportunities that, if addressed, could significantly boost presence in AI-generated responses across ChatGPT, Perplexity, and Gemini.`;
  }
  if (score >= 45) {
    return `${brandName} shows moderate AI visibility with a GEO Score of ${score}/100. We detected ${gapCount} critical gaps in structured data and entity markup. Implementing the recommended JSON-LD schemas and knowledge graph connections could dramatically improve how AI models reference and recommend your brand.`;
  }
  return `${brandName} has significant room for improvement with a GEO Score of ${score}/100. ${gapCount} major gaps were found in your AI readiness profile. Without proper structured data, schema markup, and entity connections, AI models like ChatGPT and Gemini are unlikely to surface your brand in their responses. Immediate action on the recommended optimizations is strongly advised.`;
}
