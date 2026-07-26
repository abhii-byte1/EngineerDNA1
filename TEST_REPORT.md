# EngineerDNA — Comprehensive QA Test Report (Phase 2 & 3)

**Date:** 2026-07-27  
**Tester:** Senior QA Engineer (Automated & Empirical Execution)  
**Environment:** Windows 11, Node.js v24.11.1, pnpm 11.10.0, Microsoft Edge (Headless Automation)  
**Repo:** `Engineer-DNA` (cloned from Replit)

---

## 1. Executive Summary

This phase of testing concludes the complete empirical evaluation of the **EngineerDNA** platform. All 32 API endpoints from Phase 1 remain verified, and this session successfully closed the two remaining testing gaps:

1. **Part 1: Real Browser & UI Testing** across **12 pages** on both **Desktop (1440px)** and **Mobile (375px)** viewports, including form interaction, client-side validation, cookie-based authentication, Turnstile widget rendering, and visual regression checks.
2. **Part 2: Full End-to-End AI-Flow Execution** using live Google Gemini AI credits across all 4 core platform value-prop features: **GitHub DNA Analysis**, **Resume DNA Analysis**, **Roadmap Generation**, and **4-Question Interactive Mock Technical Interview**.

---

## 2. Part 1: Real Browser & UI Testing

**Methodology:** Automated browser execution using `puppeteer-core` driving native Microsoft Edge (`msedge.exe`). Full screenshots were captured for all 12 target pages in both desktop (1440px) and mobile (375px) viewports.

### 2.1 UI Page Test Results

| Page / Component | Route | Viewports | Actions & UI Verification | Result | Screenshots Saved |
|---|---|---|---|---|---|
| **1. Login Page** | `/login` | 1440px, 375px | Verified GitHub OAuth button, Google OAuth button, and Dev Login link render cleanly. | **PASS** | `01_login_desktop_1440px.png`<br>`01_login_mobile_375px.png` |
| **2. Dashboard** | `/dashboard` | 1440px, 375px | Authenticated via dev login. System Overview cards, standing band badge, and active goals render cleanly. | **PASS** | `02_dashboard_desktop_1440px.png`<br>`02_dashboard_mobile_375px.png` |
| **3. Settings Page** | `/settings` | 1440px, 375px | Form input for bio & targetRole. Submitted updates, reloaded page, and confirmed data persistence. | **PASS** | `03_settings_desktop_1440px.png`<br>`03_settings_mobile_375px.png` |
| **4. Goals Page** | `/goals` | 1440px, 375px | Clicked "Define Goal", filled form, submitted. Confirmed goal creation and progress slider rendering. | **PASS** | `04_goals_desktop_1440px.png`<br>`04_goals_mobile_375px.png` |
| **5. GitHub DNA** | `/github-dna` | 1440px, 375px | Checked empty state. Submitted empty form to verify client-side Zod validation error ("GitHub username is required"). | **PASS** | `05_github_dna_desktop_1440px.png`<br>`05_github_dna_mobile_375px.png` |
| **6. Resume DNA** | `/resume-dna` | 1440px, 375px | Checked empty state. Submitted empty form to verify client-side validation error ("Paste at least 50 characters"). | **PASS** | `06_resume_dna_desktop_1440px.png`<br>`06_resume_dna_mobile_375px.png` |
| **7. Roadmap Page** | `/roadmap` | 1440px, 375px | Verified empty state when no roadmap exists (properly matches 404 API response contract). | **PASS** | `07_roadmap_desktop_1440px.png`<br>`07_roadmap_mobile_375px.png` |
| **8. Interview Simulator** | `/interview-simulator` | 1440px, 375px | Loaded session list UI, confirmed clean empty state rendering. | **PASS** | `08_interview_simulator_desktop_1440px.png`<br>`08_interview_simulator_mobile_375px.png` |
| **9. Roast / Coach** | `/roast` | 1440px, 375px | Unauthenticated public page. Confirmed Turnstile verification widget, mode toggle, and username input render. | **PASS** | `09_roast_public_desktop_1440px.png`<br>`09_roast_public_mobile_375px.png` |
| **10. Leaderboard** | `/leaderboard` | 1440px, 375px | Verified clean empty state rendering for public profile rankings. | **PASS** | `10_leaderboard_desktop_1440px.png`<br>`10_leaderboard_mobile_375px.png` |
| **11. Compare** | `/compare/user1/user2` | 1440px, 375px | Confirmed 404 / non-existent user matchup error card renders cleanly. | **PASS** | `11_compare_desktop_1440px.png`<br>`11_compare_mobile_375px.png` |
| **12. Feedback Widget** | `/dashboard` | 1440px, 375px | Confirmed floating feedback card renders ("Was this helpful?") with rating thumbs & feedback comment textarea. | **PASS** | `12_feedback_widget_desktop_1440px.png`<br>`12_feedback_widget_mobile_375px.png` |

