import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini client (lazy — only fails when actually used without key)
export const gemini = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Model configuration
export const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return gemini !== null;
}

/**
 * GEO Audit prompt template
 */
export function buildAuditPrompt(siteUrl: string, brandName: string): string {
  return `You are an expert SEO and GEO (Generative Engine Optimization) analyst. Analyze the following website for AI visibility and structured data optimization.

Website URL: ${siteUrl}
Brand Name: ${brandName}

Perform a comprehensive GEO audit and return your analysis as a JSON object with the following structure:

{
  "geoScore": <number 0-100 representing overall AI visibility score>,
  "aiSummary": "<2-3 sentence summary of the website's AI visibility status>",
  "gaps": [
    "<specific gap in AI visibility, e.g., 'Missing Organization schema'>",
    "<another gap>",
    "<another gap>"
  ],
  "keywordsMissing": [
    "<AI-related keyword missing from content>",
    "<another keyword>",
    "<another keyword>"
  ],
  "recommendations": [
    "<specific actionable recommendation>",
    "<another recommendation>",
    "<another recommendation>"
  ],
  "llmVisibilityBreakdown": {
    "chatgpt": <number 0-100>,
    "perplexity": <number 0-100>,
    "gemini": <number 0-100>
  },
  "entityCoverage": <number 0-100 representing how well entities are marked up>,
  "structuredDataPresent": <boolean>,
  "jsonLdSchema": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "${siteUrl}/#organization",
        "name": "${brandName}",
        "url": "${siteUrl}",
        "logo": {
          "@type": "ImageObject",
          "url": "${siteUrl}/logo.png"
        },
        "sameAs": [
          "https://www.linkedin.com/company/${brandName.toLowerCase().replace(/\s+/g, "-")}",
          "https://twitter.com/${brandName.toLowerCase().replace(/\s+/g, "")}"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "${siteUrl}/#website",
        "url": "${siteUrl}",
        "name": "${brandName}",
        "publisher": { "@id": "${siteUrl}/#organization" }
      },
      <add FAQPage schema if relevant>,
      <add other relevant schemas based on the website type>
    ]
  }
}

Important guidelines:
1. The geoScore should reflect real issues: sites without structured data typically score 20-40, well-optimized sites score 70-90
2. gaps should be specific to what's actually missing for AI visibility
3. keywordsMissing should include terms like "JSON-LD", "schema.org", "structured data", "entity markup", etc.
4. recommendations should be actionable and prioritized by impact
5. jsonLdSchema should be a complete, valid JSON-LD that the site owner can directly paste into their HTML
6. Analyze the website type (e-commerce, SaaS, blog, local business) and include appropriate schemas

Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.`;
}

/**
 * Parse Gemini response to extract JSON
 */
export function parseGeminiResponse(text: string): Record<string, unknown> | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Continue to next attempt
      }
    }

    // Try to find JSON object in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Give up
      }
    }

    return null;
  }
}
