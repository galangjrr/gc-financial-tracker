# ARCHITECTURE.md — Technical Architecture & Database Specification
> System: **GC Financial Tracker (SaaS)**  
> Version: 1.0.0  
> Target Infrastructure: **Supabase (PostgreSQL 15+) & Vercel**

---

## 1. High-Level System Architecture

```
                                  +--------------------------------------------------+
                                  |                 CLIENT LAYER                     |
                                  |  Next.js App Router (React Server Components)    |
                                  +------------------------+-------------------------+
                                                           |
                                      HTTPS / WSS (REST, GraphQL, Realtime)
                                                           |
                                                           v
                                  +--------------------------------------------------+
                                  |               SUPABASE PLATFORM                  |
                                  |                                                  |
                                  |  +-------------------+    +-------------------+  |
                                  |  | Supabase Auth     |    | Supabase Realtime |  |
                                  |  +---------+---------+    +---------+---------+  |
                                  |            |                        |            |
                                  |            v                        |            |
                                  |  +----------------------------------+---------+  |
                                  |  | PostgreSQL Database + RLS Policies         |  |
                                  |  +--------------------------------------------+  |
                                  +------------------------^-------------------------+
                                                           |
                                            Service Role API / Secrets
                                                           |
                                  +------------------------+-------------------------+
                                  |             EDGE FUNCTIONS LAYER                 |
                                  |  Deno Serverless Runtime                         |
                                  |  - telegram-webhook (Bot Logic + OCR Router)     |
                                  |  - payment-webhook  (Midtrans/Xendit Router)    |
                                  +------------+-----------------------+-------------+
                                               |                       |
                                     HTTPS REST                        HTTPS REST
                                               v                       v
                                  +--------------------+     +-------------------+
                                  | Gemini Vision API  |     | Payment Gateway   |
                                  | (Receipt OCR)      |     | (Midtrans/Xendit) |
                                  +--------------------+     +-------------------+
```

---

## 2. Complete Database DDL SQL

Below is the complete, idempotent SQL script defining the relational schema, constraints, triggers, and computational views.

```sql
-- ============================================================================
-- 1. EXTENSIONS & SCHEMAS
-- ============================================================================
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Set timezone default
set time zone 'Asia/Jakarta';

-- ============================================================================
-- 2. TABLE DEFINITIONS
-- ============================================================================

-- Table 1: FAMILIES (Tenants)
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('personal', 'family')) default 'family',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.families is 'Primary tenant unit. One family represents one household subscription.';

-- Table 2: FAMILY MEMBERS (Junction table linking auth.users to families with roles)
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('admin', 'editor', 'viewer')) default 'viewer',
  telegram_chat_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, user_id)
);

comment on table public.family_members is 'User role assignments and Telegram credentials per family.';

-- Table 3: WALLETS (Financial accounts owned by a family)
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  wallet_name text not null,
  initial_balance numeric(14,2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, wallet_name)
);

-- Table 4: CATEGORIES (Budget allocation & classification)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  segment text not null check (segment in ('Pengeluaran', 'Tagihan', 'Tabungan', 'Pemasukan', 'Liabilitas')),
  category_name text not null,
  budget_target numeric(14,2) default 0.00,
  keywords text[] default '{}',
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, segment, category_name)
);

-- Table 5: TRANSACTIONS (Financial audit log and entry records)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  tx_date date not null default current_date,
  type text not null check (type in ('Pengeluaran', 'Pemasukan', 'Tabungan', 'Tagihan', 'Liabilitas')),
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0.00),
  wallet_source_id uuid references public.wallets(id) on delete restrict,
  wallet_dest_id uuid references public.wallets(id) on delete restrict,
  source_device text check (source_device in ('Web_App', 'Telegram_Bot')) default 'Web_App',
  notes text,
  status text not null default 'confirmed' check (status in ('pending_review', 'confirmed', 'void')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  legacy_id text,
  constraint check_wallet_transfer check (
    (type = 'Pemasukan' and wallet_dest_id is not null) or
    (type in ('Pengeluaran', 'Tagihan', 'Liabilitas') and wallet_source_id is not null) or
    (type = 'Tabungan' and wallet_source_id is not null)
  )
);

-- Table 6: SUBSCRIPTIONS (Monetization & tenant licensing)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families(id) on delete cascade,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled')) default 'trialing',
  plan text check (plan in ('monthly', 'yearly', 'lifetime')) default 'monthly',
  provider text check (provider in ('midtrans', 'xendit', 'stripe')) default 'midtrans',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. INDEXING STRATEGY (Performance Tuning)
-- ============================================================================

-- Foreign key indexes for rapid join traversal
create index if not exists idx_family_members_user_id on public.family_members(user_id);
create index if not exists idx_family_members_family_id on public.family_members(family_id);
create index if not exists idx_family_members_telegram on public.family_members(telegram_chat_id) where telegram_chat_id is not null;

create index if not exists idx_wallets_family_id on public.wallets(family_id);
create index if not exists idx_categories_family_id on public.categories(family_id);

-- Transaction optimization indexes
create index if not exists idx_transactions_family_date on public.transactions(family_id, tx_date desc);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_transactions_wallet_source on public.transactions(wallet_source_id);
create index if not exists idx_transactions_wallet_dest on public.transactions(wallet_dest_id);
create index if not exists idx_transactions_status_deleted on public.transactions(status, deleted_at);

-- ============================================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Set updated_at timestamp automatically
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
create trigger trg_families_updated_at before update on public.families for each row execute function public.set_updated_at();
create trigger trg_family_members_updated_at before update on public.family_members for each row execute function public.set_updated_at();
create trigger trg_wallets_updated_at before update on public.wallets for each row execute function public.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger trg_transactions_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger trg_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. COMPUTED VIEWS
-- ============================================================================

-- View: Wallet Balances (Calculated in real-time based on initial balance and net confirmed transactions)
create or replace view public.wallet_balances as
with wallet_outflows as (
  select
    wallet_source_id as wallet_id,
    sum(amount) as total_outflow
  from public.transactions
  where status = 'confirmed'
    and deleted_at is null
    and wallet_source_id is not null
  group by wallet_source_id
),
wallet_inflows as (
  select
    wallet_dest_id as wallet_id,
    sum(amount) as total_inflow
  from public.transactions
  where status = 'confirmed'
    and deleted_at is null
    and wallet_dest_id is not null
  group by wallet_dest_id
)
select
  w.id as wallet_id,
  w.family_id,
  w.wallet_name,
  w.initial_balance,
  coalesce(i.total_inflow, 0.00) as total_inflows,
  coalesce(o.total_outflow, 0.00) as total_outflows,
  w.initial_balance + coalesce(i.total_inflow, 0.00) - coalesce(o.total_outflow, 0.00) as current_balance,
  w.created_at,
  w.updated_at
from public.wallets w
left join wallet_inflows i on i.wallet_id = w.id
left join wallet_outflows o on o.wallet_id = w.id;

comment on view public.wallet_balances is 'Real-time computed balance view per wallet.';
```

