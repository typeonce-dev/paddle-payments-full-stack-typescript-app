import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { PaddlePrice, PaddleProduct } from "./schemas/paddle";

export class ErrorWebhook extends Schema.TaggedError<ErrorWebhook>()(
  "ErrorWebhook",
  {
    reason: Schema.Literal(
      "missing-secret",
      "verify-signature",
      "query-error",
      "missing-payload"
    ),
  }
) {}

export class ErrorInvalidProduct extends Schema.TaggedError<ErrorInvalidProduct>()(
  "ErrorInvalidProduct",
  {}
) {}

export class ErrorSqlQuery extends Schema.TaggedError<ErrorSqlQuery>()(
  "ErrorSqlQuery",
  {}
) {}

export class PaddleApiGroup extends HttpApiGroup.make("paddle")
  .add(
    HttpApiEndpoint.post("webhook", "/paddle/webhook")
      .addError(ErrorWebhook)
      .addSuccess(Schema.Boolean)
      .setHeaders(
        Schema.Struct({
          "paddle-signature": Schema.NonEmptyString,
        })
      )
  )
  .add(
    HttpApiEndpoint.get("product", "/paddle/product/:slug")
      .addError(ErrorInvalidProduct)
      .addSuccess(
        Schema.Struct({
          product: PaddleProduct,
          price: PaddlePrice,
        })
      )
      .setPath(
        Schema.Struct({
          slug: Schema.NonEmptyString,
        })
      )
  ) {}

export class MainApi extends HttpApi.empty.add(PaddleApiGroup) {}
