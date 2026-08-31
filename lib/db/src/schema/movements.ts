import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const movementsTable = pgTable("movements", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // income | expense
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMovementSchema = createInsertSchema(movementsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMovement = z.infer<typeof insertMovementSchema>;
export type Movement = typeof movementsTable.$inferSelect;
