import { initializePaddle } from "@paddle/paddle-js";
import { Data, Effect } from "effect";
import { PADDLE_CONTAINER_CLASS } from "~/constants";

class ErrorPaddle extends Data.TaggedError("PaddleError")<{ cause: unknown }> {}

export class Paddle extends Effect.Service<Paddle>()("Paddle", {
  succeed: ({ clientToken }: { clientToken: string }) =>
    Effect.tryPromise(() =>
      initializePaddle({
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
    ),
}) {}
