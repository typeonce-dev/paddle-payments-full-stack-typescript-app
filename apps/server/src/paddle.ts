import * as _Paddle from "@paddle/paddle-node-sdk";
import { Config, Context, Effect, Layer, Redacted } from "effect";

interface PaddleConfig {
  readonly apiKey: Redacted.Redacted;
}

const make = ({ apiKey }: PaddleConfig) =>
  Effect.gen(function* () {
    const paddle = new _Paddle.Paddle(Redacted.value(apiKey), {
      environment: _Paddle.Environment.sandbox,
      logLevel: _Paddle.LogLevel.verbose,
    });
    return paddle;
  });

export class Paddle extends Context.Tag("Paddle")<
  Paddle,
  Effect.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly Live = (config: Config.Config.Wrap<PaddleConfig>) =>
    Config.unwrap(config).pipe(Effect.flatMap(make), Layer.effect(this));
}
