import {
  ErrorInvalidProduct,
  ErrorMissingWebhookSecret,
  ErrorVerifySignature,
  MainApi,
} from "@app/api-client";
import { HttpApiBuilder } from "@effect/platform";
import { Schema } from "@effect/schema";
import { Config, Effect, Redacted } from "effect";
import { Paddle } from "./paddle";
import { PaddleProduct } from "@app/api-client/schemas";

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
          const productId = yield* productIdFromSlug(slug).pipe(
            Effect.mapError(() => new ErrorInvalidProduct())
          );

          const rawProduct = yield* query((_) =>
            _.products.get(productId, {
              include: ["prices"],
            })
          ).pipe(Effect.mapError(() => new ErrorInvalidProduct()));

          yield* Effect.log(rawProduct);

          return yield* Schema.decodeUnknown(PaddleProduct)(rawProduct).pipe(
            Effect.tapError((parseError) => Effect.logError(parseError)),
            Effect.mapError(() => new ErrorInvalidProduct())
          );
        })
      )
    )
);
