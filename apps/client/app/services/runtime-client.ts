import { Config, Layer, ManagedRuntime } from "effect";
import { Paddle } from "./paddle";

const PaddleConfig = Config.all({
  clientToken: Config.string(),
});

const PaddleLive = Paddle.Live(PaddleConfig);

const MainLayer = Layer.mergeAll(PaddleLive);

export const RuntimeClient = ManagedRuntime.make(MainLayer);
