-- 20260721000004_query_performance_indexes.sql
-- Optimasi query performance dan indexing sesuai standar Supabase Postgres Best Practices

-- 1. Optimasi view wallet_balances: pushdown predicate family_id
CREATE OR REPLACE VIEW wallet_balances AS
WITH wallet_flows AS (
  SELECT family_id, wallet_source_id AS wallet_id,
         CASE WHEN type = 'Pemasukan' AND wallet_dest_id IS NULL THEN amount ELSE -amount END AS flow
  FROM transactions
  WHERE status = 'confirmed' AND deleted_at IS NULL AND wallet_source_id IS NOT NULL
  UNION ALL
  SELECT family_id, wallet_dest_id AS wallet_id,
         amount AS flow
  FROM transactions
  WHERE status = 'confirmed' AND deleted_at IS NULL AND wallet_dest_id IS NOT NULL
)
SELECT 
  w.id as wallet_id,
  w.family_id,
  w.wallet_name,
  w.initial_balance + COALESCE(SUM(f.flow), 0) as current_balance
FROM wallets w
LEFT JOIN wallet_flows f ON f.wallet_id = w.id AND f.family_id = w.family_id
GROUP BY w.id, w.family_id, w.wallet_name, w.initial_balance;

-- 2. Composite partial index untuk query transaksi aktif terurut tanggal
CREATE INDEX IF NOT EXISTS idx_transactions_perf_family_date 
ON transactions (family_id, tx_date DESC, created_at DESC) 
WHERE deleted_at IS NULL AND status = 'confirmed';

-- 3. Covering index untuk agregasi KPI bulanan (Index-Only Scan)
CREATE INDEX IF NOT EXISTS idx_transactions_perf_kpi
ON transactions (family_id, tx_date, type) 
INCLUDE (amount) 
WHERE deleted_at IS NULL AND status = 'confirmed';

-- 4. Covering index untuk breakdown pengeluaran per kategori
CREATE INDEX IF NOT EXISTS idx_transactions_perf_category
ON transactions (family_id, category_id, tx_date) 
INCLUDE (amount, type) 
WHERE deleted_at IS NULL AND status = 'confirmed';

-- 5. Covering index untuk kalkulasi saldo dompet sumber
CREATE INDEX IF NOT EXISTS idx_transactions_perf_wallet_source
ON transactions (family_id, wallet_source_id, type) 
INCLUDE (amount, wallet_dest_id) 
WHERE deleted_at IS NULL AND status = 'confirmed' AND wallet_source_id IS NOT NULL;

-- 6. Covering index untuk kalkulasi saldo dompet tujuan
CREATE INDEX IF NOT EXISTS idx_transactions_perf_wallet_dest
ON transactions (family_id, wallet_dest_id) 
INCLUDE (amount) 
WHERE deleted_at IS NULL AND status = 'confirmed' AND wallet_dest_id IS NOT NULL;

-- 7. Composite index untuk debts per keluarga terurut tanggal
CREATE INDEX IF NOT EXISTS idx_debts_perf_family_date
ON debts (family_id, debt_date DESC, created_at DESC);

-- 8. Composite index untuk activity logs audit trail
CREATE INDEX IF NOT EXISTS idx_activity_logs_perf
ON activity_logs (family_id, created_at DESC);

-- 9. Index untuk tabungan goals
CREATE INDEX IF NOT EXISTS idx_goals_perf
ON goals (family_id, created_at DESC);
