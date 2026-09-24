-- Migration: Activity Logs Table for Realtime Log Tracker

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('transaction_created', 'transfer_created', 'transaction_deleted', 'wallet_created', 'debt_created', 'goal_created')),
  actor_name TEXT NOT NULL DEFAULT 'Keluarga',
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  amount NUMERIC(14,2) DEFAULT 0,
  source_device TEXT NOT NULL DEFAULT 'Web_App',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_family_id ON activity_logs(family_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow family members to read activity logs" ON activity_logs
  FOR SELECT USING (true);
CREATE POLICY "Allow family members to insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Backfill initial activity logs from existing transactions
INSERT INTO activity_logs (family_id, action_type, actor_name, title, details, amount, source_device, created_at)
SELECT 
  t.family_id,
  CASE 
    WHEN t.type = 'Transfer' THEN 'transfer_created'
    ELSE 'transaction_created'
  END,
  COALESCE(fm.display_name, 'Keluarga'),
  CASE 
    WHEN t.type = 'Transfer' THEN 'Transfer Saldo Antar Dompet'
    ELSE 'Catat ' || t.type
  END,
  COALESCE(c.category_name, 'Lainnya') || ' via ' || COALESCE(ws.wallet_name, 'Cash') || CASE WHEN t.notes != '' THEN ' (' || t.notes || ')' ELSE '' END,
  t.amount,
  COALESCE(t.source_device, 'Web_App'),
  t.created_at
FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
LEFT JOIN wallets ws ON ws.id = t.wallet_source_id
LEFT JOIN family_members fm ON fm.user_id = t.created_by
WHERE t.status = 'confirmed' AND t.deleted_at IS NULL
ORDER BY t.created_at DESC
LIMIT 50
ON CONFLICT DO NOTHING;
