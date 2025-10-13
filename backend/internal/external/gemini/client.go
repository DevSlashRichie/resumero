package gemini

import (
	"context"
	"google.golang.org/genai"
)

type Client struct {
	client *genai.Client
}

func NewClient(apiKey string) (*Client, error) {
	c := &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	}

	client, err := genai.NewClient(context.Background(), c)

	if err != nil {
		return nil, err
	}

	return &Client{
		client: client,
	}, nil
}

func (c *Client) Generate(input, system string) (*string, error) {
	config := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(system, genai.RoleUser),
	}

	// expanded on how to include several messages.
	cont := []*genai.Content{
		{
			Role:  genai.RoleUser,
			Parts: []*genai.Part{{Text: input}},
		},
	}

	genai.Text(input)

	r, err := c.client.Models.GenerateContent(context.Background(), "gemini-2.5-flash", cont, config)

	if err != nil {
		return nil, err
	}

	text := r.Text()

	return &text, nil
}