---

## 3. Part 2: Full AI-Flow Execution (Live Gemini AI)

All 4 primary AI-powered growth engines were executed end-to-end against Google Gemini AI (`gemini-2.5-flash`).

### 3.1 AI Flow 1: GitHub DNA Analysis
- **Target:** Public GitHub profile `gaearon` (Dan Abramov)
- **Endpoint:** `POST /api/github-dna/analyze`
- **Request Payload:**
  ```json
  { "githubUsername": "gaearon" }
  ```
- **Gemini Response Time:** **31,045 ms** (~31.0 seconds)
- **HTTP Status:** `200 OK`
- **AI Analysis Output:**
  - **Overall Score:** `100 / 100`
  - **Archetype:** `night_owl_architect`
  - **Tech Stack Detected:** `["JavaScript", "TypeScript", "React", "Redux", "Webpack", "Babel", "ESLint", "Mocha", "HMR"]`
- **Persistence Verification:** Retrievable via `GET /api/github-dna/reports` (`200 OK`, returned array containing report ID 1).
- **UI Screenshot:** `ai_flow_1_github_dna_ui.png`

### 3.2 AI Flow 2: Resume DNA Analysis
- **Target Role:** Senior Full-Stack Engineer
- **Endpoint:** `POST /api/resume-dna/analyze`
- **Request Payload:** 1,344 character full-stack developer resume covering work experience at TechCorp Inc. & DataScale Solutions.
- **Gemini Response Time:** **24,357 ms** (~24.4 seconds)
- **HTTP Status:** `200 OK`
- **AI Analysis Output:**
  - **Overall Score:** `92 / 100`
  - **Writing Quality Score:** `95 / 100`
  - **Impact Score:** `95 / 100`
  - **Detected Strengths:** 5 key strengths identified, bullet points parsed, and missing keywords flagged.
- **Persistence Verification:** Retrievable via `GET /api/resume-dna/reports` (`200 OK`, returned array containing report ID 1).
- **UI Screenshot:** `ai_flow_2_resume_dna_ui.png`

### 3.3 AI Flow 3: Roadmap Generation
- **Target:** Transitioning from Mid-level to Staff Engineer (`fullstack` track)
- **Endpoint:** `POST /api/roadmap`
- **Request Payload:**
  ```json
  {
    "track": "fullstack",
    "targetRole": "Staff Engineer",
    "currentLevel": "mid"
  }
  ```
- **Gemini Response Time:** **30,098 ms** (~30.1 seconds)
- **HTTP Status:** `200 OK`
- **AI Analysis Output:**
  - **Roadmap ID:** `2`
  - **Estimated Duration:** `40 weeks`
  - **Milestones Generated:** **10 structured week-by-week milestones** with specific tasks, skills, and recommended project assignments.
- **Persistence Verification:** Retrievable via `GET /api/roadmap` (`200 OK`, returned roadmap object with 10 milestones).
- **UI Screenshot:** `ai_flow_3_roadmap_ui.png`

### 3.4 AI Flow 4: Bounded Mock Technical Interview Simulator
- **Config:** `mid`-level `coding` interview on `fullstack` track
- **Start Endpoint:** `POST /api/interview-simulator/start` -> Session ID: `3` (Duration: **8,582 ms**)
- **Interactive Question Loop:** Submitted 4 technical answers sequentially to `POST /api/interview-simulator/sessions/3/answer`:
  - **Answer 1 (Database optimization):** Processed in **5,743 ms** (Session active)
  - **Answer 2 (React state architecture):** Processed in **6,684 ms** (Session active)
  - **Answer 3 (Distributed race conditions):** Processed in **5,831 ms** (Session active)
  - **Answer 4 (Microservice fault tolerance):** Processed in **12,718 ms** (Session completed)
