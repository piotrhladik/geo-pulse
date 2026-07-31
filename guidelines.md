# GEO Pulse AI — Project Guidelines

## Architecture & Standards

### Naming Conventions
- **Files:** `kebab-case.ts` / `kebab-case.tsx` (e.g., `geo-engine.ts`, `score-ring.tsx`)
- **Components:** `PascalCase` (e.g., `ScoreRing`, `GlassCard`, `Hero`)
- **Functions/Variables:** `camelCase` (e.g., `runGeoAudit`, `geoScore`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `AI_KEYWORDS`, `SCAN_STEPS`)
- **Types/Interfaces:** `PascalCase` (e.g., `GeoAuditResult`, `AuditCardData`)

### Folder Structure
```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # Server-side API endpoints
│   ├── dashboard/        # Dashboard page
│   ├── layout.tsx        # Root layout (fonts, metadata)
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles, CSS variables, animations
├── components/
│   ├── landing/          # Landing page sections (Hero, Features, Scanner, etc.)
│   └── ui/               # Reusable UI components (GlassCard, ScoreRing, Toast)
├── db/
│   ├── index.ts          # Database connection (Drizzle + PostgreSQL)
│   └── schema.ts         # Drizzle ORM table definitions
├── lib/
│   ├── geo-engine.ts     # Core GEO audit engine
│   ├── validators.ts     # Zod validation schemas
│   └── utils.ts          # Utility functions (cn, formatDate, scoreColor)
└── types/
    └── geo.ts            # TypeScript type definitions
```

### Design System — Dark Luxury Palette
- **Background Primary:** `#09090b` (near-black)
- **Background Card:** `rgba(17, 17, 24, 0.75)` with `backdrop-blur-md`
- **Accent Violet:** `#8b5cf6`
- **Accent Cyan:** `#06b6d4`
- **Accent Emerald:** `#10b981`
- **Text Primary:** `#f4f4f5`
- **Text Secondary:** `#a1a1aa`

### Typography
- **UI/Body:** `Geist` via `@next/font` — DO NOT use Inter
- **Headings (H1/H2):** `Fraunces` (serif, italic-capable)
- Apply via CSS variable: `font-[family-name:var(--font-fraunces)]`

### Animations
- Use Framer Motion for all micro-interactions
- Subtle glow effects on hover (box-shadow with violet/cyan)
- `backdrop-blur-md` for glass morphism cards
- Score ring animations with SVG stroke-dashoffset

### Database (Drizzle ORM + PostgreSQL)
- Schema defined in `src/db/schema.ts` using `drizzle-orm/pg-core`
- Apply schema changes: `npx drizzle-kit push`
- Connection via `DATABASE_URL` environment variable
- Always handle DB errors gracefully — never crash the API

### Environment Variables
Required variables (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `STRIPE_SECRET_KEY` — Stripe API key (server-side only)
- `STRIPE_PRO_PRICE_ID` — Stripe Price ID for Pro plan
- `OPENAI_API_KEY` — OpenAI API key (optional, for future LLM integration)

**Adding new API keys:**
1. Add to `.env` (never commit secrets)
2. Add placeholder to `.env.example`
3. Access via `process.env.KEY_NAME` in server-side code only
4. For client-side: prefix with `NEXT_PUBLIC_` and access in browser code

### Error Handling
- Never silently swallow errors — always log to console and return user-friendly messages
- Use Toast notifications for client-side error feedback
- API routes return structured JSON errors with appropriate HTTP status codes
- Database errors are non-fatal for audit API (best-effort persistence)

### Code Quality
- TypeScript strict mode enabled
- Separate concerns: UI components, business logic, data access, types
- No monolithic files — each component/module has a single responsibility
- All API inputs validated with Zod before processing
