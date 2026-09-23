package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DatabaseURL        string
	SupabaseURL        string
	SupabaseAnonKey    string
	SupabaseServiceKey string
	GeminiAPIKey       string
	TelegramBotToken   string
	TelegramSecret     string
}

func Load() *Config {
	_ = godotenv.Load()
	_ = godotenv.Load("../.env.local")
	_ = godotenv.Load("../.env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		Port:               port,
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		SupabaseURL:        os.Getenv("NEXT_PUBLIC_SUPABASE_URL"),
		SupabaseAnonKey:    os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
		SupabaseServiceKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		GeminiAPIKey:       os.Getenv("GEMINI_API_KEY"),
		TelegramBotToken:   os.Getenv("TELEGRAM_BOT_TOKEN"),
		TelegramSecret:     os.Getenv("TELEGRAM_SECRET"),
	}
}
