import { HttpApiBuilder } from "@effect/platform";
import { Config, Layer } from "effect";
import { Paddle } from "./paddle";
import { MainApi, PaddleApiLive } from "./paddle-api";

const PaddleConfig = Config.all({
  apiKey: Config.redacted("PADDLE_API_KEY"),
  productId: Config.redacted("PADDLE_PRODUCT_ID"),
});

const PaddleLive = Paddle.Live(PaddleConfig);

export const MainApiLive = HttpApiBuilder.api(MainApi).pipe(
  Layer.provide(PaddleApiLive.pipe(Layer.provide(PaddleLive)))
);
