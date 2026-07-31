import { NextRequest, NextResponse } from "next/server";
import { gemini, GEMINI_MODEL, buildAuditPrompt, parseGeminiResponse, isGeminiConfigured } from "@/lib/gemini";
import { runGeoAudit } from "@/lib/geo-engine";
import { auditRequestSchema } from "@/lib/validators";
import { db } from "@/db";
import { audits } from "@/db/schema";
import type { GeoAuditResult } from "@/types/geo";

export const maxDuration = 60; // Allow up to 60s for AI processing

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Validate input
    const parsed = auditRequestSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues;
      const firstError = issues[0]?.message ?? "Invalid input";
      console.error("[API/audit] Validation failed:", firstError);
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { siteUrl, brandName } = parsed.data;

    // Normalize URL
    const normalizedUrl = siteUrl.startsWith("http")
      ? siteUrl
      : `https://${siteUrl}`;

    let result: GeoAuditResult;

    // Try Gemini AI first, fall back to local engine
    if (isGeminiConfigured() && gemini) {
      console.log(`[API/audit] Using Gemini AI for: ${normalizedUrl}`);
      
      try {
        const prompt = buildAuditPrompt(normalizedUrl, brandName);
        
        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        });

        const text = response.text || "";
        console.log("[API/audit] Gemini raw response length:", text.length);

        const parsed = parseGeminiResponse(text);

        if (!parsed) {
          console.warn("[API/audit] Failed to parse Gemini response, using fallback");
          result = await runGeoAudit(normalizedUrl, brandName);
        } else {
          // Map Gemini response to our GeoAuditResult type
          result = {
            geoScore: typeof parsed.geoScore === "number" ? parsed.geoScore : 45,
            aiSummary: typeof parsed.aiSummary === "string" ? parsed.aiSummary : "Analysis completed.",
            gaps: Array.isArray(parsed.gaps) ? parsed.gaps as string[] : [],
            keywordsMissing: Array.isArray(parsed.keywordsMissing) ? parsed.keywordsMissing as string[] : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations as string[] : [],
            llmVisibilityBreakdown: {
              chatgpt: (parsed.llmVisibilityBreakdown as Record<string, number>)?.chatgpt ?? 50,
              perplexity: (parsed.llmVisibilityBreakdown as Record<string, number>)?.perplexity ?? 50,
              gemini: (parsed.llmVisibilityBreakdown as Record<string, number>)?.gemini ?? 50,
            },
            entityCoverage: typeof parsed.entityCoverage === "number" ? parsed.entityCoverage : 30,
            structuredDataPresent: typeof parsed.structuredDataPresent === "boolean" ? parsed.structuredDataPresent : false,
            jsonLdSchema: (parsed.jsonLdSchema as Record<string, unknown>) ?? generateFallbackSchema(normalizedUrl, brandName),
          };
          
          console.log(`[API/audit] Gemini audit complete: GEO Score ${result.geoScore}`);
        }
      } catch (geminiError) {
        console.error("[API/audit] Gemini error, using fallback:", geminiError);
        result = await runGeoAudit(normalizedUrl, brandName);
      }
    } else {
      console.log("[API/audit] Gemini not configured, using local engine");
      result = await runGeoAudit(normalizedUrl, brandName);
    }

    // Store audit in database (best-effort)
    try {
      await db.insert(audits).values({
        siteUrl: normalizedUrl,
        brandName,
        geoScore: result.geoScore,
        status: "completed",
        gaps: result.gaps,
        recommendations: result.recommendations,
        jsonLdSchema: result.jsonLdSchema,
        aiSummary: result.aiSummary,
      });
    } catch (dbErr) {
      console.error("[API/audit] DB insert failed (non-fatal):", dbErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API/audit] Unexpected error:", message);
    return NextResponse.json(
      { error: "Failed to process audit. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Generate fallback JSON-LD schema
 */
function generateFallbackSchema(url: string, brand: string): Record<string, unknown> {
  const domain = new URL(url).hostname;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: brand,
        url: url,
        logo: {
          "@type": "ImageObject",
          url: `https://${domain}/logo.png`,
        },
        sameAs: [
          `https://www.linkedin.com/company/${brand.toLowerCase().replace(/\s+/g, "-")}`,
          `https://twitter.com/${brand.toLowerCase().replace(/\s+/g, "")}`,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url: url,
        name: brand,
        publisher: { "@id": `${url}/#organization` },
      },
    ],
  };
}
