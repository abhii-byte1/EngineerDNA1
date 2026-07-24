# EngineerDNA

An AI-powered Engineering Growth Platform that answers real developer growth questions: why am I not growing? what skills am I missing? how close am I to SDE-1?

**Not** a resume builder, ATS checker, or job tracker. A weekly growth companion for engineers who are obsessive about their craft.

## Architecture

### Monorepo structure
- `artifacts/engineer-dna/` — React + Vite frontend (wouter routing, dark-mode first)
- `artifacts/api-server/` — Express 5 API server (port from $PORT env var)
- `lib/db/` — Drizzle ORM + PostgreSQL schema
- `lib/api-spec/` — OpenAPI spec (source of truth)
- `lib/api-client-react/` — Orval-generated React Query hooks
- `lib/api-zod/` — Orval-generated Zod schemas

### Workflows
- `artifacts/api-server: API Server` — runs the backend
- `artifacts/engineer-dna: web` — runs the frontend

### Auth
- GitHub OAuth (GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET secrets required)
- Session tokens stored in `sessions` DB table, session_token httpOnly cookie
- Dev login at `GET /api/auth/dev-login` for local development

### AI
- Uses Google Gemini via GEMINI_API_KEY (user-provided secret)
- Model: gemini-2.5-flash with JSON output mode for all analysis

### Database
- PostgreSQL on NeonDB
- After schema changes: `pnpm --filter @workspace/db run push`

## Modules
1. **GitHub DNA** — Analyzes real GitHub repos via public API + Gemini
2. **Portfolio DNA** — Analyzes portfolio website URL
3. **Resume DNA** — Analyzes pasted resume text
4. **Roadmap** — AI-generated week-by-week engineering growth plan
5. **Journal** — Weekly growth journal with AI mentor insights
6. **AI Mentor** — Conversational engineering coach

## Required Secrets
- `GEMINI_API_KEY` — for all AI features
- `GITHUB_CLIENT_ID` — for GitHub OAuth login
- `GITHUB_CLIENT_SECRET` — for GitHub OAuth login
- `SESSION_SECRET` — already provisioned

## User Preferences
- No placeholder/mock data — all endpoints use real data sources
- Explicit errors instead of silent fallbacks
