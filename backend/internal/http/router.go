package http

import (
	"github.com/devslashrichie/resumero/internal/domain/resume"
	"github.com/devslashrichie/resumero/internal/domain/user"
	"github.com/devslashrichie/resumero/internal/http/handlers"
	"github.com/gin-gonic/gin"
)

func NewRouter(userService *user.Service, resumeService *resume.Service) *gin.Engine {
	r := gin.Default()

	userHandler := handlers.NewUserHandler(userService)
	resumeHandler := handlers.NewResumeHandler(resumeService)

	r.POST("/users", userHandler.CreateUser)
	r.POST("/resumes/generate", resumeHandler.GenerateResume)

	return r
}
