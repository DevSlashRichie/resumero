package postgres

import (
	"context"

	"github.com/devslashrichie/resumero/internal/domain/user"
	"github.com/jackc/pgx/v5"
)

type UserRepository struct {
	db *pgx.Conn
}

func NewUserRepository(db *pgx.Conn) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(u *user.User) error {
	_, err := r.db.Exec(context.Background(), `
		INSERT INTO users (id, username, email, created_at)
        	VALUES ($1, $2, $3, $4)
	`, u.Id, u.Username, u.Email, u.CreatedAt)

	return err
}
