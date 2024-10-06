import { Config, Layer, ManagedRuntime } from "effect";
import { Api } from "./api";
import { Paddle } from "./paddle";

const ApiConfig = Config.all({
  baseUrl: Config.string("API_BASE_URL").pipe(
    Config.withDefault("http://localhost:3000")
  ),
});

const ApiLive = Api.Live(ApiConfig);

const MainLayer = Layer.mergeAll(ApiLive, Paddle.Live);

export const RuntimeClient = ManagedRuntime.make(MainLayer);
