---
name: EngineerDNA Architecture
description: Key decisions, patterns, and constraints for the EngineerDNA SaaS engineering growth platform
---

# EngineerDNA Architecture

## Auth
- GitHub OAuth with CSRF state validation (oauth_state cookie)
- Sessions stored in `sessions` DB table, no FK constraint
- `session_token` httpOnly cookie, secure in prod, lax in dev
- Dev login: `GET /api/auth/dev-login` (NODE_ENV=development only)
- Auth middleware: `src/middlewares/auth.ts` → `requireAuth` + `AuthenticatedRequest` type
- Route in: `GET /api/auth/github` → `GET /api/auth/github/callback`

## AI
- Uses Google Gemini API via `GEMINI_API_KEY`
- Client init: `artifacts/api-server/src/lib/ai.ts` using `@google/genai`
- All analysis routes use `gemini-2.5-flash` with structured JSON generation (`responseMimeType: "application/json"`)
- AI routes always try/catch; on failure: mark report as "failed" + return 500

## DB Schema
- All tables in `lib/db/src/schema/` — one file per domain
- Tables: users, sessions, github_reports, portfolio_reports, resume_reports, roadmaps, milestones, journal_entries, mentor_sessions, mentor_messages, goals
- `lib/db/src/schema/index.ts` re-exports all; `lib/db/src/index.ts` re-exports schema
- After schema changes: run `pnpm --filter @workspace/db run push`
- After new files in schema: rebuild declarations with `pnpm --filter @workspace/db exec tsc --build --force`
- Serialize DB results before Zod parse: `JSON.parse(JSON.stringify(record))`

## Route Patterns
- All feature routes: import `{ db }` and tables from `@workspace/db`
- Import tables directly: `import { usersTable, sessionsTable } from "@workspace/db"`
- Express 5 param types: `req.params.id as string` (typed as `string | string[]`)
- Drizzle insights field typing: cast as `AnalysisInsight[]` from `lib/db/src/schema/github-reports`

## Frontend
- Design subagent built full UI with wouter routing, all 10 pages
- API client: `@workspace/api-client-react` with Orval-generated hooks
- Mutation signatures (path params): `useSendMentorMessage({ id, data: { content } })`
- All timestamps serialized via JSON.parse(JSON.stringify()) before returning

## Google Gemini Integration
- `@google/genai: ^2.12.0` added to `artifacts/api-server/package.json`
- Model: `gemini-2.5-flash`

## GitHub Analysis
- Fetches real data: `/users/{username}` + `/users/{username}/repos?per_page=50`
- Passes to Gemini for structured analysis — not mocked
- Report stored immediately as "analyzing", updated to "completed" or "failed"
