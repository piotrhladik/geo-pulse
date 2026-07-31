@echo off
REM ═══════════════════════════════════════════════════════════════════
REM   GEO Pulse AI — Project Builder Script (Windows)
REM   Recreates the full project structure from scratch
REM ═══════════════════════════════════════════════════════════════════

echo.
echo  ██████╗ ███████╗ ██████╗     ██████╗ ██╗   ██╗██╗     ███████╗███████╗
echo ██╔════╝ ██╔════╝██╔═══██╗    ██╔══██╗██║   ██║██║     ██╔════╝██╔════╝
echo ██║  ███╗█████╗  ██║   ██║    ██████╔╝██║   ██║██║     ███████╗█████╗  
echo ██║   ██║██╔══╝  ██║   ██║    ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝  
echo ╚██████╔╝███████╗╚██████╔╝    ██║     ╚██████╔╝███████╗███████║███████╗
echo  ╚═════╝ ╚══════╝ ╚═════╝     ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝
echo.
echo   GEO Pulse AI - Generative Engine Optimization Platform
echo   Building project structure...
echo.

SET PROJECT_NAME=geo-pulse-ai

REM ─── Step 1: Create Next.js project ──────────────────────────────
echo [1/5] Creating Next.js project...
npx create-next-app@latest %PROJECT_NAME% --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm

cd %PROJECT_NAME%

REM ─── Step 2: Install dependencies ────────────────────────────────
echo [2/5] Installing dependencies...
npm install framer-motion lucide-react zod drizzle-orm pg
npm install -D drizzle-kit @types/pg

REM ─── Step 3: Create directory structure ──────────────────────────
echo [3/5] Creating directory structure...
mkdir src\components\landing 2>nul
mkdir src\components\ui 2>nul
mkdir src\lib 2>nul
mkdir src\types 2>nul
mkdir src\db 2>nul
mkdir src\app\api\audit 2>nul
mkdir src\app\api\checkout 2>nul
mkdir src\app\api\health 2>nul
mkdir src\app\dashboard 2>nul

REM ─── Step 4: Create .env.example ─────────────────────────────────
echo [4/5] Creating environment files...
(
echo DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
echo STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
echo STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id
echo OPENAI_API_KEY=sk-your_openai_api_key
) > .env.example

copy .env.example .env

REM ─── Step 5: Initialize Git ─────────────────────────────────────
echo [5/5] Initializing Git repository...
git init
git add .
git commit -m "Initial commit: GEO Pulse AI project scaffold"

echo.
echo ═══════════════════════════════════════════════════════════════
echo   Project created successfully!
echo.
echo   Next steps:
echo   1. Copy source files from the generated code into their
echo      respective directories (see guidelines.md for structure)
echo   2. Update .env with your actual API keys
echo   3. Run: npx drizzle-kit push (to create database tables)
echo   4. Run: npm run dev (to start development server)
echo.
echo   Key files to populate:
echo     src/db/schema.ts          - Database schema
echo     src/lib/geo-engine.ts     - GEO audit engine
echo     src/app/page.tsx          - Landing page
echo     src/app/dashboard/page.tsx - Dashboard
echo     src/app/api/audit/route.ts - Audit API
echo ═══════════════════════════════════════════════════════════════
echo.
pause
