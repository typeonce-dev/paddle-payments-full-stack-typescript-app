import { MainApi } from "@app/api-client";
import { HttpApiBuilder } from "@effect/platform";
import { Config, Layer } from "effect";
import { DatabaseLive } from "./database";
import { Paddle } from "./paddle";
import { PaddleApiLive } from "./paddle-api";
import { PaddleSdk } from "./paddle-sdk";

const PaddleSdkConfig = Config.all({
  apiKey: Config.redacted("PADDLE_API_KEY"),
});

const PaddleSkdLive = PaddleSdk.Default(PaddleSdkConfig);
const PaddleLive = Paddle.Default.pipe(Layer.provide(PaddleSkdLive));

export const MainApiLive = HttpApiBuilder.api(MainApi).pipe(
  Layer.provide(
    PaddleApiLive.pipe(Layer.provide(Layer.mergeAll(PaddleLive, DatabaseLive)))
  )
);
