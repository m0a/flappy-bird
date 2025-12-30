import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { desc } from "drizzle-orm";
import { scores } from "./db/schema";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

const api = app
  .basePath("/api")
  .post(
    "/scores",
    zValidator(
      "json",
      z.object({
        nickname: z.string().min(1).max(20),
        score: z.number().int().min(0),
      })
    ),
    async (c) => {
      const { nickname, score } = c.req.valid("json");
      const db = drizzle(c.env.DB);

      const result = await db.insert(scores).values({ nickname, score }).returning();

      return c.json({ success: true, data: result[0] });
    }
  )
  .get("/scores/ranking", async (c) => {
    const db = drizzle(c.env.DB);

    const ranking = await db
      .select()
      .from(scores)
      .orderBy(desc(scores.score))
      .limit(10);

    return c.json({ data: ranking });
  });

// Serve static files
app.get("*", async (c) => {
  return c.notFound();
});

export type AppType = typeof api;
export default app;
