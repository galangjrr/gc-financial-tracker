package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type GoalHandler struct {
	pool *pgxpool.Pool
}

func NewGoalHandler(pool *pgxpool.Pool) *GoalHandler {
	return &GoalHandler{pool: pool}
}

type GoalInput struct {
	Name         string  `json:"name"`
	TargetAmount float64 `json:"target_amount"`
	Priority     string  `json:"priority"`
	SavedAmount  float64 `json:"saved_amount"`
	Icon         *string `json:"icon"`
}

func (h *GoalHandler) List(w http.ResponseWriter, r *http.Request) {
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
		SELECT id, family_id, legacy_id, name, target_amount, priority, saved_amount, icon, created_at, updated_at
		FROM goals
		WHERE family_id = $1
		ORDER BY created_at DESC
	`, familyID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rows.Close()

	var goals []models.Goal
	for rows.Next() {
		var g models.Goal
		if err := rows.Scan(
			&g.ID, &g.FamilyID, &g.LegacyID, &g.Name, &g.TargetAmount,
			&g.Priority, &g.SavedAmount, &g.Icon, &g.CreatedAt, &g.UpdatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		goals = append(goals, g)
	}

	if goals == nil {
		goals = []models.Goal{}
	}

	RespondJSON(w, http.StatusOK, goals)
}

func (h *GoalHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input GoalInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	if input.Name == "" || input.TargetAmount <= 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Nama dan target tabungan harus diisi dengan benar")
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
		INSERT INTO goals (family_id, name, target_amount, priority, saved_amount, icon)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, familyID, input.Name, input.TargetAmount, input.Priority, input.SavedAmount, input.Icon).Scan(&newID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INSERT_ERROR", err.Error())
		return
	}

	RespondSuccessMessage(w, http.StatusCreated, "Target tabungan berhasil dibuat", map[string]interface{}{
		"id": newID,
	})
}

func (h *GoalHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	goalIDStr := chi.URLParam(r, "id")
	goalID, err := uuid.Parse(goalIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_GOAL_ID", "ID target tidak valid")
		return
	}

	var input GoalInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `
		UPDATE goals
		SET name = $1, target_amount = $2, priority = $3, saved_amount = $4, icon = $5
		WHERE id = $6
	`, input.Name, input.TargetAmount, input.Priority, input.SavedAmount, input.Icon, goalID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Target tabungan tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Target tabungan berhasil diperbarui", nil)
}

func (h *GoalHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	goalIDStr := chi.URLParam(r, "id")
	goalID, err := uuid.Parse(goalIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_GOAL_ID", "ID target tidak valid")
		return
	}

	tag, err := h.pool.Exec(ctx, `DELETE FROM goals WHERE id = $1`, goalID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DELETE_ERROR", err.Error())
		return
	}

	if tag.RowsAffected() == 0 {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Target tabungan tidak ditemukan")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Target tabungan berhasil dihapus", nil)
}
