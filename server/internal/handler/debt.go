package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type DebtHandler struct {
	pool *pgxpool.Pool
}

func NewDebtHandler(pool *pgxpool.Pool) *DebtHandler {
	return &DebtHandler{pool: pool}
}

type DebtInput struct {
	DebtDate            string  `json:"debt_date"`
	Type                string  `json:"type"`
	Person              string  `json:"person"`
	Amount              float64 `json:"amount"`
	Notes               string  `json:"notes"`
	AttachmentURL       *string `json:"attachment_url"`
	Status              string  `json:"status"`
	IsInstallment       bool    `json:"is_installment"`
	InstallmentDueDate  *string `json:"installment_due_date"`
	InstallmentDuration *string `json:"installment_duration"`
	InstallmentTotal    float64 `json:"installment_total"`
	CreatedBy           string  `json:"created_by"`
}

type PayInstallmentInput struct {
	Amount    float64    `json:"amount"`
	Date      string     `json:"date"`
	WalletID  *uuid.UUID `json:"wallet_id"`
	Notes     string     `json:"notes"`
	CreatedBy string     `json:"created_by"`
}

func (h *DebtHandler) List(w http.ResponseWriter, r *http.Request) {
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

	rows, err := h.pool.Query(ctx, `
		SELECT 
			id, family_id, legacy_id, debt_date, type, person, amount,
			notes, attachment_url, status, is_installment, installment_due_date,
			installment_duration, installment_total, installment_paid, created_by,
			created_at, updated_at
		FROM debts
		WHERE family_id = $1
		ORDER BY debt_date DESC, created_at DESC
	`, familyID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rows.Close()

	var debts []models.Debt
	for rows.Next() {
		var d models.Debt
		var dDate time.Time
		if err := rows.Scan(
			&d.ID, &d.FamilyID, &d.LegacyID, &dDate, &d.Type, &d.Person,
			&d.Amount, &d.Notes, &d.AttachmentURL, &d.Status, &d.IsInstallment,
			&d.InstallmentDueDate, &d.InstallmentDuration, &d.InstallmentTotal,
			&d.InstallmentPaid, &d.CreatedBy, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		d.DebtDate = dDate.Format("2006-01-02")
		debts = append(debts, d)
	}

	if debts == nil {
		debts = []models.Debt{}
	}

	RespondJSON(w, http.StatusOK, debts)
}

func (h *DebtHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input DebtInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	if input.Person == "" || input.Amount <= 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Nama orang dan nominal wajib diisi")
		return
	}

	if input.DebtDate == "" {
		input.DebtDate = time.Now().Format("2006-01-02")
	}
	if input.Status == "" {
		input.Status = "Belum Lunas"
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
		INSERT INTO debts (
			family_id, debt_date, type, person, amount, notes, attachment_url,
			status, is_installment, installment_due_date, installment_duration,
			installment_total, created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id
	`, familyID, input.DebtDate, input.Type, input.Person, input.Amount, input.Notes,
		input.AttachmentURL, input.Status, input.IsInstallment, input.InstallmentDueDate,
		input.InstallmentDuration, input.InstallmentTotal, input.CreatedBy).Scan(&newID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INSERT_ERROR", err.Error())
		return
	}

	RespondSuccessMessage(w, http.StatusCreated, "Catatan utang piutang berhasil dibuat", map[string]interface{}{
		"id": newID,
	})
}

func (h *DebtHandler) PayInstallment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	debtIDStr := chi.URLParam(r, "id")
	debtID, err := uuid.Parse(debtIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_DEBT_ID", "ID utang tidak valid")
		return
	}

	var input PayInstallmentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	if input.Amount <= 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Nominal pembayaran cicilan harus lebih besar dari 0")
		return
	}

	if input.Date == "" {
		input.Date = time.Now().Format("2006-01-02")
	}

	tx, err := h.pool.Begin(ctx)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TX_ERROR", err.Error())
		return
	}
	defer tx.Rollback(ctx)

	var dType, person string
	var familyID uuid.UUID
	var instTotal, instPaid float64
	err = tx.QueryRow(ctx, `
		SELECT family_id, type, person, installment_total, installment_paid
		FROM debts
		WHERE id = $1
		FOR UPDATE
	`, debtID).Scan(&familyID, &dType, &person, &instTotal, &instPaid)

	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Data utang piutang tidak ditemukan")
		return
	}

	newPaid := instPaid + input.Amount
	newStatus := "Belum Lunas"
	if instTotal > 0 && newPaid >= instTotal {
		newStatus = "Lunas"
	}

	_, err = tx.Exec(ctx, `
		UPDATE debts
		SET installment_paid = $1, status = $2, updated_at = NOW()
		WHERE id = $3
	`, newPaid, newStatus, debtID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_ERROR", err.Error())
		return
	}

	txType := "Pengeluaran"
	if dType == "Piutang" {
		txType = "Pemasukan"
	}

	txNotes := "Bayar cicilan: " + person
	if input.Notes != "" {
		txNotes += " - " + input.Notes
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO transactions (
			family_id, tx_date, type, category_id, amount,
			wallet_source_id, source_device, notes, status, created_by
		)
		VALUES ($1, $2, $3, NULL, $4, $5, 'Web_App', $6, 'confirmed', $7)
	`, familyID, input.Date, txType, input.Amount, input.WalletID, txNotes, input.CreatedBy)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INSERT_TX_ERROR", err.Error())
		return
	}

	if err := tx.Commit(ctx); err != nil {
		RespondError(w, http.StatusInternalServerError, "COMMIT_ERROR", err.Error())
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Pembayaran cicilan berhasil dicatat", map[string]interface{}{
		"paid_amount":      input.Amount,
		"installment_paid": newPaid,
		"status":           newStatus,
	})
}

func (h *DebtHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	debtIDStr := chi.URLParam(r, "id")
	debtID, err := uuid.Parse(debtIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_DEBT_ID", "ID utang tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `DELETE FROM debts WHERE id = $1`, debtID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DELETE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Data utang tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Catatan utang berhasil dihapus", nil)
}