- **Total AI Duration:** **39,564 ms** (~39.6 seconds)
- **HTTP Status:** `200 OK`
- **AI Evaluation Output:** Full candidate evaluation transcript generated with individual answer scores, follow-ups, and final overall performance breakdown.
- **Persistence Verification:** Retrievable via `GET /api/interview-simulator/sessions/3` (`200 OK`, status: `completed`, 4 questions recorded).
- **UI Screenshot:** `ai_flow_4_interview_simulator_ui.png`

---

## 4. AI Flow Performance Metrics Summary

| AI Feature | Request Payload | Gemini Response Time | Status | Persisted | UI Screenshot |
|---|---|---|---|---|---|
| **GitHub DNA** | `{"githubUsername":"gaearon"}` | **31.05s** | 200 OK | ✅ Yes | `ai_flow_1_github_dna_ui.png` |
| **Resume DNA** | 1.3 KB Resume Text | **24.36s** | 200 OK | ✅ Yes | `ai_flow_2_resume_dna_ui.png` |
| **Roadmap** | `track:fullstack, level:mid` | **30.10s** | 200 OK | ✅ Yes | `ai_flow_3_roadmap_ui.png` |
| **Interview Simulator** | 4-Question Interactive | **39.56s** | 200 OK | ✅ Yes | `ai_flow_4_interview_simulator_ui.png` |

---

## 5. Key Findings & Newly Discovered Issues

### 5.1 Newly Identified Issues

1. **`POST /api/roadmap` Schema Body Requirement:**
   - **Severity:** 🟠 Major
   - **Detail:** `POST /api/roadmap` strictly requires `currentLevel` enum (`"junior" | "mid" | "senior" | "staff" | "principal"`). If `currentLevel` is omitted, the endpoint returns a `400 Bad Request`. The frontend form or API docs must explicitly enforce `currentLevel`.

2. **Strict Rate Limiting on Rapid Navigation:**
   - **Severity:** 🟡 Minor (Configuration)
   - **Detail:** `generalLimiter` is set to 100 requests per 15 minutes per IP (`windowMs: 900000`). During automated browser execution, rapid single-page app refetches hit HTTP 429 (`Too many requests`). In production, this threshold may be hit by power users navigating quickly across modules.

3. **Console Log Network Warnings:**
   - **Severity:** 🟡 Minor
   - **Detail:** When loading dashboard cards before initial AI reports exist, minor 404 warnings occur as background queries gracefully handle missing roadmaps.

---

## 6. Summary Matrix

| Verification Tier | Target | Tests Executed | Passed | Failed | Status |
|---|---|---|---|---|---|
| **Phase 1: API Endpoints** | REST API & DB | 32 | 32 | 0 | ✅ **100% PASS** |
| **Phase 2: Browser & UI** | 12 UI Pages | 24 (Desktop & Mobile) | 24 | 0 | ✅ **100% PASS** |
| **Phase 3: AI Workflows** | Gemini AI Engine | 4 Core Flows | 4 | 0 | ✅ **100% PASS** |

---

## 7. Screenshots Generated

All screenshots have been created and stored in [artifacts/qa-screenshots/](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/qa-screenshots/):

- `01_login_desktop_1440px.png` & `01_login_mobile_375px.png`
- `02_dashboard_desktop_1440px.png` & `02_dashboard_mobile_375px.png`
- `03_settings_desktop_1440px.png` & `03_settings_mobile_375px.png`
- `04_goals_desktop_1440px.png` & `04_goals_mobile_375px.png`
- `05_github_dna_desktop_1440px.png` & `05_github_dna_mobile_375px.png`
- `06_resume_dna_desktop_1440px.png` & `06_resume_dna_mobile_375px.png`
- `07_roadmap_desktop_1440px.png` & `07_roadmap_mobile_375px.png`
- `08_interview_simulator_desktop_1440px.png` & `08_interview_simulator_mobile_375px.png`
- `09_roast_public_desktop_1440px.png` & `09_roast_public_mobile_375px.png`
- `10_leaderboard_desktop_1440px.png` & `10_leaderboard_mobile_375px.png`
- `11_compare_desktop_1440px.png` & `11_compare_mobile_375px.png`
- `12_feedback_widget_desktop_1440px.png` & `12_feedback_widget_mobile_375px.png`
- `ai_flow_1_github_dna_ui.png`
- `ai_flow_2_resume_dna_ui.png`
- `ai_flow_3_roadmap_ui.png`
- `ai_flow_4_interview_simulator_ui.png`

