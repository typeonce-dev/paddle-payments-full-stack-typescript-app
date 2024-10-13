import {
  ErrorInvalidProduct,
  ErrorMissingWebhookSecret,
  ErrorVerifySignature,
  MainApi,
} from "@app/api-client";
import { PaddleProduct } from "@app/api-client/schemas";
import { HttpApiBuilder } from "@effect/platform";
import { Schema } from "@effect/schema";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq } from "drizzle-orm";
import { Array, Config, Effect } from "effect";
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
          Effect.mapError(() => new ErrorMissingWebhookSecret())
        );

        const eventData = yield* Effect.fromNullable(
          webhooksUnmarshal({
            payload,
            webhookSecret,
            paddleSignature,
          })
        ).pipe(Effect.mapError(() => new ErrorVerifySignature()));

        yield* Effect.log(eventData);

        return true;
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
