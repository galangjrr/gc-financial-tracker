package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type TransactionHandler struct {
	pool *pgxpool.Pool
}

func NewTransactionHandler(pool *pgxpool.Pool) *TransactionHandler {
	return &TransactionHandler{pool: pool}
}

type TransactionInput struct {
	TxDate         string     `json:"tx_date"`
	Type           string     `json:"type"`
	CategoryID     *uuid.UUID `json:"category_id"`
	Amount         float64    `json:"amount"`
	WalletSourceID *uuid.UUID `json:"wallet_source_id"`
	WalletDestID   *uuid.UUID `json:"wallet_dest_id"`
	Notes          string     `json:"notes"`
	CreatedBy      string     `json:"created_by"`
}

type TransferInput struct {
	TxDate           string    `json:"tx_date"`
	Amount           float64   `json:"amount"`
	WalletSourceID   uuid.UUID `json:"wallet_source_id"`
	WalletDestID     uuid.UUID `json:"wallet_dest_id"`
	Notes            string    `json:"notes"`
	CreatedBy        string    `json:"created_by"`
}

func (h *TransactionHandler) List(w http.ResponseWriter, r *http.Request) {
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

	filterType := r.URL.Query().Get("type")
	filterWallet := r.URL.Query().Get("wallet_id")
	filterMonth := r.URL.Query().Get("month") // YYYY-MM
	filterSearch := r.URL.Query().Get("search")

	query := `
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
		WHERE t.family_id = $1 AND t.status != 'void' AND t.status != 'Deleted'
	`

	args := []interface{}{familyID}
	argIdx := 2

	if filterType != "" && filterType != "Semua Tipe" {
		query += fmt.Sprintf(" AND t.type = $%d", argIdx)
		args = append(args, filterType)
		argIdx++
	}

	if filterWallet != "" {
		query += fmt.Sprintf(" AND (t.wallet_source_id = $%d OR t.wallet_dest_id = $%d)", argIdx, argIdx)
		args = append(args, filterWallet)
		argIdx++
	}

	if filterMonth != "" {
		query += fmt.Sprintf(" AND TO_CHAR(t.tx_date, 'YYYY-MM') = $%d", argIdx)
		args = append(args, filterMonth)
		argIdx++
	}

	if filterSearch != "" {
		searchPattern := "%" + strings.ToLower(filterSearch) + "%"
		query += fmt.Sprintf(" AND (LOWER(t.notes) LIKE $%d OR LOWER(c.category_name) LIKE $%d)", argIdx, argIdx)
		args = append(args, searchPattern)
		argIdx++
	}

	query += " ORDER BY t.tx_date DESC, t.created_at DESC LIMIT 500"

	rows, err := h.pool.Query(ctx, query, args...)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rows.Close()

	var txs []models.Transaction
	for rows.Next() {
		var item models.Transaction
		var txDate time.Time
		if err := rows.Scan(
			&item.ID, &item.FamilyID, &txDate, &item.Type, &item.CategoryID,
			&item.CategoryName, &item.Amount, &item.WalletSourceID,
			&item.WalletSourceName, &item.WalletDestID, &item.WalletDestName,
			&item.SourceDevice, &item.Notes, &item.Status, &item.CreatedBy,
			&item.LegacyID, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		item.TxDate = txDate.Format("2006-01-02")
		txs = append(txs, item)
	}

	if txs == nil {
		txs = []models.Transaction{}
	}

	RespondJSON(w, http.StatusOK, txs)
}

func (h *TransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input TransactionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	if input.Amount <= 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Nominal transaksi harus lebih besar dari 0")
		return
	}

	if input.TxDate == "" {
		input.TxDate = time.Now().Format("2006-01-02")
	}

	familyIDStr := r.URL.Query().Get("family_id")
	if familyIDStr == "" {
		familyIDStr = "00000000-0000-0000-0000-000000000001"
	}
	familyID, err := uuid.Parse(familyIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_FAMILY_ID", "Format family_id tidak valid")
		return
	}

	var createdByUUID *uuid.UUID
	if input.CreatedBy != "" {
		if uid, err := uuid.Parse(input.CreatedBy); err == nil {
			createdByUUID = &uid
		}
	}

	var newID uuid.UUID
	err = h.pool.QueryRow(ctx, `
		INSERT INTO transactions (
			family_id, tx_date, type, category_id, amount,
			wallet_source_id, wallet_dest_id, source_device, notes, status, created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'Web_App', $8, 'confirmed', $9)
		RETURNING id
	`, familyID, input.TxDate, input.Type, input.CategoryID, input.Amount,
		input.WalletSourceID, input.WalletDestID, input.Notes, createdByUUID).Scan(&newID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INSERT_ERROR", err.Error())
		return
	}

	RespondSuccessMessage(w, http.StatusCreated, "Transaksi berhasil disimpan", map[string]interface{}{
		"id": newID,
	})
}

func (h *TransactionHandler) CreateTransfer(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input TransferInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	if input.Amount <= 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Nominal transfer harus lebih besar dari 0")
		return
	}

	if input.WalletSourceID == input.WalletDestID {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Dompet asal dan tujuan tidak boleh sama")
		return
	}

	if input.TxDate == "" {
		input.TxDate = time.Now().Format("2006-01-02")
	}

	familyIDStr := r.URL.Query().Get("family_id")
	if familyIDStr == "" {
		familyIDStr = "00000000-0000-0000-0000-000000000001"
	}
	familyID, err := uuid.Parse(familyIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_FAMILY_ID", "Format family_id tidak valid")
		return
	}

	var createdByUUID *uuid.UUID
	if input.CreatedBy != "" {
		if uid, err := uuid.Parse(input.CreatedBy); err == nil {
			createdByUUID = &uid
		}
	}

	var newID uuid.UUID
	err = h.pool.QueryRow(ctx, `
		INSERT INTO transactions (
			family_id, tx_date, type, category_id, amount,
			wallet_source_id, wallet_dest_id, source_device, notes, status, created_by
		)
		VALUES ($1, $2, 'Transfer', NULL, $3, $4, $5, 'Web_App', $6, 'confirmed', $7)
		RETURNING id
	`, familyID, input.TxDate, input.Amount, input.WalletSourceID, input.WalletDestID, input.Notes, createdByUUID).Scan(&newID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INSERT_ERROR", err.Error())
		return
	}

	RespondSuccessMessage(w, http.StatusCreated, "Transfer antar dompet berhasil dicatat", map[string]interface{}{
		"id": newID,
	})
}

func (h *TransactionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	txIDStr := chi.URLParam(r, "id")
	txID, err := uuid.Parse(txIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_TRANSACTION_ID", "ID transaksi tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `
		UPDATE transactions 
		SET status = 'void', deleted_at = NOW()
		WHERE id = $1
	`, txID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DELETE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Transaksi tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Transaksi berhasil dihapus", nil)
}
