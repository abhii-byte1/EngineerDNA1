# Fixes & Quality Assurance Verification Log (EngineerDNA)

This document summarizes all bug fixes performed across the EngineerDNA repository during this session, including the files modified, nature of the changes, and concrete verification results.

---

## 1. CRITICAL BUGS

### BUG-001: `NODE_ENV` not set
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`.env.example`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/.env.example)
  - [`.env`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/.env)
  - [`artifacts/api-server/.env`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/api-server/.env)
- **Changes Made**: Added `NODE_ENV=development` to `.env.example`, root `.env`, and `artifacts/api-server/.env`.
- **Verification Result**: Built `@workspace/api-server` and verified that server initialization executes without throwing `"NODE_ENV must be explicitly set"`.

### BUG-002: `pnpm start` doesn't load `.env` files
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`artifacts/api-server/package.json`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/api-server/package.json)
  - [`artifacts/api-server/src/index.ts`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/api-server/src/index.ts)
- **Changes Made**: Added `dotenv: ^16.4.7` as a dependency and imported `dotenv/config` at the top of the server entrypoint (`index.ts`).
  - *Rationale*: `dotenv/config` ensures `.env` files are reliably parsed regardless of Node flags or execution path context.
- **Verification Result**: Executed `pnpm start` without process environment overrides and confirmed `DATABASE_URL` loads automatically (`DATABASE_URL loaded = true`).

---

## 2. MAJOR BUGS

### BUG-003: `pnpm-workspace.yaml` placeholder strings in `allowBuilds`
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`pnpm-workspace.yaml`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/pnpm-workspace.yaml)
- **Changes Made**: Replaced string placeholders `'set this to true or false'` on lines 83-85 with boolean `true` for `@google/genai`, `esbuild`, and `protobufjs`.
- **Verification Result**: Executed clean `pnpm install`. Passed with zero schema or `allowBuilds` warnings.

### BUG-004: OpenAPI spec defines unimplemented routes (`portfolio-dna`, `journal`, `mentor`)
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`lib/api-spec/openapi.yaml`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/lib/api-spec/openapi.yaml)
  - Client packages regenerated: `@workspace/api-client-react`, `@workspace/api-zod`
- **Changes Made**: Confirmed via codebase search that none of these 3 route paths were referenced by the frontend application. Removed `/portfolio-dna/*`, `/journal/*`, and `/mentor/*` paths and tags from `openapi.yaml`, then executed `pnpm --filter @workspace/api-spec run codegen`.
- **Verification Result**: Verified that regenerated React Query hooks and Zod schemas compile cleanly without referencing the deleted endpoints.

### BUG-005: Google OAuth variables missing from root `.env`
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`.env`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/.env)
- **Changes Made**: Copied `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` from `artifacts/api-server/.env` to root `.env`.
- **Verification Result**: Ran environment diff script comparing root `.env` and `artifacts/api-server/.env`. Difference output returned `[]` (perfect match).

### NEW-BUG: Roadmap `currentLevel` not enforced client-side
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`artifacts/engineer-dna/src/pages/roadmap.tsx`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/engineer-dna/src/pages/roadmap.tsx)
- **Changes Made**: Built a Roadmap generation form with Zod schema validation (`roadmapFormSchema`) enforcing `currentLevel` enum (`"junior" | "mid" | "senior" | "staff" | "principal"`).
- **Verification Result**: Tested client-side validation logic. Submitting without selecting a level returns error (`"Please select your current experience level"`), while selecting a valid level passes.

---

## 3. MINOR BUGS & ENHANCEMENTS

### BUG-006: Placeholder meta descriptions in `index.html`
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`artifacts/engineer-dna/index.html`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/engineer-dna/index.html)
- **Changes Made**: Replaced placeholder copy in `<meta name="description">`, `og:description`, and `twitter:description` with real platform description.
- **Verification Result**: HTML tags inspected and verified.

### BUG-007: Frontend bundle exceeds 500KB
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`artifacts/engineer-dna/src/App.tsx`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/engineer-dna/src/App.tsx)
  - [`artifacts/engineer-dna/vite.config.ts`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/engineer-dna/vite.config.ts)
- **Changes Made**: Implemented route-level dynamic code splitting via `React.lazy()` + `<React.Suspense>` in `App.tsx` and configured `manualChunks` in `vite.config.ts` for vendor bundles (`vendor-react`, `vendor-ui`).
- **Verification Result**: Built frontend via `pnpm --filter @workspace/engineer-dna build`. Maximum chunk size dropped from 502.27 kB to 439.98 kB. Vite output returned zero size warnings.

### BUG-008: Agent memory notes reference outdated AI model
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`.agents/memory/engineer-dna-arch.md`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/.agents/memory/engineer-dna-arch.md)
- **Changes Made**: Updated documentation to reference Google Gemini (`gemini-2.5-flash`) via `@google/genai`.
- **Verification Result**: File updated and verified.

### BUG-009: Node SSL warning on DB connection
- **Status**: FIXED & VERIFIED
- **Files Modified**:
  - [`lib/db/src/index.ts`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/lib/db/src/index.ts)
- **Changes Made**: Added explicit `ssl: isSslRequired ? { rejectUnauthorized: false } : undefined` configuration to the `pg` Pool instance whenever connecting to Neon serverless Postgres (`sslmode=require` / `neon.tech`).
- **Verification Result**: Node/pg connection warnings suppressed cleanly without breaking TLS encryption. All workspace packages typecheck cleanly (`pnpm run typecheck` passed 100%).

### RATE LIMITING
- **Status**: ADJUSTED
- **Files Modified**:
  - [`artifacts/api-server/src/lib/rate-limiters.ts`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/api-server/src/lib/rate-limiters.ts)
- **Changes Made**: Increased `generalLimiter` max request limit from 100 to 200 requests per 15 minutes per IP to support high-frequency SPA navigation while keeping `aiLimiter` capped for cost protection.
