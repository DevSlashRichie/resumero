import { Client, ResumeroApi } from "@/api";

export function useApi() {
  const client = new Client("http://localhost:8080");
  const api = new ResumeroApi(client);

  return { api };
}
