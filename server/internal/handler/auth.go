package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/models"
)

type AuthHandler struct {
	pool *pgxpool.Pool
}

func NewAuthHandler(pool *pgxpool.Pool) *AuthHandler {
	return &AuthHandler{pool: pool}
}

type LoginInput struct {
	Name string `json:"name"`
	PIN  string `json:"pin"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid")
		return
	}

	name := strings.TrimSpace(input.Name)
	pin := strings.TrimSpace(input.PIN)

	if name == "" || pin == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Nama dan PIN wajib diisi")
		return
	}

	var member models.FamilyMember
	err := h.pool.QueryRow(ctx, `
		SELECT id, family_id, user_id, display_name, role, telegram_chat_id, created_at, updated_at
		FROM family_members
		WHERE LOWER(display_name) = LOWER($1) AND pin = $2
	`, name, pin).Scan(
		&member.ID, &member.FamilyID, &member.UserID, &member.DisplayName,
		&member.Role, &member.TelegramChatID, &member.CreatedAt, &member.UpdatedAt,
	)

	if err != nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_FAILED", "Nama atau PIN salah")
		return
	}

	RespondSuccessMessage(w, http.StatusOK, "Login berhasil", member)
}

func (h *AuthHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	familyIDStr := r.URL.Query().Get("family_id")
	if familyIDStr == "" {
		familyIDStr = "00000000-0000-0000-0000-000000000001"
	}

	rows, err := h.pool.Query(ctx, `
		SELECT id, family_id, user_id, display_name, role, telegram_chat_id, created_at, updated_at
		FROM family_members
		WHERE family_id = $1
		ORDER BY role ASC, display_name ASC
	`, familyIDStr)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}
	defer rows.Close()

	var members []models.FamilyMember
	for rows.Next() {
		var m models.FamilyMember
		if err := rows.Scan(
			&m.ID, &m.FamilyID, &m.UserID, &m.DisplayName, &m.Role,
			&m.TelegramChatID, &m.CreatedAt, &m.UpdatedAt,
		); err != nil {
			RespondError(w, http.StatusInternalServerError, "SCAN_ERROR", err.Error())
			return
		}
		members = append(members, m)
	}

	if members == nil {
		members = []models.FamilyMember{}
	}

	RespondJSON(w, http.StatusOK, members)
}
