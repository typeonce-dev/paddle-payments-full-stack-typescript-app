import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "@effect/schema";
import { PaddlePrice, PaddleProduct } from "./schemas/paddle";

export class ErrorWebhook extends Schema.TaggedError<ErrorWebhook>()(
  "ErrorWebhook",
  {
    reason: Schema.Literal("missing-secret", "verify-signature", "query-error"),
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

export class PaddleApiGroup extends HttpApiGroup.make("paddle").pipe(
  HttpApiGroup.add(
    HttpApiEndpoint.post("webhook", "/paddle/webhook").pipe(
      HttpApiEndpoint.addError(ErrorWebhook),
      HttpApiEndpoint.setSuccess(Schema.Boolean),
      HttpApiEndpoint.setPayload(Schema.String),
      HttpApiEndpoint.setHeaders(
        Schema.Struct({
          "paddle-signature": Schema.NonEmptyString,
        })
      )
    )
  ),
  HttpApiGroup.add(
    HttpApiEndpoint.get("product", "/paddle/product/:slug").pipe(
      HttpApiEndpoint.addError(ErrorInvalidProduct),
      HttpApiEndpoint.setSuccess(
        Schema.Struct({
          product: PaddleProduct,
          price: PaddlePrice,
        })
      ),
      HttpApiEndpoint.setPath(
        Schema.Struct({
          slug: Schema.NonEmptyString,
        })
      )
    )
  )
) {}

export class MainApi extends HttpApi.empty.pipe(
  HttpApi.addGroup(PaddleApiGroup)
) {}
