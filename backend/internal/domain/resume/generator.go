package resume

type Generator interface {
	Generate(input, system string) (*string, error)
}
