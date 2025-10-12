package handlers

import (
	"net/http"

	"github.com/devslashrichie/resumero/internal/domain/user"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	service *user.Service
}

func NewUserHandler(s *user.Service) *UserHandler {
	return &UserHandler{service: s}
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var input struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "User validation failed!",
			"error":   err.Error(),
		})
		return
	}

	u, err := h.service.CreateUser(input.Name, input.Email)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Could not create user.",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, u)
}
