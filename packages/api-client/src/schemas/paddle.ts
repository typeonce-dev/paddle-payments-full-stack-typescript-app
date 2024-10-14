import { Schema } from "@effect/schema";

export const ProductId = Schema.NonEmptyString.pipe(Schema.brand("ProductId"));

export class PaddleProduct extends Schema.Class<PaddleProduct>("PaddleProduct")(
  {
    id: ProductId,
    slug: Schema.NonEmptyString,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    imageUrl: Schema.NullOr(Schema.String),
  }
) {}
