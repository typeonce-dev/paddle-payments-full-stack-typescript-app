import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "@effect/schema";
import { PaddleProduct } from "./schemas/paddle";

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

export class PaddleApi extends HttpApiGroup.make("paddle").pipe(
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
      HttpApiEndpoint.setSuccess(PaddleProduct),
      HttpApiEndpoint.setPath(
        Schema.Struct({
          slug: Schema.NonEmptyString,
        })
      )
    )
  )
) {}

export class MainApi extends HttpApi.empty.pipe(HttpApi.addGroup(PaddleApi)) {}
