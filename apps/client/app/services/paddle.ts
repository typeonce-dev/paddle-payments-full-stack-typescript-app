import { initializePaddle, type PaddleEventData } from "@paddle/paddle-js";
import { Config, Context, Data, Effect, Layer } from "effect";

class ErrorPaddle extends Data.TaggedError("PaddleError")<{ cause: unknown }> {}

interface PaddleConfig {
  readonly clientToken: string;
}

const make =
  ({ clientToken }: PaddleConfig) =>
  (eventCallback: (event: PaddleEventData) => void) =>
    Effect.tryPromise(() =>
      initializePaddle({
        eventCallback,
        token: clientToken,
        environment: "production",
        debug: true,
        checkout: {
          settings: {
            displayMode: "inline",
            frameInitialHeight: 450,
            frameTarget: "checkout-container",
            frameStyle:
              "width: 100%; min-width: 312px; background-color: transparent; border: none;",
            locale: "en",
          },
        },
      })
    ).pipe(
      Effect.flatMap(Effect.fromNullable),
      Effect.mapError((cause) => new ErrorPaddle({ cause }))
    );

export class Paddle extends Context.Tag("Paddle")<
  Paddle,
  ReturnType<typeof make>
>() {
  static readonly Live = (config: Config.Config.Wrap<PaddleConfig>) =>
    Config.unwrap(config).pipe(Effect.map(make), Layer.effect(this));
}
