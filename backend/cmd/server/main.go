package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/devslashrichie/resumero/internal/domain/resume"
	"github.com/devslashrichie/resumero/internal/domain/user"
	"github.com/devslashrichie/resumero/internal/external/gemini"
	"github.com/devslashrichie/resumero/internal/http"
	"github.com/devslashrichie/resumero/internal/repository/postgres"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	conn, err := pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))

	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database %v\n", err)
	}
	defer conn.Close(context.Background())

	userRepo := postgres.NewUserRepository(conn)
	userService := user.NewService(userRepo)

	geminiClient, err := gemini.NewClient(os.Getenv("GEMINI_API_KEY"))

	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to gemini %v\n", err)
	}

	resumeService := resume.NewService(geminiClient)

	r := http.NewRouter(userService, resumeService)

	r.Run()
}
