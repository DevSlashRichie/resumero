package user

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo Repository
}

func NewService(r Repository) *Service {
	return &Service{repo: r}
}

func (s *Service) CreateUser(name, email string) (*User, error) {
	if name == "" || email == "" {
		return nil, errors.New("name and email are required")
	}

	u, _ := uuid.NewV7()

	user := &User{
		Id:        u.String(),
		Username:      name,
		Email:     email,
		CreatedAt: time.Now(),
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}