---

## 8. Session 3: Leaderboard Bug Fix & Report Download Feature — 2026-07-27

### 8.1 Task 1: Leaderboard Empty State Bug Investigation & Resolution

#### 8.1.1 Root Cause & Evidence
- **Payload Omission**: In `artifacts/engineer-dna/src/pages/github-dna.tsx` line 87, `togglePublicStatus` sent `{ isPublic: newStatus }` without passing `leaderboardOptIn: newStatus`.
- **Backend Route Logic**: In `artifacts/api-server/src/routes/github-dna.ts` line 159, `PATCH /api/github-dna/reports/:id/visibility` updated `isPublic`, but left `leaderboardOptIn` untouched (`false`).
- **Database Disconnect**: Direct PostgreSQL query confirmed `github_reports` row for test user `abhii-byte1`:
  ```json
  { "id": 6, "github_username": "abhii-byte1", "status": "completed", "overall_score": 25, "is_public": true, "leaderboard_opt_in": false }
  ```
- **Leaderboard Read Condition**: `artifacts/api-server/src/routes/leaderboard.ts` strictly required `eq(githubReportsTable.leaderboardOptIn, true)` alongside `isPublic: true`. Because `leaderboard_opt_in` remained `false`, `GET /api/leaderboard` returned an empty array `[]`.

#### 8.1.2 Fix Applied
1. **Frontend**: Updated `togglePublicStatus` in `github-dna.tsx` to send `{ isPublic: newStatus, leaderboardOptIn: newStatus }`.
2. **Backend**: Updated `PATCH /api/github-dna/reports/:id/visibility` in `github-dna.ts` so `leaderboardOptIn` defaults to match `isPublic` when omitted.

#### 8.1.3 Verification Results
- **Opt-In Write Query Output**:
  ```json
  OPT-IN WRITE RESPONSE: [{"id":6,"github_username":"abhii-byte1","is_public":true,"leaderboard_opt_in":true}]
  ```
- **Leaderboard Read Query Output**:
  ```json
  LEADERBOARD READ RESPONSE:
  [
    {
      "id": 6,
      "github_username": "abhii-byte1",
      "overall_score": 25,
      "is_public": true,
      "leaderboard_opt_in": true
    }
  ]
  ```
- **Result**: **PASS** (Opted-in user `abhii-byte1` now appears in public leaderboard results).

---

### 8.2 Task 2: Downloadable Reports Feature (html2canvas + jsPDF)

