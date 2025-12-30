import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const scores = sqliteTable("scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nickname: text("nickname").notNull(),
  score: integer("score").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;
