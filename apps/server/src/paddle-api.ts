import { ErrorInvalidProduct, ErrorWebhook, MainApi } from "@app/api-client";
import { PaddlePrice, PaddleProduct } from "@app/api-client/schemas";
import { HttpApiBuilder } from "@effect/platform";
import { Schema } from "@effect/schema";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { EventName } from "@paddle/paddle-node-sdk";
import { eq } from "drizzle-orm";
import { Array, Config, Effect, Match } from "effect";
import { Paddle } from "./paddle";
import { priceTable, productTable } from "./schema/drizzle";
import { slugFromName } from "./utils";

export class PaddleApi extends Effect.Service<PaddleApi>()("PaddleApi", {
  succeed: {
    webhook: ({
      paddleSignature,
      payload,
    }: {
      payload: string;
      paddleSignature: string;
    }) =>
      Effect.gen(function* () {
        const { webhooksUnmarshal } = yield* Paddle;
        const webhookSecret = yield* Config.redacted("WEBHOOK_SECRET_KEY").pipe(
          Effect.mapError(() => new ErrorWebhook({ reason: "missing-secret" }))
        );

        const eventData = yield* webhooksUnmarshal({
          payload,
          webhookSecret,
          paddleSignature,
        }).pipe(
          Effect.mapError(
            () => new ErrorWebhook({ reason: "verify-signature" })
          )
        );

        yield* Effect.log(eventData);
        return yield* Match.value(eventData).pipe(
          Match.when({ eventType: EventName.ProductCreated }, ({ data }) =>
            Effect.gen(function* () {
              const drizzle = yield* PgDrizzle;
              yield* drizzle.insert(productTable).values({
                id: data.id,
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                slug: slugFromName(data.name),
              });
              return true;
            }).pipe(
              Effect.mapError(() => new ErrorWebhook({ reason: "query-error" }))
            )
          ),
          Match.when({ eventType: EventName.PriceCreated }, ({ data }) =>
            Effect.gen(function* () {
              const drizzle = yield* PgDrizzle;
              yield* drizzle.insert(priceTable).values({
                id: data.id,
                productId: data.productId,
                amount: data.unitPrice.amount,
                currencyCode: data.unitPrice.currencyCode,
              });
              return true;
            }).pipe(
              Effect.mapError(() => new ErrorWebhook({ reason: "query-error" }))
            )
          ),
          Match.orElse(() => Effect.succeed(true))
        );
      }),
    getProduct: ({ slug }: { slug: string }) =>
      Effect.gen(function* () {
        const drizzle = yield* PgDrizzle;

        const { price, product } = yield* drizzle
          .select()
          .from(productTable)
          .where(eq(productTable.slug, slug))
          .limit(1)
          .leftJoin(priceTable, eq(productTable.id, priceTable.productId))
          .pipe(
            Effect.flatMap(Array.head),
            Effect.mapError(() => new ErrorInvalidProduct())
          );

        return yield* Effect.all({
          product: Schema.decode(PaddleProduct)(product),
          price: Effect.fromNullable(price).pipe(
            Effect.flatMap((price) =>
              Effect.fromNullable(price.productId).pipe(
                Effect.flatMap((productId) =>
                  Schema.decode(PaddlePrice)({ ...price, productId })
                )
              )
            )
          ),
        }).pipe(
          Effect.tapError((parseError) => Effect.logError(parseError)),
          Effect.mapError(() => new ErrorInvalidProduct())
        );
      }),
  },
}) {}

export const PaddleApiLive = HttpApiBuilder.group(
  MainApi,
  "paddle",
  (handlers) =>
    handlers.pipe(
      // https://developer.paddle.com/webhooks/signature-verification#verify-sdks
      HttpApiBuilder.handle("webhook", ({ payload, headers }) =>
        PaddleApi.pipe(
          Effect.flatMap((api) =>
            api.webhook({
              paddleSignature: headers["paddle-signature"],
              payload,
            })
          )
        )
      ),
      HttpApiBuilder.handle("product", ({ path: { slug } }) =>
        PaddleApi.pipe(Effect.flatMap((api) => api.getProduct({ slug })))
      )
    )
);
