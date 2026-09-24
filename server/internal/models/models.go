package models

import (
	"time"

	"github.com/google/uuid"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

type APIError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

type Family struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	OwnerID     uuid.UUID `json:"owner_id"`
	AccountType string    `json:"account_type"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type FamilyMember struct {
	ID             uuid.UUID `json:"id"`
	FamilyID       uuid.UUID `json:"family_id"`
	UserID         uuid.UUID `json:"user_id"`
	DisplayName    string    `json:"display_name"`
	Role           string    `json:"role"`
	PIN            string    `json:"pin,omitempty"`
	TelegramChatID *string   `json:"telegram_chat_id,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Wallet struct {
	ID             uuid.UUID `json:"id"`
	FamilyID       uuid.UUID `json:"family_id"`
	WalletName     string    `json:"wallet_name"`
	InitialBalance float64   `json:"initial_balance"`
	CurrentBalance float64   `json:"current_balance"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Category struct {
	ID                    uuid.UUID `json:"id"`
	FamilyID              uuid.UUID `json:"family_id"`
	Segment               string    `json:"segment"`
	CategoryName          string    `json:"category_name"`
	BudgetTarget          float64   `json:"budget_target"`
	TotalTargetCumulative float64   `json:"total_target_cumulative"`
	TargetFrequency       string    `json:"target_frequency"`
	Keywords              []string  `json:"keywords"`
	Icon                  *string   `json:"icon,omitempty"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

type Transaction struct {
	ID               uuid.UUID  `json:"id"`
	FamilyID         uuid.UUID  `json:"family_id"`
	TxDate           string     `json:"tx_date"`
	Type             string     `json:"type"`
	CategoryID       *uuid.UUID `json:"category_id,omitempty"`
	CategoryName     string     `json:"category_name,omitempty"`
	Amount           float64    `json:"amount"`
	WalletSourceID   *uuid.UUID `json:"wallet_source_id,omitempty"`
	WalletSourceName string     `json:"wallet_source_name,omitempty"`
	WalletDestID     *uuid.UUID `json:"wallet_dest_id,omitempty"`
	WalletDestName   string     `json:"wallet_dest_name,omitempty"`
	SourceDevice     string     `json:"source_device"`
	Notes            string     `json:"notes"`
	Status           string     `json:"status"`
	CreatedBy        string     `json:"created_by"`
	LegacyID         *string    `json:"legacy_id,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type Goal struct {
	ID           uuid.UUID `json:"id"`
	FamilyID     uuid.UUID `json:"family_id"`
	LegacyID     *string   `json:"legacy_id,omitempty"`
	Name         string    `json:"name"`
	TargetAmount float64   `json:"target_amount"`
	Priority     string    `json:"priority"`
	SavedAmount  float64   `json:"saved_amount"`
	Icon         *string   `json:"icon,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Debt struct {
	ID                  uuid.UUID `json:"id"`
	FamilyID            uuid.UUID `json:"family_id"`
	LegacyID            *string   `json:"legacy_id,omitempty"`
	DebtDate            string    `json:"debt_date"`
	Type                string    `json:"type"`
	Person              string    `json:"person"`
	Amount              float64   `json:"amount"`
	Notes               string    `json:"notes"`
	AttachmentURL       *string   `json:"attachment_url,omitempty"`
	Status              string    `json:"status"`
	IsInstallment       bool      `json:"is_installment"`
	InstallmentDueDate  *string   `json:"installment_due_date,omitempty"`
	InstallmentDuration *string   `json:"installment_duration,omitempty"`
	InstallmentTotal    float64   `json:"installment_total"`
	InstallmentPaid     float64   `json:"installment_paid"`
	CreatedBy           string    `json:"created_by"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type DashboardSummary struct {
	NetWorth           float64                `json:"net_worth"`
	TotalIncome        float64                `json:"total_income"`
	TotalExpense       float64                `json:"total_expense"`
	TotalSavings       float64                `json:"total_savings"`
	SavingsRatio       float64                `json:"savings_ratio"`
	SavingsStatus      string                 `json:"savings_status"`
	MonthLabel         string                 `json:"month_label"`
	Wallets            []Wallet               `json:"wallets"`
	RecentTransactions []Transaction          `json:"recent_transactions"`
	Goals              []Goal                 `json:"goals"`
	Debts              []Debt                 `json:"debts"`
	CategorySpend      map[string]float64     `json:"category_spend"`
}

type ActivityLog struct {
	ID           uuid.UUID `json:"id"`
	FamilyID     uuid.UUID `json:"family_id"`
	ActionType   string    `json:"action_type"`
	ActorName    string    `json:"actor_name"`
	Title        string    `json:"title"`
	Details      string    `json:"details"`
	Amount       float64   `json:"amount"`
	SourceDevice string    `json:"source_device"`
	CreatedAt    time.Time `json:"created_at"`
}
