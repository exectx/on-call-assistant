// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import { index, int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 * NOTE: hack_ is the prefix for the table names, you can change it
 */
export const createTable = sqliteTableCreator((name) => `hack_${name}`);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const spaces = createTable(
  "space",
  {
    id: text("id", { length: 256 }).primaryKey(),
    userId: text("user_id", { length: 256 }).notNull(),
    title: text("title", { length: 256 }).default("Untitled space").notNull(),
    summary: text("summary", { length: 256 }).default("No summary").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (space) => ({
    userIdIndex: index("user_id_idx").on(space.userId),
    updatedAtIndex: index("updated_at_idx").on(space.updatedAt),
  }),
);

export const calls = createTable("call", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  spaceId: text("space_id", { length: 256 }).notNull(),
  userId: text("user_id", { length: 256 }).notNull(),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const spaceRelations = relations(spaces, ({ many }) => {
  return {
    calls: many(calls),
  };
});

export const callsRelations = relations(calls, ({ one }) => {
  return {
    space: one(spaces, {
      fields: [calls.spaceId],
      references: [spaces.id],
    }),
  };
});
