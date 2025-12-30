import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { desc } from "drizzle-orm";
import { scores } from "./db/schema";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

const assetManifest = JSON.parse(manifestJSON);

type Bindings = {
  DB: D1Database;
  __STATIC_CONTENT: KVNamespace;
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
  try {
    return await getAssetFromKV(
      {
        request: c.req.raw,
        waitUntil: c.executionCtx.waitUntil.bind(c.executionCtx),
      },
      {
        ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
      }
    );
  } catch {
    // If not found, try to serve index.html for SPA routing
    try {
      const url = new URL(c.req.url);
      url.pathname = "/index.html";
      return await getAssetFromKV(
        {
          request: new Request(url.toString(), c.req.raw),
          waitUntil: c.executionCtx.waitUntil.bind(c.executionCtx),
        },
        {
          ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch {
      return c.notFound();
    }
  }
});

export type AppType = typeof api;
export default app;
