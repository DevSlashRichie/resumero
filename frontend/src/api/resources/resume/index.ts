import type { Client } from "@/api/client";

export class Resume {
  constructor(private readonly client: Client) {}

  generateJobLine(payload: {
    part: "experience";
    content: string;
    history: string[];
  }) {
    const { operation } = this.client.prepare<{ content: string }>(
      "/resumes/generate",
      "POST",
      payload,
    );

    return operation;
  }
}