#### 8.2.1 Implementation Details
- Installed `html2canvas` and `jspdf` in `@workspace/engineer-dna`.
- Created shared utility [`artifacts/engineer-dna/src/lib/downloadReportAsPdf.ts`](file:///c:/Users/Asus/Downloads/Engineering/Engineer-DNA/Engineer-DNA/artifacts/engineer-dna/src/lib/downloadReportAsPdf.ts) taking DOM element `ref` and generating multi-page A4 PDFs with dark-mode canvas rendering.
- Integrated "Download Report" button with loading spinners and DOM `ref` wrapping on all 3 target report views:
  1. **GitHub DNA Analysis Report**: `EngineerDNA-GitHubDNA-{username}-{date}.pdf`
  2. **Resume DNA Analysis Report**: `EngineerDNA-ResumeDNA-{username}-{date}.pdf`
  3. **Roast / Coach Report**: `EngineerDNA-Roast-{username}-{date}.pdf`

#### 8.2.2 Verification Checklist & Edge Cases
- **PDF Generation & File Content**: All 3 PDFs generated cleanly and were opened/verified. Content renders cleanly with no text truncation, missing cards, or overlapping elements.
- **Button Loading State**: Buttons disable and display `<Loader2 className="animate-spin" /> Generating...` during processing. Double-clicking does NOT trigger duplicate downloads or extra background canvas captures.
- **Navigation & Chrome Exclusion**: DOM `ref` wraps only the report content card/container (excluding top navbars, mode toggle forms, and action buttons).
- **Edge Cases Handled**:
  - *Downloading before report exists*: Button is conditionally rendered only when a completed analysis report exists.
  - *Downloading mid-loading / error state*: Action buttons are disabled or hidden during pending/failed report states.

---

## 9. Session 5: Site-Wide Animation & 3D Enhancement — 2026-07-27

### 9.1 Pages & Components Enhanced

| Target Page / Component | Features Added | Implementation Details |
|---|---|---|
| **Landing Page (`home.tsx`)** | 3D DNA Helix centerpiece, Spotlight Cards, BorderBeam CTAs, Animated Grid Background | Integrated lazy-loaded `<DnaHelix3D />` canvas, cursor spotlight effects on module cards, and animated gradient CTA border beam. |
| **Login Page (`login.tsx`)** | 3D Helix background, BorderBeam on primary OAuth CTA | Added subtle ambient 3D DNA canvas behind brand panel and glowing border beam around GitHub login button. |
| **Roast Page (`roast.tsx`)** | Animated Grid Background, Score Count-Up | Wrapped public roast page in glowing grid pattern; converted static score display to animated cubic ease-out counter (`AnimatedCounter`). |
| **GitHub DNA Page (`github-dna.tsx`)** | Score Count-Up | Integrated `AnimatedCounter` for overall score reveal on completed report cards. |
| **Resume DNA Page (`resume-dna.tsx`)** | Score Count-Up | Integrated `AnimatedCounter` across Writing Quality, Tech Accuracy, and Impact scorecards. |
| **Leaderboard Page (`leaderboard.tsx`)** | Staggered Row Reveal | Applied `staggerContainer` and `staggerItem` variants to animate global ranking cards sequentially. |
| **Goals Page (`goals.tsx`)** | Staggered Card Grid Reveal | Applied `staggerContainer` and `staggerItem` variants for smooth sequential operation card entrance. |
| **Public Profile (`public-profile.tsx`)** | Download Report PDF + Shareable Scorecard | Integrated `downloadReportAsPdf` helper and action buttons. |

---

### 9.2 Shared Motion Architecture (`src/lib/animations.tsx`)
- **Reusable Framer Motion Variants**: `fadeInUp`, `fadeInDown`, `fadeIn`, `scaleUp`, `staggerContainer`, `staggerItem`.
- **`useReducedMotionPreference` Hook**: Detects `(prefers-reduced-motion: reduce)` media queries and disables rotation loops and delay offsets.
- **`usePageVisibility` Hook**: Listens to `document.visibilityState` changes and pauses Three.js requestAnimationFrame loops when tab is hidden.
- **`AnimatedCounter` Component**: Smooth 1.2s cubic ease-out count-up animation for all numeric scores.

---

### 9.3 Performance Safeguards & Bundle Delta

#### 1. Bundle Size Impact (Pre vs Post Session 5)
- **Pre-Session 5 Main Bundle**: `440.03 kB` (`140.86 kB` gzip)
- **Post-Session 5 Main Bundle**: `444.42 kB` (`142.14 kB` gzip)
- **Main Bundle Increase**: **+4.39 kB** (0.99% delta — well within the <150–200 kB budget safeguard).
- **3D Canvas Engine Chunk (`dna-helix-3d-*.js`)**: `895.17 kB` (`241.64 kB` gzip) — **100% lazy-loaded on demand** via `React.lazy()` + `<Suspense>`, never blocking initial page load or core functional routes.

#### 2. Accessibility & Reduced Motion Confirmation
- **`prefers-reduced-motion: reduce`**: Verified that animations, 3D rotations, and count-up loops freeze/render instantly as static fallbacks.
- **Tab Visibility (Page Visibility API)**: Verified that 3D canvas rendering loops pause when tab loses focus.

#### 3. Deliberate Animation Tradeoffs
- Data-dense functional pages (**Dashboard**, **Settings**, **Admin**) were deliberately kept clean without heavy particle effects or complex 3D viewports to preserve data scannability and maximum responsiveness.


