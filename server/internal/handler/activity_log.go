package handler

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type ActivityLogHandler struct {
	pool *pgxpool.Pool
}

func NewActivityLogHandler(pool *pgxpool.Pool) *ActivityLogHandler {
	return &ActivityLogHandler{pool: pool}
}

func (h *ActivityLogHandler) List(w http.ResponseWriter, r *http.Request) {
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

	filterAction := r.URL.Query().Get("action_type")

	query := `
		SELECT id, family_id, action_type, actor_name, title, details, amount, source_device, created_at
		FROM activity_logs
		WHERE family_id = $1
	`
	args := []interface{}{familyID}

	if filterAction != "" && filterAction != "Semua" {
		query += " AND action_type = $2"
		args = append(args, filterAction)
	}

	query += " ORDER BY created_at DESC LIMIT 100"

	rows, err := h.pool.Query(ctx, query, args...)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rows.Close()

	var logs []models.ActivityLog
	for rows.Next() {
		var log models.ActivityLog
		if err := rows.Scan(
			&log.ID, &log.FamilyID, &log.ActionType, &log.ActorName,
			&log.Title, &log.Details, &log.Amount, &log.SourceDevice, &log.CreatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		logs = append(logs, log)
	}

	if logs == nil {
		logs = []models.ActivityLog{}
	}

	RespondJSON(w, http.StatusOK, logs)
}
