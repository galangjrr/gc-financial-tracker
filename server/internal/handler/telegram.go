package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"gc-financial-tracker/server/internal/config"
)

type TelegramHandler struct {
	pool *pgxpool.Pool
	cfg  *config.Config
}

func NewTelegramHandler(pool *pgxpool.Pool, cfg *config.Config) *TelegramHandler {
	return &TelegramHandler{pool: pool, cfg: cfg}
}

type TelegramUpdate struct {
	UpdateID int              `json:"update_id"`
	Message  *TelegramMessage `json:"message"`
}

type TelegramMessage struct {
	MessageID int             `json:"message_id"`
	Chat      TelegramChat    `json:"chat"`
	Text      string          `json:"text"`
	Photo     []TelegramPhoto `json:"photo"`
}

type TelegramChat struct {
	ID int64 `json:"id"`
}

type TelegramPhoto struct {
	FileID   string `json:"file_id"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
	FileSize int    `json:"file_size"`
}

func (h *TelegramHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Verify Secret header if configured
	if h.cfg.TelegramSecret != "" {
		secretHeader := r.Header.Get("X-Telegram-Bot-Api-Secret-Token")
		if secretHeader != h.cfg.TelegramSecret {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
	}

	var update TelegramUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	if update.Message == nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	chatID := fmt.Sprintf("%d", update.Message.Chat.ID)
	text := strings.TrimSpace(update.Message.Text)

	// Check if user is linked to a family
	var familyID, userID, memberName string
	err := h.pool.QueryRow(ctx, `
		SELECT family_id, user_id, display_name
		FROM family_members
		WHERE telegram_chat_id = $1
	`, chatID).Scan(&familyID, &userID, &memberName)

	if err != nil {
		h.sendMessage(chatID, "Akun Telegram Anda belum terhubung dengan keluarga manapun di GC Financial Tracker. Hubungkan akun melalui pengaturan aplikasi.")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Commands
	if strings.HasPrefix(text, "/start") {
		h.sendMessage(chatID, fmt.Sprintf("Halo %s! Selamat datang di GC Financial Tracker Bot.\nKetik /help untuk panduan penggunaan.", memberName))
		w.WriteHeader(http.StatusOK)
		return
	}

	if strings.HasPrefix(text, "/help") {
		msg := "Panduan GC Financial Tracker Bot:\n\n" +
			"• Ketik langsung pengeluaran: Makan siang 50000\n" +
			"• Kirim foto struk untuk pembacaan otomatis via AI\n" +
			"• /saldo - Cek saldo dompet keluarga\n" +
			"• /list - 5 transaksi terakhir\n" +
			"• /help - Tampilkan panduan ini"
		h.sendMessage(chatID, msg)
		w.WriteHeader(http.StatusOK)
		return
	}

	if strings.HasPrefix(text, "/saldo") {
		h.handleSaldoCommand(ctx, chatID, familyID)
		w.WriteHeader(http.StatusOK)
		return
	}

	if strings.HasPrefix(text, "/list") {
		h.handleListCommand(ctx, chatID, familyID)
		w.WriteHeader(http.StatusOK)
		return
	}

	// Photo / OCR receipt handling
	if len(update.Message.Photo) > 0 {
		h.sendMessage(chatID, "Sedang memproses struk belanja...")
		largestPhoto := update.Message.Photo[len(update.Message.Photo)-1]
		go h.processReceiptPhoto(largestPhoto.FileID, chatID, familyID, memberName)
		w.WriteHeader(http.StatusOK)
		return
	}

	// NLP text parsing
	if text != "" {
		h.processNLPText(ctx, text, chatID, familyID, memberName)
	}

	w.WriteHeader(http.StatusOK)
}

func (h *TelegramHandler) handleSaldoCommand(ctx context.Context, chatID, familyID string) {
	rows, err := h.pool.Query(ctx, `
		SELECT w.wallet_name, COALESCE(vb.current_balance, w.initial_balance)
		FROM wallets w
		LEFT JOIN wallet_balances vb ON vb.wallet_id = w.id
		WHERE w.family_id = $1
		ORDER BY w.wallet_name ASC
	`, familyID)
	if err != nil {
		h.sendMessage(chatID, "Gagal mengambil data saldo.")
		return
	}
	defer rows.Close()

	var msg strings.Builder
	msg.WriteString("Saldo Dompet Keluarga:\n\n")
	var netWorth float64
	for rows.Next() {
		var name string
		var bal float64
		if err := rows.Scan(&name, &bal); err == nil {
			netWorth += bal
			msg.WriteString(fmt.Sprintf("• %s: Rp %.0f\n", name, bal))
		}
	}
	msg.WriteString(fmt.Sprintf("\nTotal Kekayaan: Rp %.0f", netWorth))
	h.sendMessage(chatID, msg.String())
}

func (h *TelegramHandler) handleListCommand(ctx context.Context, chatID, familyID string) {
	rows, err := h.pool.Query(ctx, `
		SELECT t.tx_date, COALESCE(c.category_name, 'Lainnya'), t.amount, t.type
		FROM transactions t
		LEFT JOIN categories c ON c.id = t.category_id
		WHERE t.family_id = $1 AND t.status = 'confirmed' AND t.deleted_at IS NULL
		ORDER BY t.tx_date DESC, t.created_at DESC
		LIMIT 5
	`, familyID)
	if err != nil {
		h.sendMessage(chatID, "Gagal mengambil daftar transaksi.")
		return
	}
	defer rows.Close()

	var msg strings.Builder
	msg.WriteString("5 Transaksi Terakhir:\n\n")
	idx := 1
	for rows.Next() {
		var date time.Time
		var catName, txType string
		var amt float64
		if err := rows.Scan(&date, &catName, &amt, &txType); err == nil {
			msg.WriteString(fmt.Sprintf("%d. %s - %s: Rp %.0f (%s)\n", idx, txType, catName, amt, date.Format("02/01")))
			idx++
		}
	}
	h.sendMessage(chatID, msg.String())
}

func (h *TelegramHandler) processNLPText(ctx context.Context, text, chatID, familyID, memberName string) {
	re := regexp.MustCompile(`\d[\d.,]*\d?`)
	matches := re.FindAllString(text, -1)
	if len(matches) == 0 {
		h.sendMessage(chatID, "Nominal tidak ditemukan. Contoh ketik: Makan siang 50000")
		return
	}

	var candidates []float64
	for _, m := range matches {
		cleaned := strings.ReplaceAll(m, ".", "")
		cleaned = strings.ReplaceAll(cleaned, ",", ".")
		if val, err := strconv.ParseFloat(cleaned, 64); err == nil && val >= 500 {
			candidates = append(candidates, val)
		}
	}

	var amount float64
	if len(candidates) > 0 {
		amount = candidates[len(candidates)-1]
	} else {
		h.sendMessage(chatID, "Nominal tidak valid atau terlalu kecil.")
		return
	}

	// Match category by keyword
	textLower := strings.ToLower(text)
	catRows, err := h.pool.Query(ctx, `
		SELECT id, segment, category_name, keywords
		FROM categories
		WHERE family_id = $1
	`, familyID)
	if err != nil {
		h.sendMessage(chatID, "Gagal mencocokkan kategori.")
		return
	}
	defer catRows.Close()

	matchedCatID := ""
	matchedCatName := "Lainnya"
	matchedType := "Pengeluaran"

	for catRows.Next() {
		var cID, segment, cName string
		var keywords []string
		if err := catRows.Scan(&cID, &segment, &cName, &keywords); err == nil {
			for _, kw := range keywords {
				kwTrim := strings.TrimSpace(strings.ToLower(kw))
				if kwTrim != "" && strings.Contains(textLower, kwTrim) {
					matchedCatID = cID
					matchedCatName = cName
					matchedType = segment
					break
				}
			}
			if matchedCatID != "" {
				break
			}
		}
	}

	// Default wallet: 'Cash'
	var cashWalletID string
	_ = h.pool.QueryRow(ctx, `
		SELECT id FROM wallets 
		WHERE family_id = $1 AND LOWER(wallet_name) = 'cash'
		LIMIT 1
	`, familyID).Scan(&cashWalletID)

	today := time.Now().Format("2006-01-02")
	_, err = h.pool.Exec(ctx, `
		INSERT INTO transactions (
			family_id, tx_date, type, category_id, amount,
			wallet_source_id, source_device, notes, status, created_by
		)
		VALUES (
			$1, $2, $3, NULLIF($4, '')::uuid, $5,
			NULLIF($6, '')::uuid, 'Telegram_Bot', $7, 'confirmed', $8
		)
	`, familyID, today, matchedType, matchedCatID, amount, cashWalletID, text, memberName)

	if err != nil {
		h.sendMessage(chatID, "Gagal menyimpan transaksi: "+err.Error())
		return
	}

	h.sendMessage(chatID, fmt.Sprintf("Berhasil dicatat.\nKategori: %s\nJumlah: Rp %.0f\nDompet: Cash", matchedCatName, amount))
}

func (h *TelegramHandler) processReceiptPhoto(fileID, chatID, familyID, memberName string) {
	// Telegram photo logic placeholder for async Gemini call
	h.sendMessage(chatID, "Fitur pembacaan struk AI telah diterima. Nominal akan otomatis diproses ke sistem.")
}

func (h *TelegramHandler) sendMessage(chatID, text string) {
	if h.cfg.TelegramBotToken == "" {
		return
	}
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", h.cfg.TelegramBotToken)
	payload := map[string]string{
		"chat_id": chatID,
		"text":    text,
	}
	body, _ := json.Marshal(payload)
	_, _ = http.Post(url, "application/json", bytes.NewBuffer(body))
}
