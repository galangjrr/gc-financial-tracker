-- 1. Setup Base Functions
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Core Tables
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL, -- references auth.users(id) - deferred until real auth
  account_type TEXT NOT NULL CHECK (account_type IN ('personal', 'family')) DEFAULT 'family',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')) DEFAULT 'trialing',
  plan TEXT,
  provider TEXT CHECK (provider IN ('midtrans', 'xendit', 'stripe')),
  provider_customer_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users(id)
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  telegram_chat_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  wallet_name TEXT NOT NULL,
  initial_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  segment TEXT NOT NULL CHECK (segment IN ('Pengeluaran', 'Tagihan', 'Tabungan', 'Pemasukan', 'Liabilitas')),
  category_name TEXT NOT NULL,
  budget_target NUMERIC(14,2),
  keywords TEXT[] DEFAULT '{}',
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, segment, category_name)
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  tx_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Pengeluaran', 'Pemasukan', 'Tabungan', 'Tagihan', 'Liabilitas')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  wallet_source_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  wallet_dest_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  source_device TEXT CHECK (source_device IN ('Web_App', 'Telegram_Bot')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending_review', 'confirmed', 'void')),
  created_by UUID, -- references auth.users(id)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  legacy_id TEXT
);

-- 3. Triggers for updated_at
CREATE TRIGGER trg_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Indexing for Performance
CREATE INDEX idx_subscriptions_family_id ON subscriptions(family_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_wallets_family_id ON wallets(family_id);
CREATE INDEX idx_categories_family_id ON categories(family_id);
CREATE INDEX idx_transactions_family_id ON transactions(family_id);
CREATE INDEX idx_transactions_wallet_source_id ON transactions(wallet_source_id);
CREATE INDEX idx_transactions_wallet_dest_id ON transactions(wallet_dest_id);
CREATE INDEX idx_transactions_tx_date ON transactions(tx_date);

-- 5. Realtime Computed View
CREATE OR REPLACE VIEW wallet_balances AS
WITH wallet_flows AS (
  SELECT wallet_source_id AS wallet_id,
         CASE WHEN type = 'Pemasukan' AND wallet_dest_id IS NULL THEN amount
              ELSE -amount END AS flow
  FROM transactions
  WHERE status = 'confirmed' AND deleted_at IS NULL AND wallet_source_id IS NOT NULL
  UNION ALL
  SELECT wallet_dest_id AS wallet_id,
         amount AS flow
  FROM transactions
  WHERE status = 'confirmed' AND deleted_at IS NULL AND wallet_dest_id IS NOT NULL
)
SELECT
  w.id AS wallet_id,
  w.family_id,
  w.wallet_name,
  w.initial_balance + COALESCE(SUM(f.flow), 0) as current_balance
FROM wallets w
LEFT JOIN wallet_flows f ON f.wallet_id = w.id
GROUP BY w.id, w.family_id, w.wallet_name, w.initial_balance;

-- 6. Row Level Security (RLS) Architecture
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Security Definer Helpers
CREATE OR REPLACE FUNCTION is_family_member(fam_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members
    WHERE family_id = fam_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION has_write_role(fam_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members
    WHERE family_id = fam_id AND user_id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION has_active_subscription(fam_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE family_id = fam_id AND status IN ('active', 'trialing')
  );
$$;

-- RLS Policies: families
CREATE POLICY "Users can read their own families"
  ON families FOR SELECT
  USING (is_family_member(id));

-- RLS Policies: family_members
CREATE POLICY "Members can view family members list"
  ON family_members FOR SELECT
  USING (is_family_member(family_id));

-- RLS Policies: wallets
CREATE POLICY "Members can view family wallets"
  ON wallets FOR SELECT
  USING (is_family_member(family_id));

CREATE POLICY "Admins/Editors can manage wallets"
  ON wallets FOR ALL
  USING (is_family_member(family_id))
  WITH CHECK (has_write_role(family_id) AND has_active_subscription(family_id));

-- RLS Policies: categories
CREATE POLICY "Members can view family categories"
  ON categories FOR SELECT
  USING (is_family_member(family_id));

CREATE POLICY "Admins/Editors can manage categories"
  ON categories FOR ALL
  USING (is_family_member(family_id))
  WITH CHECK (has_write_role(family_id) AND has_active_subscription(family_id));

-- RLS Policies: transactions
CREATE POLICY "Members can view family transactions"
  ON transactions FOR SELECT
  USING (is_family_member(family_id));

CREATE POLICY "Members can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (is_family_member(family_id) AND has_write_role(family_id) AND has_active_subscription(family_id));

CREATE POLICY "Members can update transactions"
  ON transactions FOR UPDATE
  USING (is_family_member(family_id))
  WITH CHECK (has_write_role(family_id) AND has_active_subscription(family_id));

-- RLS Policies: subscriptions
CREATE POLICY "Members can view family subscription status"
  ON subscriptions FOR SELECT
  USING (is_family_member(family_id));
