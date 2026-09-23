-- Schema adjustments for Goals, Debts, Transfer type, and legacy migration compatibility

-- 1. Family Members: Add PIN support
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS pin TEXT;

-- 2. Categories: Add target frequency and cumulative target
ALTER TABLE categories ADD COLUMN IF NOT EXISTS total_target_cumulative NUMERIC(14,2) DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS target_frequency TEXT DEFAULT 'Bulanan';

-- 3. Transactions: Expand Type and Status constraints for Transfers and Legacy statuses
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('Pengeluaran', 'Pemasukan', 'Tabungan', 'Tagihan', 'Liabilitas', 'Transfer'));

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
  CHECK (status IN ('pending_review', 'confirmed', 'void', 'Active', 'Deleted'));

-- 4. Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  legacy_id TEXT,
  name TEXT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  priority TEXT DEFAULT 'Sedang',
  saved_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Debts Table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  legacy_id TEXT,
  debt_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Utang', 'Piutang')),
  person TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  notes TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'Belum Lunas',
  is_installment BOOLEAN NOT NULL DEFAULT FALSE,
  installment_due_date TEXT,
  installment_duration TEXT,
  installment_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  installment_paid NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_goals_updated_at ON goals;
CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_debts_updated_at ON debts;
CREATE TRIGGER trg_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indices
CREATE INDEX IF NOT EXISTS idx_goals_family_id ON goals(family_id);
CREATE INDEX IF NOT EXISTS idx_debts_family_id ON debts(family_id);
CREATE INDEX IF NOT EXISTS idx_debts_date ON debts(debt_date);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view family goals') THEN
    CREATE POLICY "Members can view family goals" ON goals FOR SELECT USING (is_family_member(family_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins/Editors can manage goals') THEN
    CREATE POLICY "Admins/Editors can manage goals" ON goals FOR ALL USING (is_family_member(family_id)) WITH CHECK (has_write_role(family_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view family debts') THEN
    CREATE POLICY "Members can view family debts" ON debts FOR SELECT USING (is_family_member(family_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins/Editors can manage debts') THEN
    CREATE POLICY "Admins/Editors can manage debts" ON debts FOR ALL USING (is_family_member(family_id)) WITH CHECK (has_write_role(family_id));
  END IF;
END $$;
