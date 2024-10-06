import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { Config, Effect, Redacted } from "effect";
import { ErrorPaddleQuery, Paddle } from "./paddle";
import { PaddleProduct } from "./schemas/paddle";

class ErrorMissingWebhookSecret extends Schema.TaggedError<ErrorMissingWebhookSecret>()(
  "ErrorMissingWebhookSecret",
  {}
) {}

class ErrorVerifySignature extends Schema.TaggedError<ErrorVerifySignature>()(
  "ErrorVerifySignature",
  {}
) {}

class ErrorInvalidProduct extends Schema.TaggedError<ErrorInvalidProduct>()(
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
      HttpApiEndpoint.addError(ErrorPaddleQuery),
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

export const PaddleApiLive = HttpApiBuilder.group(
  MainApi,
  "paddle",
  (handlers) =>
    handlers.pipe(
      // https://developer.paddle.com/webhooks/signature-verification#verify-sdks
      HttpApiBuilder.handle("webhook", ({ payload, headers }) =>
        Effect.gen(function* () {
          const { paddle } = yield* Paddle;
          const webhookSecret = yield* Config.redacted(
            "WEBHOOK_SECRET_KEY"
          ).pipe(Effect.mapError(() => new ErrorMissingWebhookSecret()));

          const eventData = yield* Effect.fromNullable(
            paddle.webhooks.unmarshal(
              payload,
              Redacted.value(webhookSecret),
              headers["paddle-signature"]
            )
          ).pipe(Effect.mapError(() => new ErrorVerifySignature()));

          yield* Effect.log(eventData);
          return true;
        })
      ),
      HttpApiBuilder.handle("product", ({ path: { slug } }) =>
        Effect.gen(function* () {
          const { query, productIdFromSlug } = yield* Paddle;
          const productId = yield* productIdFromSlug(slug);
          const rawProduct = yield* query((_) =>
            _.products.get(productId, {
              include: ["prices"],
            })
          );

          yield* Effect.log(rawProduct);

          return yield* Schema.decodeUnknown(PaddleProduct)(rawProduct).pipe(
            Effect.tapError((parseError) => Effect.logError(parseError)),
            Effect.mapError(() => new ErrorInvalidProduct())
          );
        })
      )
    )
);
