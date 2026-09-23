package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"gc-financial-tracker/server/internal/config"
	"gc-financial-tracker/server/internal/database"
	"gc-financial-tracker/server/internal/handler"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize database pool
	dbPool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Database connection failed (%v). Server will start in offline/mock mode until DATABASE_URL is set.\n", err)
	} else {
		defer dbPool.Close()
		log.Println("Connected to Supabase PostgreSQL successfully.")
	}

	r := chi.NewRouter()

	// Standard Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000", "*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		dbStatus := "disconnected"
		if dbPool != nil {
			if err := dbPool.Ping(r.Context()); err == nil {
				dbStatus = "connected"
			}
		}
		handler.RespondJSON(w, http.StatusOK, map[string]interface{}{
			"status":   "ok",
			"database": dbStatus,
			"service":  "gc-financial-tracker-golang",
			"time":     time.Now().Format(time.RFC3339),
		})
	})

	if dbPool != nil {
		walletHandler := handler.NewWalletHandler(dbPool)
		categoryHandler := handler.NewCategoryHandler(dbPool)
		txHandler := handler.NewTransactionHandler(dbPool)
		dashHandler := handler.NewDashboardHandler(dbPool)
		goalHandler := handler.NewGoalHandler(dbPool)
		debtHandler := handler.NewDebtHandler(dbPool)
		authHandler := handler.NewAuthHandler(dbPool)
		tgHandler := handler.NewTelegramHandler(dbPool, cfg)

		r.Route("/api", func(api chi.Router) {
			// Auth & Family
			api.Post("/auth/login", authHandler.Login)
			api.Get("/auth/members", authHandler.ListMembers)

			// Dashboard
			api.Get("/dashboard", dashHandler.GetSummary)

			// Wallets
			api.Route("/wallets", func(w chi.Router) {
				w.Get("/", walletHandler.List)
				w.Post("/", walletHandler.Create)
				w.Put("/{id}", walletHandler.Update)
				w.Delete("/{id}", walletHandler.Delete)
			})

			// Categories
			api.Route("/categories", func(w chi.Router) {
				w.Get("/", categoryHandler.List)
				w.Post("/", categoryHandler.Create)
				w.Put("/{id}", categoryHandler.Update)
				w.Delete("/{id}", categoryHandler.Delete)
			})

			// Transactions
			api.Route("/transactions", func(t chi.Router) {
				t.Get("/", txHandler.List)
				t.Post("/", txHandler.Create)
				t.Post("/transfer", txHandler.CreateTransfer)
				t.Delete("/{id}", txHandler.Delete)
			})

			// Goals
			api.Route("/goals", func(g chi.Router) {
				g.Get("/", goalHandler.List)
				g.Post("/", goalHandler.Create)
				g.Put("/{id}", goalHandler.Update)
				g.Delete("/{id}", goalHandler.Delete)
			})

			// Debts
			api.Route("/debts", func(d chi.Router) {
				d.Get("/", debtHandler.List)
				d.Post("/", debtHandler.Create)
				d.Post("/{id}/pay", debtHandler.PayInstallment)
				d.Delete("/{id}", debtHandler.Delete)
			})

			// Telegram Webhook
			api.Post("/webhook/telegram", tgHandler.HandleWebhook)
		})
	}

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Server Golang berjalan pada http://localhost:%s\n", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited cleanly.")
}
