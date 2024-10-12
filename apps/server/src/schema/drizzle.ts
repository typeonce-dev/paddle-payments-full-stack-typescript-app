import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const productTable = pgTable("product", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("name", { length: 255 }),
  imageUrl: varchar("name", { length: 255 }),
  price: integer("price").notNull(),
});
