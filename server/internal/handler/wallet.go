package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type WalletHandler struct {
	pool *pgxpool.Pool
}

func NewWalletHandler(pool *pgxpool.Pool) *WalletHandler {
	return &WalletHandler{pool: pool}
}

type WalletInput struct {
	WalletName     string  `json:"wallet_name"`
	InitialBalance float64 `json:"initial_balance"`
}

func (h *WalletHandler) List(w http.ResponseWriter, r *http.Request) {
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

	query := `
		SELECT 
			w.id, w.family_id, w.wallet_name, w.initial_balance,
			COALESCE(vb.current_balance, w.initial_balance) AS current_balance,
			w.created_at, w.updated_at
		FROM wallets w
		LEFT JOIN wallet_balances vb ON vb.wallet_id = w.id
		WHERE w.family_id = $1
		ORDER BY w.wallet_name ASC
	`

	rows, err := h.pool.Query(ctx, query, familyID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rows.Close()

	var wallets []models.Wallet
	for rows.Next() {
		var item models.Wallet
		if err := rows.Scan(
			&item.ID, &item.FamilyID, &item.WalletName, &item.InitialBalance,
			&item.CurrentBalance, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		wallets = append(wallets, item)
	}

	if wallets == nil {
		wallets = []models.Wallet{}
	}

	RespondJSON(w, http.StatusOK, wallets)
}

func (h *WalletHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input WalletInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	if input.WalletName == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Nama dompet wajib diisi")
		return
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

	var newID uuid.UUID
	err = h.pool.QueryRow(ctx, `
		INSERT INTO wallets (family_id, wallet_name, initial_balance)
		VALUES ($1, $2, $3)
		RETURNING id
	`, familyID, input.WalletName, input.InitialBalance).Scan(&newID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INSERT_ERROR", err.Error())
		return
	}

	RespondSuccessMessage(w, http.StatusCreated, "Dompet berhasil ditambahkan", map[string]interface{}{
		"id":              newID,
		"wallet_name":     input.WalletName,
		"initial_balance": input.InitialBalance,
	})
}

func (h *WalletHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	walletIDStr := chi.URLParam(r, "id")
	walletID, err := uuid.Parse(walletIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_WALLET_ID", "ID dompet tidak valid")
		return
	}

	var input WalletInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `
		UPDATE wallets 
		SET wallet_name = $1, initial_balance = $2
		WHERE id = $3
	`, input.WalletName, input.InitialBalance, walletID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Dompet tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Dompet berhasil diperbarui", nil)
}

func (h *WalletHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	walletIDStr := chi.URLParam(r, "id")
	walletID, err := uuid.Parse(walletIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_WALLET_ID", "ID dompet tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `DELETE FROM wallets WHERE id = $1`, walletID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DELETE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Dompet tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Dompet berhasil dihapus", nil)
}
