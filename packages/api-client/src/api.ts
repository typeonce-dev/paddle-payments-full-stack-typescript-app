import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "@effect/schema";
import { PaddleProduct } from "./schemas/paddle";

export class ErrorMissingWebhookSecret extends Schema.TaggedError<ErrorMissingWebhookSecret>()(
  "ErrorMissingWebhookSecret",
  {}
) {}

export class ErrorVerifySignature extends Schema.TaggedError<ErrorVerifySignature>()(
  "ErrorVerifySignature",
  {}
) {}

export class ErrorInvalidProduct extends Schema.TaggedError<ErrorInvalidProduct>()(
  "ErrorInvalidProduct",
  {}
) {}

class PaddleApi extends HttpApiGroup.make("paddle").pipe(
  HttpApiGroup.add(
    HttpApiEndpoint.post("webhook", "/paddle/webhook").pipe(
      HttpApiEndpoint.addError(ErrorMissingWebhookSecret),
      HttpApiEndpoint.addError(ErrorVerifySignature),
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
  ),
  HttpApiGroup.add(
    HttpApiEndpoint.get("product-pg", "/paddle/pg/product").pipe(
      HttpApiEndpoint.addError(ErrorInvalidProduct),
      HttpApiEndpoint.setSuccess(Schema.Any)
    )
  )
) {}

export class MainApi extends HttpApi.empty.pipe(HttpApi.addGroup(PaddleApi)) {}
