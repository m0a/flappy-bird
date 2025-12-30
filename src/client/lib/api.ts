import { hc } from "hono/client";
import type { AppType } from "../../server/index";

const client = hc<AppType>("/");

export const api = client.api;

export async function submitScore(nickname: string, score: number) {
  const res = await api.scores.$post({
    json: { nickname, score },
  });
  return res.json();
}

export async function getRanking() {
  const res = await api.scores.ranking.$get();
  return res.json();
}
