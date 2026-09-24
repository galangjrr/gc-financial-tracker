package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"gc-financial-tracker/server/internal/models"
)

func NowWIB() time.Time {
	loc := time.FixedZone("WIB", 7*3600)
	return time.Now().In(loc)
}

func RespondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(models.APIResponse{
		Success: true,
		Data:    data,
	})
}

func RespondSuccessMessage(w http.ResponseWriter, status int, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(models.APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func RespondError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(models.APIResponse{
		Success: false,
		Error: &models.APIError{
			Code:    code,
			Message: message,
		},
	})
}
