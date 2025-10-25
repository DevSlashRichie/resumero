package http

import (
	"github.com/devslashrichie/resumero/internal/domain/resume"
	"github.com/devslashrichie/resumero/internal/domain/user"
	"github.com/devslashrichie/resumero/internal/http/handlers"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func NewRouter(userService *user.Service, resumeService *resume.Service) *gin.Engine {
	r := gin.Default()

	r.Use(cors.Default())

	userHandler := handlers.NewUserHandler(userService)
	resumeHandler := handlers.NewResumeHandler(resumeService)

	r.POST("/users", userHandler.CreateUser)
	r.POST("/resumes/generate", resumeHandler.GenerateResume)

	return r
}
