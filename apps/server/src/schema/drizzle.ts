import { relations } from "drizzle-orm";
import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const currencyCodeEnum = pgEnum("currencyCode", [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "HKD",
  "SGD",
  "SEK",
  "ARS",
  "BRL",
  "CNY",
  "COP",
  "CZK",
  "DKK",
  "HUF",
  "ILS",
  "INR",
  "KRW",
  "MXN",
  "NOK",
  "NZD",
  "PLN",
  "RUB",
  "THB",
  "TRY",
  "TWD",
  "UAH",
  "ZAR",
]);

export const productTable = pgTable("product", {
  id: varchar({ length: 255 }).notNull().primaryKey(),
  slug: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  imageUrl: varchar({ length: 255 }),
});

export const priceTable = pgTable("price", {
  id: varchar({ length: 255 }).notNull().primaryKey(),
  productId: varchar({ length: 255 }).references(() => productTable.id),
  amount: varchar({ length: 255 }).notNull(),
  currencyCode: currencyCodeEnum().notNull(),
});

export const priceProductRelation = relations(productTable, ({ many }) => ({
  prices: many(priceTable),
}));
