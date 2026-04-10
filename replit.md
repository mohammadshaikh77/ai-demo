# AlgoViz AI 2.0

## Overview

AI-powered DSA (Data Structures & Algorithms) problem visualizer. Users can paste any DSA problem, and the app uses AI (OpenAI) to analyze it, generate step-by-step visualization data, and render interactive animations for arrays, trees, graphs, dynamic programming tables, stacks, linked lists, and more.

## Project Structure

```
artifacts/
  api-server/           ← Backend (Express + TypeScript)
  dsa-visualizer/       ← Frontend (React + Vite + TailwindCSS)

lib/
  api-client-react/     ← Generated React Query hooks (from OpenAPI codegen)
  api-spec/             ← OpenAPI spec (source of truth for API contract)
  api-zod/              ← Generated Zod validation schemas
  db/                   ← Database (Drizzle ORM + PostgreSQL)
    src/schema/
      analyses.ts       ← DSA analysis results table
      conversations.ts  ← Conversations table
      messages.ts       ← Messages table
  integrations-openai-ai-server/  ← OpenAI server-side client
  integrations-openai-ai-react/   ← OpenAI React hooks
```

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + TailwindCSS v4 + shadcn/ui
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Auth**: Clerk (requires VITE_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY)
- **AI**: OpenAI via Replit AI Integrations (AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/dsa-visualizer run dev` — run frontend locally

## Required Secrets

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (from clerk.com dashboard)
- `CLERK_SECRET_KEY` — Clerk secret key (from clerk.com dashboard)
- `VITE_CLERK_PROXY_URL` — Set to `https://<your-domain>/api/__clerk` for production
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Auto-provisioned via Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Auto-provisioned via Replit AI Integrations
- `DATABASE_URL` — Auto-provisioned by Replit PostgreSQL

## Pages

- `/` — Home (analyze a DSA problem)
- `/history` — Analysis history (requires sign-in)
- `/analyze/:id` — View a specific analysis with visualization
- `/playground` — Interactive data structures playground
- `/sign-in` — Sign in
- `/sign-up` — Sign up
