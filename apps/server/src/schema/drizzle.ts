import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const productTable = pgTable("product", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  description: varchar({ length: 255 }),
  imageUrl: varchar({ length: 255 }),
});
