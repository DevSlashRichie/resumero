package resume

import (
	"errors"
	"fmt"
	"strings"
)

type Service struct {
	generator Generator
}

func NewService(g Generator) *Service {
	return &Service{
		generator: g,
	}
}

func (s *Service) GenerateJobsSection(input string, existing []string) (*string, error) {
	if input == "" {
		return nil, errors.New("input cannot be empty")
	}

	inst := `
You are a professional CV writer.
You are currently writing the jobs section of a CV.

Instructions:

I will give you context about a specific job I held.

Output one concise, results-oriented line describing a single achievement or responsibility from that job.

The line should be specific and measurable whenever possible.

Only output the requested line—do not output formatting, headings, or explanations.

Replace any missing or unclear information with "UNKNOWN".

Avoid repeating anything already present in the HISTORY section.

HISTORY:
'
%v
'

EXAMPLE LINE:
'
Designed and developed an end-to-end club operations platform using Rust, PostgreSQL, React (NextJS), TypeScript, Node.js, and AWS.
Scaled user base from 10 to 2000+, accidentally becoming a small wealthy nation in the process
Led the design of the purchasing pipeline by integrating multiple payment gateways, enabling the company to generate over \$50,000 USD in daily sales using Rust, Java and NodeJS
Enabled over 4,000 end-users and facilitated 10,000+ transactions, helping a single club generate over \$150,000+ USD (3,000,000 MXN) in revenue.
'

EXAMPLE OUTPUT:
'
line
'
`;

	existingLines := strings.Join(existing, "\n")
	out := fmt.Sprintf(inst, existingLines)

	return s.generator.Generate(input, out)
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
