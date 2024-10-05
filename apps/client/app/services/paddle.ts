import { initializePaddle, type PaddleEventData } from "@paddle/paddle-js";
import { Context, Data, Effect, Layer } from "effect";
import { PADDLE_CONTAINER_CLASS } from "~/constants";

class ErrorPaddle extends Data.TaggedError("PaddleError")<{ cause: unknown }> {}

const make = ({
  clientToken,
  eventCallback,
}: {
  clientToken: string;
  eventCallback: (event: PaddleEventData) => void;
}) =>
  Effect.tryPromise(() =>
    initializePaddle({
      eventCallback,
      token: clientToken,
      environment: "sandbox",
      debug: true,
      checkout: {
        settings: {
          displayMode: "inline",
          frameInitialHeight: 450,
          frameTarget: PADDLE_CONTAINER_CLASS,
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

export class Paddle extends Context.Tag("Paddle")<Paddle, typeof make>() {
  static readonly Live = Layer.succeed(this, make);
}
