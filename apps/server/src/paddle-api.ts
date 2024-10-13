import { ErrorInvalidProduct, ErrorWebhook, MainApi } from "@app/api-client";
import { PaddleProduct } from "@app/api-client/schemas";
import { HttpApiBuilder } from "@effect/platform";
import { Schema } from "@effect/schema";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { EventName } from "@paddle/paddle-node-sdk";
import { eq } from "drizzle-orm";
import { Array, Config, Effect, Match } from "effect";
import { Paddle } from "./paddle";
import { productTable } from "./schema/drizzle";

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
                slug: globalThis.crypto.randomUUID(),
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                price: 10,
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

        const product = yield* drizzle
          .select()
          .from(productTable)
          .where(eq(productTable.slug, slug))
          .limit(1)
          .pipe(
            Effect.flatMap(Array.head),
            Effect.mapError(() => new ErrorInvalidProduct())
          );

        return yield* Schema.decodeUnknown(PaddleProduct)(product).pipe(
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
