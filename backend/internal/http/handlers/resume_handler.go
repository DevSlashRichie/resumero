package handlers

import (
	"net/http"

	"github.com/devslashrichie/resumero/internal/domain/resume"
	"github.com/gin-gonic/gin"
)

type ResumeHandler struct {
	service *resume.Service
}

func NewResumeHandler(s *resume.Service) *ResumeHandler {
	return &ResumeHandler{service: s}
}

func (h *ResumeHandler) GenerateResume(c *gin.Context) {
	var input struct {
		Part    string `json:"part"`
		Content string `jsin:"content"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Input validation failed!",
			"error":   err.Error(),
		})
	}

	switch input.Part {
	case "experience":
		r, err := h.service.GenerateJobsSection(input.Content)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Could not generate section.",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"content": r,
		})
	case "education":
		r, err := h.service.GenerateEducationPart(input.Content)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Could not generate section.",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"content": r,
		})
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid resume part.",
		})
	}

}