---

## 3. Row Level Security (RLS) Policy Architecture

All policies rely on `SECURITY DEFINER` helper functions to bypass recursive policy evaluations while guaranteeing strict isolation.

```sql
-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.subscriptions enable row level security;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR SECURITY EVALUATION
-- ============================================================================

-- Check if authenticated user is a member of the given family
create or replace function public.is_family_member(fam_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = fam_id
      and user_id = auth.uid()
  );
$$;

-- Check if authenticated user has Admin or Editor write privileges
create or replace function public.has_write_role(fam_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = fam_id
      and user_id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

-- Check if authenticated user is the Family Admin
create or replace function public.is_family_admin(fam_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = fam_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- Check if family has an active or trialing subscription (Paywall Guardrail)
create or replace function public.has_active_subscription(fam_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions
    where family_id = fam_id
      and status in ('active', 'trialing')
      and (current_period_end is null or current_period_end > now())
  );
$$;

-- ============================================================================
-- 3. RLS POLICIES
-- ============================================================================

-- FAMILIES POLICIES
create policy "fam_select" on public.families for select using (public.is_family_member(id));
create policy "fam_update" on public.families for update using (public.is_family_admin(id)) with check (public.is_family_admin(id));

-- FAMILY MEMBERS POLICIES
create policy "mem_select" on public.family_members for select using (public.is_family_member(family_id));
create policy "mem_insert" on public.family_members for insert with check (public.is_family_admin(family_id));
create policy "mem_update" on public.family_members for update using (public.is_family_admin(family_id)) with check (public.is_family_admin(family_id));
create policy "mem_delete" on public.family_members for delete using (public.is_family_admin(family_id));

-- WALLETS POLICIES
create policy "wal_select" on public.wallets for select using (public.is_family_member(family_id));
create policy "wal_insert" on public.wallets for insert with check (public.has_write_role(family_id) and public.has_active_subscription(family_id));
create policy "wal_update" on public.wallets for update using (public.has_write_role(family_id) and public.has_active_subscription(family_id)) with check (public.has_write_role(family_id));
create policy "wal_delete" on public.wallets for delete using (public.is_family_admin(family_id));

-- CATEGORIES POLICIES
create policy "cat_select" on public.categories for select using (public.is_family_member(family_id));
create policy "cat_insert" on public.categories for insert with check (public.has_write_role(family_id) and public.has_active_subscription(family_id));
create policy "cat_update" on public.categories for update using (public.has_write_role(family_id) and public.has_active_subscription(family_id)) with check (public.has_write_role(family_id));
create policy "cat_delete" on public.categories for delete using (public.is_family_admin(family_id));

-- TRANSACTIONS POLICIES
create policy "tx_select" on public.transactions for select using (public.is_family_member(family_id));
create policy "tx_insert" on public.transactions for insert with check (public.has_write_role(family_id) and public.has_active_subscription(family_id));
create policy "tx_update" on public.transactions for update using (public.is_family_member(family_id)) with check (public.has_write_role(family_id) and public.has_active_subscription(family_id));
create policy "tx_delete" on public.transactions for delete using (public.is_family_admin(family_id));

-- SUBSCRIPTIONS POLICIES
create policy "sub_select" on public.subscriptions for select using (public.is_family_member(family_id));
```

---

## 4. Scalability, Concurrency & Security Architecture (10,000+ Users)

### 4.1 Connection Pooling & Database Scalability
* **Supavisor (Transaction Mode):** Seluruh Server Actions dan Edge Functions wajib terhubung menggunakan connection pooler Supavisor pada port `6543` (transaction mode), bukan port direct `5432` untuk mencegah exhaust database connection limit saat high concurrency traffic.
* **RLS Query Optimization:** Indeks komposit pada `family_id` di semua tabel finansial memastikan query terisolasi secara optimal tanpa *table scan* yang memberatkan server.

### 4.2 Security & Session Integrity
* **Supabase PKCE Auth Flow:** Login Google OAuth menggunakan authorization code flow dengan PKCE (Proof Key for Code Exchange) untuk mengamankan pertukaran token di client-side.
* **HttpOnly Session Cookies:** Caching state di middleware menggunakan cookie ter-enkripsi dan `httpOnly` untuk mencegah serangan cross-site scripting (XSS).
* **Next.js Caching:** Manfaatkan static generation (ISR) untuk Landing Page guna menghemat resource server Next.js dan Vercel Edge.
