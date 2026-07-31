// ─── GEO Audit Types ──────────────────────────────────────────────────

export interface GeoAuditRequest {
  siteUrl: string;
  brandName: string;
}

export interface GeoAuditResult {
  geoScore: number;
  gaps: string[];
  recommendations: string[];
  jsonLdSchema: Record<string, unknown>;
  aiSummary: string;
  keywordsMissing: string[];
  structuredDataPresent: boolean;
  entityCoverage: number;
  llmVisibilityBreakdown: {
    chatgpt: number;
    perplexity: number;
    gemini: number;
  };
}

export interface AuditCardData {
  id: string;
  siteUrl: string;
  brandName: string | null;
  geoScore: number | null;
  status: string;
  createdAt: Date;
}
