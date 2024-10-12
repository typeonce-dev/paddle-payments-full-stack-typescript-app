import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const productTable = pgTable("product", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  imageUrl: varchar({ length: 255 }),
  price: integer().notNull(),
});
