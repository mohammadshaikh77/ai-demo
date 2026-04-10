# AlgoViz AI 2.0

An AI-powered DSA (Data Structures & Algorithms) problem visualizer. Paste any algorithm problem and get an interactive step-by-step visualization powered by OpenAI.

## Architecture

### Frontend — `artifacts/dsa-visualizer/`
- React + Vite + TypeScript, served at `/`
- Dark navy/indigo theme (Outfit + Space Mono fonts)
- Pages: Home (main visualizer), History, AnalysisView, Playground
- Visualizers: Array, Tree, Graph, DP table, Stack, Linked List, N-Queens, Recursion Tree, Matrix, Sorting Comparison
- shadcn/ui component library
- Auth: **Clerk is optional**. If `VITE_CLERK_PUBLISHABLE_KEY` is set, full Clerk auth activates. Otherwise the app works fully without authentication.

### Backend — `artifacts/api-server/`
- Express + TypeScript, serves on port 8080
- Routes mounted at `/api/dsa/` (analyze, history, patterns, individual analysis)
- Auth: **Clerk middleware is optional**. Skipped when `CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` are absent.
- OpenAI integration via **Replit AI Integrations** (no user API key needed — env vars are auto-provisioned)

### Shared Libraries
- `lib/db/` — Drizzle ORM + PostgreSQL schema (analyses, conversations, messages tables)
- `lib/api-spec/` — OpenAPI spec for DSA endpoints
- `lib/api-zod/` — Zod validation schemas generated from OpenAPI
- `lib/api-client-react/` — TanStack Query hooks for all API calls
- `lib/openai-integrations/` — Replit AI Integrations OpenAI client wrapper

## Environment Variables

### Required for AI (auto-provisioned by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — set automatically
- `AI_INTEGRATIONS_OPENAI_API_KEY` — set automatically

### Required for DB (auto-provisioned by Replit)
- `DATABASE_URL` — PostgreSQL connection string

### Optional — for Clerk authentication
- `VITE_CLERK_PUBLISHABLE_KEY` — from clerk.com dashboard
- `CLERK_PUBLISHABLE_KEY` — same key for backend
- `CLERK_SECRET_KEY` — from clerk.com dashboard
- `VITE_CLERK_PROXY_URL` — set to `https://<your-domain>/api/__clerk` in production

### Session
- `SESSION_SECRET` — already set

## Development

Both workflows must be running:
1. **`artifacts/api-server: API Server`** — `pnpm --filter @workspace/api-server run dev`
2. **`artifacts/dsa-visualizer: web`** — `pnpm --filter @workspace/dsa-visualizer run dev`

## Database

Tables live in PostgreSQL (provisioned by Replit):
- `analyses` — stores problem text, detected pattern, visualizer state, code, steps
- `conversations` — chat sessions
- `messages` — chat messages per conversation

Run migrations: `pnpm --filter @workspace/db run push`

## Key Design Decisions

- **Auth is optional**: core visualization works without Clerk keys. Auth only gates history persistence.
- **OpenAI via Replit**: no external API key management needed — Replit's AI Integrations handle billing and credentials.
- **Clerk middleware is conditional**: backend checks for `CLERK_PUBLISHABLE_KEY` at startup and skips the middleware if absent, preventing 500 errors.
