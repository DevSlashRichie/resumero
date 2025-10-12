package resume

import "errors"

type Service struct {
	generator Generator
}

func NewService(g Generator) *Service {
	return &Service{
		generator: g,
	}
}

func (s *Service) GenerateJobsSection(input string) (*string, error) {
	if input == "" {
		return nil, errors.New("input cannot be empty")
	}

	inst := `
	You are a profesional CV writer. 
	You are currently writing the jobs part.
	You should write it as the EXAMPLE.
	The text in UPPERCASE are placeholders you should replace, if not sufficient info is provided insert "UNKNOWN".
	Depending on the amount of given context you can add or reduce more "\resumeItems". 

	TEMPLATE:
	\resumeSubheading
      {ROLE}{MONTH. YEAR -- MONTH. YEAR}
      {BUSINESS NAME}{JOB MODE - LOCATION}
      \resumeItemListStart
        \resumeItem{TASK DESCRIPTION OF WHAT ALREADY DID.}
        \resumeItem{Designed and developed an end-to-end club operations platform using Rust, PostgreSQL, React (NextJS), TypeScript, Node.js, and AWS.}
      \resumeItemListEnd

	EXAMPLE:
	\resumeSubheading
      {Senior FullStack Software Engineer}{Sep. 2020 -- Oct. 2024}
      {Parallel Planes PTY LTD}{Remote - Australia}
      \resumeItemListStart
	    \resumeItem{Designed and developed an end-to-end club operations platform using Rust, PostgreSQL, React (NextJS), TypeScript, Node.js, and AWS.}
        \resumeItem{Directed the design of the complete infrastructure in which MyMetaverse runs using NextJS and several backends}
        \resumeItem{Worked with product owners to develop new features while maintaining existing services including an oauth authentication service.}
      \resumeItemListEnd

	`

	return s.generator.Generate(input, inst)
}

func (s *Service) GenerateEducationPart(input string) (*string, error) {
	if input == "" {
		return nil, errors.New("input cannot be empty")
	}

	inst := `
	You are a profesional CV writer. 
	You are currently writing the education part.
	You should write it as the EXAMPLE.
	The text in UPPERCASE are placeholders you should replace, if not sufficient info is provided insert "UNKNOWN".
	I will tell you peronsal context and you'll format is as follows.

	TEMPLATE:
	\section{Education}
	  \resumeSubHeadingListStart
	    \resumeSubheading
	      {SCHOOL NAME}{CITY, COUNTRY}
	      {FIELD}{MONTH. YEAR -- MONTH. YEAR}
	  \resumeSubHeadingListEnd

	EXAMPLE:
	\section{Education}
  	\resumeSubHeadingListStart
    	\resumeSubheading
      	{Instituto Tecnológico y de Estudios Superiores de Monterrey}{Querétaro, MEX}
      	{Computer Science}{Aug. 2024 -- Aug. 2028}
  	\resumeSubHeadingListEnd
	`

	return s.generator.Generate(input, inst)
}
