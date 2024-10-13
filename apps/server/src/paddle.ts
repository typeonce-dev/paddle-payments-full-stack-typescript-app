import { Schema } from "@effect/schema";
import { Effect, Redacted } from "effect";
import { PaddleSdk } from "./paddle-sdk";

export class ErrorPaddle extends Schema.TaggedError<ErrorPaddle>()(
  "ErrorPaddle",
  { cause: Schema.Unknown }
) {}

export class Paddle extends Effect.Service<Paddle>()("Paddle", {
  effect: Effect.gen(function* () {
    const paddle = yield* PaddleSdk;

    const webhooksUnmarshal = ({
      paddleSignature,
      payload,
      webhookSecret,
    }: {
      payload: string;
      webhookSecret: Redacted.Redacted;
      paddleSignature: string;
    }) =>
      Effect.fromNullable(
        paddle.webhooks.unmarshal(
          payload,
          Redacted.value(webhookSecret),
          paddleSignature
        )
      ).pipe(Effect.mapError((cause) => new ErrorPaddle({ cause })));

    return { webhooksUnmarshal };
  }),
}) {}
