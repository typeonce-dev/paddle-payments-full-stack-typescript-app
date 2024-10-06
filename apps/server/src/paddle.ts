import { Schema } from "@effect/schema";
import * as _Paddle from "@paddle/paddle-node-sdk";
import { Config, Context, Effect, Layer, Redacted } from "effect";
import { ProductId } from "./schemas/paddle";

export class ErrorPaddleQuery extends Schema.TaggedError<ErrorPaddleQuery>()(
  "ErrorPaddleQuery",
  { cause: Schema.Unknown }
) {}

interface PaddleConfig {
  readonly apiKey: Redacted.Redacted;
  readonly productId: Redacted.Redacted;
}

const make = ({ apiKey, productId }: PaddleConfig) =>
  Effect.gen(function* () {
    const paddle = new _Paddle.Paddle(Redacted.value(apiKey), {
      environment: _Paddle.Environment.sandbox,
      logLevel: _Paddle.LogLevel.verbose,
    });

    const query = <T>(execute: (_: typeof paddle) => Promise<T>) =>
      Effect.tryPromise({
        try: () => execute(paddle),
        catch: (cause) => new ErrorPaddleQuery({ cause }),
      });

    const productIdFromSlug = (slug: string) =>
      Effect.liftPredicate(
        slug,
        (s) => s === "premium",
        () =>
          new ErrorPaddleQuery({
            cause: new globalThis.Error("Unknown product slug"),
          })
      ).pipe(
        Effect.andThen(
          Schema.decode(ProductId)(Redacted.value(productId)).pipe(
            Effect.mapError(
              () =>
                new ErrorPaddleQuery({
                  cause: new globalThis.Error("Invalid product slug"),
                })
            )
          )
        )
      );

    return { paddle, query, productIdFromSlug };
  });

export class Paddle extends Context.Tag("Paddle")<
  Paddle,
  Effect.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly Live = (config: Config.Config.Wrap<PaddleConfig>) =>
    Config.unwrap(config).pipe(Effect.flatMap(make), Layer.effect(this));
}
