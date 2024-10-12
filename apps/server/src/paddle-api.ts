import {
  ErrorInvalidProduct,
  ErrorMissingWebhookSecret,
  ErrorSqlQuery,
  ErrorVerifySignature,
  MainApi,
} from "@app/api-client";
import { PaddleProduct } from "@app/api-client/schemas";
import { HttpApiBuilder } from "@effect/platform";
import { Schema } from "@effect/schema";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Array, Config, Effect, Redacted } from "effect";
import { Paddle } from "./paddle";
import { productTable } from "./schema/drizzle";

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
      ),
      HttpApiBuilder.handle("product-add", ({ payload }) =>
        Effect.gen(function* () {
          const db = yield* PgDrizzle;
          const product = yield* db
            .insert(productTable)
            .values({
              name: payload.name,
              description: payload.description,
              imageUrl: payload.imageUrl,
              price: payload.price,
            })
            .returning()
            .pipe(
              Effect.flatMap(Array.head),
              Effect.tapError((error) => Effect.logError(error)),
              Effect.mapError(() => new ErrorSqlQuery())
            );

          yield* Effect.log(product);

          return product.id;
        })
      )
    )
);
