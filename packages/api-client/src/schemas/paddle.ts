import { Schema } from "@effect/schema";

export const ProductId = Schema.NonEmptyString.pipe(Schema.brand("ProductId"));

export class PaddleProduct extends Schema.Class<PaddleProduct>("PaddleProduct")(
  {
    id: ProductId,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    imageUrl: Schema.NullOr(Schema.String),
    createdAt: Schema.String,
    updatedAt: Schema.String,
    prices: Schema.NonEmptyArray(
      Schema.Struct({
        id: Schema.String,
        unitPrice: Schema.Struct({
          amount: Schema.String,
          currencyCode: Schema.Literal("USD", "EUR"),
        }),
      })
    ),
  }
) {}
