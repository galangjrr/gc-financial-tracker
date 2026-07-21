# AGENTS.md — AI Coding Agent Execution Standard
> Project: **GC Financial Tracker (SaaS Migration)**  
> Version: 1.0.0  
> Status: Production Specification  

---

## 1. Executive Purpose & Governance
This document establishes the binding operational directives, architectural boundaries, and code quality standards for AI Coding Agents (Cursor, Claude Code, Windsurf, Devin, RooCode, Gemini CLI, etc.) working on the **GC Financial Tracker** codebase.

- **Primary Source of Truth**: `PRD.md` defines all business domain logic, user requirements, and product features.
- **Secondary Source of Truth**: Database Migrations (`supabase/migrations/*`) define the structural reality of the system.
- **Hierarchy of Authority**:
  1. `PRD.md`
  2. Database Migrations & SQL Policies
  3. `ARCHITECTURE.md` / `INTEGRATIONS.md` / `UI_SPEC.md`
  4. `AGENTS.md`

> [!CAUTION]
> **Strict Rule**: AI Agents MUST NEVER invent business rules, unapproved database tables, unmapped endpoints, or arbitrary UI flows. If an instruction is ambiguous, the agent must insert a `// TODO: [Clarification Needed]` comment and request user input rather than hallucinating assumptions.

---

## 2. Core Operational Directives

### 2.1 Tenant Boundary Isolation (`family_id`)
1. **Multi-Tenant Unit**: The unit of tenancy is a **`family`** (`family_id`), **NOT** an individual user (`user_id`).
2. **Personal vs Family Mode**: Aplikasi mendukung mode "Personal" dan "Keluarga". Keduanya menggunakan tabel `families` yang sama (tenant-based) dan dibedakan lewat flag `account_type`. Jangan membuat dua struktur sistem yang berbeda; mode Personal adalah tenant dengan 1 anggota.
3. **Data Model Integrity**: All financial tables (`wallets`, `categories`, `transactions`, `subscriptions`) MUST contain a mandatory, foreign-keyed `family_id` column.
4. **Query Guardrail**: EVERY SQL query, Supabase client call, and database function MUST include `where family_id = ...` or rely on Row Level Security (RLS) enforcement. Isolating data solely by `user_id` without checking `family_id` is classified as a Critical Security Bug.

### 2.2 Security & Zero-Trust Enforcement
1. **RLS Mandatory Policy**: RLS MUST be enabled on 100% of public schema tables. Disabling RLS in any environment (including local testing) is forbidden.
2. **Service Role Key Boundary**: The `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to Edge Functions (for Telegram Webhooks and Payment Gateways) and CI/CD maintenance scripts. It MUST NEVER be imported, referenced, or exposed in the Next.js frontend code.
3. **Webhook Cryptographic Verification**: Every webhook handler MUST verify incoming signatures prior to parsing or processing payload bodies (Telegram secret header check; Midtrans SHA-512 signature hash check; Xendit callback token match).

---

## 3. Technology Stack Specification

| Tier | Approved Technology | Standard / Version |
|---|---|---|
| **Frontend Framework** | Next.js | App Router, React 19, Server Components |
| **Styling & Design System** | Tailwind CSS v3 + `shadcn/ui` | Radix UI primitives, Lucide Icons |
| **State Management & Data Fetching** | `@supabase/ssr` + TanStack Query v5 | Server State caching & mutation invalidation |
| **Backend & BaaS** | Supabase | PostgreSQL 15+, Supabase Auth, Storage, Realtime |
| **Serverless Logic** | Supabase Edge Functions | TypeScript on Deno runtime |
| **Form Handling & Validation** | `react-hook-form` + `zod` | End-to-end type safety |
| **AI / OCR Integration** | Google Gemini 3.5 Flash | Vision API via official `@google/generative-ai` SDK |
| **Payment Gateway** | Midtrans / Xendit | Snap API, Core API, Webhook Handlers |

---

## 4. Repository Directory Layout

```text
gc-financial-tracker/
├── app/                        # Next.js App Router hierarchy
│   ├── (auth)/                 # Auth routes (login, register)
│   ├── (dashboard)/            # Protected application routes
│   │   ├── wallets/            # Wallet CRUD & transfer views
│   │   ├── categories/         # Category & budget management
│   │   ├── transactions/       # Transaction tables, filters, modals
│   │   └── settings/           # Family member management & billing
│   ├── api/                    # Next.js API Route handlers (if needed)
│   ├── layout.tsx              # Root layout & providers
│   └── page.tsx                # Landing / Redirect logic
├── components/                 # Reusable React components
│   ├── ui/                     # Primitives (shadcn/ui buttons, dialogs, inputs)
│   ├── forms/                  # React Hook Form + Zod forms
│   ├── charts/                 # Recharts / Analytics visualizations
│   └── shared/                 # Modals, sidebars, headers, status badges
├── features/                   # Domain-driven feature modules
│   ├── auth/                   # Session management, OAuth hooks
│   ├── family/                 # Family creation, invites, member roles
│   ├── transactions/           # CRUD logic, optimistic UI updates
│   ├── wallets/                # Balance calculations, transfer logic
│   └── billing/                # Subscription status hooks, payment triggers
├── lib/                        # Core utilities & client instances
│   ├── supabase/               # Supabase browser, server, and middleware clients
│   ├── utils.ts                # Formatting (Currency, Date IDR), classnames
│   └── validators/             # Zod schemas matching DB constraints
├── supabase/                   # Database & Serverless infrastructure
│   ├── functions/              # Edge Functions
│   │   ├── telegram-webhook/   # Telegram Bot logic + Gemini OCR
│   │   └── payment-webhook/    # Payment gateway webhook handlers
│   ├── migrations/             # Sequential SQL migration files
│   └── config.toml             # Supabase CLI project configuration
├── types/                      # TypeScript definitions & auto-generated DB types
│   ├── database.types.ts       # Generated via `supabase gen types typescript`
│   └── index.ts                # App-specific domain interfaces
└── docs/                       # Project documentation suite
    ├── PRD.md                  # Business requirements
    ├── AGENTS.md               # AI Execution Standard
    ├── ARCHITECTURE.md         # Database schema, RLS, system design
    ├── INTEGRATIONS.md         # Telegram, Gemini OCR, Payment APIs
    └── UI_SPEC.md              # UI/UX specs & routes
