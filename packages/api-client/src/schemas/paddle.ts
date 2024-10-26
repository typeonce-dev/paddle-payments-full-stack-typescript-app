import { Schema } from "effect";

export const EntityId = Schema.NonEmptyString.pipe(Schema.brand("EntityId"));
export const CurrencyCode = Schema.Literal(
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
  "ZAR"
);

export class PaddleProduct extends Schema.Class<PaddleProduct>("PaddleProduct")(
  {
    id: EntityId,
    slug: Schema.NonEmptyString,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    imageUrl: Schema.NullOr(Schema.String),
  }
) {}

export class PaddlePrice extends Schema.Class<PaddlePrice>("PaddlePrice")({
  id: EntityId,
  productId: EntityId,
  amount: Schema.NonEmptyString,
  currencyCode: CurrencyCode,
}) {}
