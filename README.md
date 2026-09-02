# 🧬 EngineerDNA — AI-Powered Engineering Growth OS

> **Decode your code choices, benchmark skills against real SQL percentiles, unlock developer archetypes, and build a targeted growth roadmap.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite 7](https://img.shields.io/badge/Vite-7.3-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS 4](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-black.svg)](https://threejs.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8e44ad.svg)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-336791.svg)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview

**EngineerDNA** is a full-stack, data-backed engineering diagnostic platform. It analyzes public GitHub repository history, commit velocity, tech stacks, and resume text to produce objective developer scorecards, real database percentile rankings, and actionable career roadmaps.

Designed with a high-end developer tool aesthetic (inspired by Vercel, Linear, Aceternity UI, and Magic UI), EngineerDNA features dynamic WebGL 3D visualizers, smooth Framer Motion micro-interactions, responsive score counters, and client-side PDF exports.

---

## 🚀 Key Features

### 1. 🧬 GitHub DNA Analysis Engine
- **Repo Deep Dive**: Evaluates commit logs, primary languages, repository topics, and architectural patterns.
- **Developer Archetypes**: Categorizes your profile into 1 of 9 fixed Developer Archetypes (e.g. `Night Owl Architect`, `Fullstack Craftsman`, `Data Weaver`).
- **Real SQL Percentiles**: Benchmarks overall scores against real database entries using exact PostgreSQL percentile queries.

### 2. 📄 Resume DNA & Impact Rewriter
- **Metric Detection**: Identifies passive job descriptions vs. quantifiable engineering achievements.
- **Bullet Point Rewriter**: Converts passive tasks into active, impact-focused bullets with metrics.
- **Skill Gap Detection**: Highlights missing keywords tailored to target engineering roles (e.g. Senior Frontend, Staff Systems Engineer).

### 3. 🔥 Public Roast & Technical Coach Engine
- **Instant Roast Mode**: Unauthenticated, viral public entry point powered by Google Gemini AI.
- **Cloudflare Turnstile**: Bot protection integration for public roast endpoints.
- **Coach Mode**: Constructive, growth-oriented feedback tailored to developer experience levels.

### 4. 🏆 Leaderboard & Matchup Engine
- **Verified Leaderboard**: Opt-in public ranking benchmarked by track (Full Stack, Backend, Frontend, DevOps, Systems) and experience level.
- **Side-by-Side Matchup (`/compare/user1/user2`)**: Compare scores, developer archetypes, and tech stacks of two engineers.

### 5. 🎯 Next 3 Things Roadmap Generator
- **Personalized Career Path**: 10 structured week-by-week milestones tailored to level transitions (e.g. Mid-Level to Staff Engineer).
- **Task Tracking**: Interactive progress checkboxes and milestone status updates.

### 6. 🎙️ Mock Technical Interview Simulator
- **Bounded Sessions**: Practice tailored 4-question technical interviews on chosen tracks.
- **AI Feedback Loop**: Evaluation of technical depth, accuracy, and communication clarity per answer.

### 7. 📄 One-Click Downloadable PDF Reports
- **Multi-Page Export**: Generates clean, formatted A4 PDFs for **GitHub DNA**, **Resume DNA**, and **Roast** reports using `html2canvas` and `jsPDF`.

### 8. 🎨 Premium 3D & Motion Interface
- **Interactive 3D DNA Helix**: WebGL canvas built with `@react-three/fiber` & Three.js with ambient rotation loops.
- **Aceternity UI / Magic UI Effects**: Cursor-follow Spotlight Cards, animated Border Beams on CTAs, and pulsing background grid patterns.
- **Accessibility Safeguards**: Prefers-reduced-motion fallbacks and Page Visibility API integration (pauses 3D loops when tab is hidden).

---

## 🛠️ Tech Stack & Architecture

### **Monorepo Structure (pnpm Workspaces)**

```
EngineerDNA/
├── artifacts/
│   ├── engineer-dna/        # React 19 + Vite 7 Frontend Web Application
│   └── api-server/           # Node.js + Express + TypeScript Backend API Server
├── lib/
│   ├── db/                  # Drizzle ORM Schema & PostgreSQL Client
│   ├── api-spec/            # OpenAPI 3.0 Specification (`openapi.yaml`)
│   ├── api-zod/             # Auto-generated Zod Validation Schemas (via Orval)
│   └── api-client-react/    # Auto-generated TanStack Query React Hooks (via Orval)
├── .agents/                 # AI Agent Memory & System Rules
└── TEST_REPORT.md           # Comprehensive QA & Empirical Test Execution Log
```

### **Core Stack**

| Tier | Technologies |
|---|---|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, Framer Motion, Three.js (`@react-three/fiber`, `@react-three/drei`), Wouter Router, Radix UI, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, Drizzle ORM, PostgreSQL (`pg`), Zod, Google Gemini AI (`gemini-2.5-flash`), Cloudflare Turnstile |
| **PDF & Export** | `html2canvas`, `jspdf` |
| **Tooling & Build** | pnpm, Orval, TypeScript, ESLint |

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or `v11.x` (`npm install -g pnpm`)
- **PostgreSQL Database**: Local or hosted (e.g. Supabase, Neon, Railway)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/abhii-byte1/EngineerDNA1.git
cd EngineerDNA
pnpm install
```

### 2. Configure Environment Variables

Create `.env` in root and `artifacts/api-server/.env`:

```env
# Root .env & artifacts/api-server/.env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/engineerdna
GEMINI_API_KEY=your_google_gemini_api_key
SESSION_SECRET=your_random_session_secret_key

# OAuth Configuration (Optional for Dev Login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Vite Client Environment (.env)
VITE_TURNSTILE_SITE_KEY=
```

### 3. Initialize Database Schema

```bash
pnpm --filter @workspace/db push
```

### 4. Run Development Servers

```bash
pnpm start
```
- **Frontend App**: `http://localhost:5173` (or Vite dev port)
- **API Backend**: `http://localhost:5000`

---

## 🧪 Verification & Building

### Typecheck All Workspaces
```bash
pnpm run typecheck
```

### Build Production Bundles
```bash
pnpm --filter @workspace/engineer-dna build
pnpm --filter @workspace/api-server build
```

---

## 👨‍💻 Developer Spotlight

Built with ❤️ by **Abhishek Meena**:
- **Role**: Full Stack Developer (MERN / TypeScript / AI Integrations)
- **Education**: B.Tech in Computer Science & Engineering (AI & ML), Oriental Institute of Science and Technology, Bhopal (2023–2027)
- **GitHub**: [@abhii-byte1](https://github.com/abhii-byte1)
- **LinkedIn**: [Abhishek Meena](https://linkedin.com/in/abhishek-meena-0647663a0)
- **Portfolio**: [abhishek-meena.vercel.app](https://portfolio-xi-seven-wwkbi54bx9.vercel.app)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