```

---

## 5. Development Phase Sequence

To prevent circular dependencies and architectural deadlocks, AI Agents MUST execute features in this exact order:

1. **Phase 1: Database & Auth Infrastructure** — Apply migrations for `families`, `family_members`, `wallets`, `categories`, `transactions`, `subscriptions`, and all RLS helper functions.
2. **Phase 2: Authentication & Family Onboarding** — Implement Next.js SSR auth flow (Google OAuth), family creation trigger on sign-up (Personal/Family question), and invitation system.
3. **Phase 3: Core Domain CRUD (Wallets & Categories)** — Build wallet creation, category allocation per segment (`Pengeluaran`, `Tagihan`, `Tabungan`, `Pemasukan`, `Liabilitas`), and budget target settings.
4. **Phase 4: Transaction Engine & Realtime Sync** — Build manual transaction creation, transfer between wallets, soft-delete mechanisms, and Supabase Realtime subscriptions.
5. **Phase 5: Analytics & Dashboard** — Build financial status cards, monthly expense progress bars, and net worth calculations via SQL Views.
6. **Phase 6: Edge Functions & Integrations** — Build `telegram-webhook` (bot parsing + Gemini Vision OCR) and `payment-webhook` (Midtrans/Xendit lifecycle handling).
7. **Phase 7: Paywall & RLS Gating** — Enforce subscription state checking inside RLS write policies and client UI locks.

---

## 6. Coding Standards & Conventions

### 6.1 TypeScript Principles
- `"strict": true` must be enabled in `tsconfig.json`.
- **Zero `any` Allowance**: Explicitly type every parameter, return type, and variable. Use `unknown` with Zod parsing if type is uncertain at runtime.
- **DB Type Single Source**: Always import database entities from `@/types/database.types.ts`.

### 6.2 React & Server Components
- Default to **React Server Components (RSC)** for initial data fetching and page structures.
- Declare `'use client'` strictly at the top of atomic UI components that require state (`useState`), effects (`useEffect`), event listeners, or client-side hooks.
- **Maximum File Limit**: No single component file shall exceed **250 lines of code**. Refactor sub-components into standalone files inside `components/` or `features/`.

### 6.3 Standard API Response Structure
All API handlers and server actions MUST return unified JSON shapes:

```typescript
// Success Payload
type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

// Error Payload
type ApiErrorResponse = {
  success: false;
  error: {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
    message: string;
    details?: unknown;
  };
};
```

---

## 7. Quality Assurance & Logging Boundaries

### 7.1 Security & Data Privacy Guidelines
- **Permitted Logs**: Log operational lifecycle events (e.g., "Telegram webhook received", "Payment status updated to settlement", "OCR processing completed").
- **Forbidden Logs**: AI Agents MUST NEVER print, log, or record:
  - User passwords or 6-digit PIN hashes.
  - JWT Tokens, API Keys, or Service Role secret values.
  - Raw financial balances linked to specific email addresses in server console output.

### 7.2 Definition of Done (DoD)
A task or feature code generated by AI is deemed COMPLETE only when:
1. Code compiles without TypeScript errors (`npm run type-check` passes).
2. Code satisfies ESLint rules without suppressing warnings via `eslint-disable`.
3. Database migrations include corresponding RLS policies and rollback considerations.
4. Financial calculations match IDR currency formatting specifications (`Rp 1.500.000`).
5. All UI copy is correctly localized in **Bahasa Indonesia**.
