package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type CategoryHandler struct {
	pool *pgxpool.Pool
}

func NewCategoryHandler(pool *pgxpool.Pool) *CategoryHandler {
	return &CategoryHandler{pool: pool}
}

type CategoryInput struct {
	Segment               string   `json:"segment"`
	CategoryName          string   `json:"category_name"`
	BudgetTarget          float64  `json:"budget_target"`
	TotalTargetCumulative float64  `json:"total_target_cumulative"`
	TargetFrequency       string   `json:"target_frequency"`
	Keywords              []string `json:"keywords"`
	Icon                  *string  `json:"icon"`
}

func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
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
			id, family_id, segment, category_name, budget_target,
			COALESCE(total_target_cumulative, 0),
			COALESCE(target_frequency, 'Bulanan'),
			COALESCE(keywords, '{}'),
			icon, created_at, updated_at
		FROM categories
		WHERE family_id = $1
		ORDER BY segment ASC, category_name ASC
	`

	rows, err := h.pool.Query(ctx, query, familyID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rows.Close()

	grouped := make(map[string][]models.Category)
	for rows.Next() {
		var item models.Category
		if err := rows.Scan(
			&item.ID, &item.FamilyID, &item.Segment, &item.CategoryName,
			&item.BudgetTarget, &item.TotalTargetCumulative, &item.TargetFrequency,
			&item.Keywords, &item.Icon, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		grouped[item.Segment] = append(grouped[item.Segment], item)
	}

	RespondJSON(w, http.StatusOK, grouped)
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input CategoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	if input.Segment == "" || input.CategoryName == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Segmen dan nama kategori wajib diisi")
		return
	}

	if input.TargetFrequency == "" {
		input.TargetFrequency = "Bulanan"
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
		INSERT INTO categories (
			family_id, segment, category_name, budget_target, 
			total_target_cumulative, target_frequency, keywords, icon
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`, familyID, input.Segment, input.CategoryName, input.BudgetTarget,
		input.TotalTargetCumulative, input.TargetFrequency, input.Keywords, input.Icon).Scan(&newID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INSERT_ERROR", err.Error())
		return
	}

	RespondSuccessMessage(w, http.StatusCreated, "Kategori berhasil ditambahkan", map[string]interface{}{
		"id": newID,
	})
}

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	catIDStr := chi.URLParam(r, "id")
	catID, err := uuid.Parse(catIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_CATEGORY_ID", "ID kategori tidak valid")
		return
	}

	var input CategoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `
		UPDATE categories 
		SET segment = $1, category_name = $2, budget_target = $3,
		    total_target_cumulative = $4, target_frequency = $5,
		    keywords = $6, icon = $7
		WHERE id = $8
	`, input.Segment, input.CategoryName, input.BudgetTarget,
		input.TotalTargetCumulative, input.TargetFrequency, input.Keywords, input.Icon, catID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Kategori tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Kategori berhasil diperbarui", nil)
}

func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	catIDStr := chi.URLParam(r, "id")
	catID, err := uuid.Parse(catIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_CATEGORY_ID", "ID kategori tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `DELETE FROM categories WHERE id = $1`, catID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DELETE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Kategori tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Kategori berhasil dihapus", nil)
}
