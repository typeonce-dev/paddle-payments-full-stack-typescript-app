import { Schema } from "@effect/schema";

export const ProductId = Schema.Number.pipe(Schema.brand("ProductId"));

export class PaddleProduct extends Schema.Class<PaddleProduct>("PaddleProduct")(
  {
    id: ProductId,
    slug: Schema.NonEmptyString,
    name: Schema.String,
    price: Schema.Number,
    description: Schema.NullOr(Schema.String),
    imageUrl: Schema.NullOr(Schema.String),
  }
) {}
