import type { Client } from "../client";
import { Resume } from "./resume";

export class ResumeroApi {
  constructor(private readonly client: Client) { }

  get resume() {
    return new Resume(this.client);
  }
}
