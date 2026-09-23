package handler

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type DashboardHandler struct {
	pool *pgxpool.Pool
}

func NewDashboardHandler(pool *pgxpool.Pool) *DashboardHandler {
	return &DashboardHandler{pool: pool}
}

func (h *DashboardHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	familyIDStr := r.URL.Query().Get("family_id")
	if familyIDStr == "" {
		familyIDStr = "00000000-0000-0000-0000-000000000001"
	}
	familyID, err := uuid.Parse(familyIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_FAMILY_ID", "Format family_id tidak valid")
		return
	}

	now := time.Now()
	currentMonth := now.Format("2006-01")
	monthLabel := now.Format("January 2006")

	// 1. Wallets and Net Worth
	walletQuery := `
		SELECT 
			w.id, w.family_id, w.wallet_name, w.initial_balance,
			COALESCE(vb.current_balance, w.initial_balance) AS current_balance,
			w.created_at, w.updated_at
		FROM wallets w
		LEFT JOIN wallet_balances vb ON vb.wallet_id = w.id
		WHERE w.family_id = $1
		ORDER BY w.wallet_name ASC
	`
	wRows, err := h.pool.Query(ctx, walletQuery, familyID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer wRows.Close()

	var wallets []models.Wallet
	var netWorth float64
	for wRows.Next() {
		var item models.Wallet
		if err := wRows.Scan(
			&item.ID, &item.FamilyID, &item.WalletName, &item.InitialBalance,
			&item.CurrentBalance, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		netWorth += item.CurrentBalance
		wallets = append(wallets, item)
	}
	if wallets == nil {
		wallets = []models.Wallet{}
	}

	// 2. Current Month Totals
	kpiQuery := `
		SELECT 
			type,
			COALESCE(SUM(amount), 0) AS total_amount
		FROM transactions
		WHERE family_id = $1 
		  AND status = 'confirmed' 
		  AND deleted_at IS NULL
		  AND TO_CHAR(tx_date, 'YYYY-MM') = $2
		GROUP BY type
	`
	kpiRows, err := h.pool.Query(ctx, kpiQuery, familyID, currentMonth)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer kpiRows.Close()

	var totalIncome, totalExpense, totalSavings float64
	for kpiRows.Next() {
		var txType string
		var amt float64
		if err := kpiRows.Scan(&txType, &amt); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		switch txType {
		case "Pemasukan":
			totalIncome += amt
		case "Pengeluaran", "Tagihan", "Liabilitas":
			totalExpense += amt
		case "Tabungan":
			totalSavings += amt
		}
	}

	var savingsRatio float64
	savingsStatus := "idle"
	if totalIncome > 0 {
		savingsRatio = ((totalIncome - totalExpense) / totalIncome) * 100
		if totalIncome >= totalExpense {
			savingsStatus = "surplus"
		} else {
			savingsStatus = "deficit"
		}
	} else if totalExpense > 0 {
		savingsStatus = "no_income"
	}

	// 3. Category Spend Breakdown
	catSpendQuery := `
		SELECT 
			COALESCE(c.category_name, 'Lainnya') AS cat_name,
			SUM(t.amount) AS total_spent
		FROM transactions t
		LEFT JOIN categories c ON c.id = t.category_id
		WHERE t.family_id = $1 
		  AND t.status = 'confirmed' 
		  AND t.deleted_at IS NULL
		  AND t.type IN ('Pengeluaran', 'Tagihan', 'Liabilitas')
		  AND TO_CHAR(t.tx_date, 'YYYY-MM') = $2
		GROUP BY c.category_name
		ORDER BY total_spent DESC
	`
	cRows, err := h.pool.Query(ctx, catSpendQuery, familyID, currentMonth)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer cRows.Close()

	catSpend := make(map[string]float64)
	for cRows.Next() {
		var name string
		var spent float64
		if err := cRows.Scan(&name, &spent); err == nil {
			catSpend[name] = spent
		}
	}

	// 4. Recent Transactions (last 10)
	recentQuery := `
		SELECT 
			t.id, t.family_id, t.tx_date, t.type, t.category_id,
			COALESCE(c.category_name, 'Lainnya') AS category_name,
			t.amount, t.wallet_source_id,
			COALESCE(ws.wallet_name, '') AS wallet_source_name,
			t.wallet_dest_id,
			COALESCE(wd.wallet_name, '') AS wallet_dest_name,
			t.source_device, t.notes, t.status,
			COALESCE(t.created_by::text, '') AS created_by,
			t.legacy_id,
			t.created_at, t.updated_at
		FROM transactions t
		LEFT JOIN categories c ON c.id = t.category_id
		LEFT JOIN wallets ws ON ws.id = t.wallet_source_id
		LEFT JOIN wallets wd ON wd.id = t.wallet_dest_id
		WHERE t.family_id = $1 AND t.status = 'confirmed' AND t.deleted_at IS NULL
		ORDER BY t.tx_date DESC, t.created_at DESC
		LIMIT 10
	`
	rRows, err := h.pool.Query(ctx, recentQuery, familyID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rRows.Close()

	var recentTxs []models.Transaction
	for rRows.Next() {
		var item models.Transaction
		var txDate time.Time
		if err := rRows.Scan(
			&item.ID, &item.FamilyID, &txDate, &item.Type, &item.CategoryID,
			&item.CategoryName, &item.Amount, &item.WalletSourceID,
			&item.WalletSourceName, &item.WalletDestID, &item.WalletDestName,
			&item.SourceDevice, &item.Notes, &item.Status, &item.CreatedBy,
			&item.LegacyID, &item.CreatedAt, &item.UpdatedAt,
		); err == nil {
			item.TxDate = txDate.Format("2006-01-02")
			recentTxs = append(recentTxs, item)
		}
	}
	if recentTxs == nil {
		recentTxs = []models.Transaction{}
	}

	summary := models.DashboardSummary{
		NetWorth:           netWorth,
		TotalIncome:        totalIncome,
		TotalExpense:       totalExpense,
		TotalSavings:       totalSavings,
		SavingsRatio:       savingsRatio,
		SavingsStatus:      savingsStatus,
		MonthLabel:         monthLabel,
		Wallets:            wallets,
		RecentTransactions: recentTxs,
		CategorySpend:      catSpend,
	}

	RespondJSON(w, http.StatusOK, summary)
}
