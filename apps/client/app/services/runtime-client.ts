import { Config, ConfigProvider, Layer, ManagedRuntime } from "effect";
import { PADDLE_CLIENT_TOKEN } from "./_env";
import { Paddle } from "./paddle";

const ClientConfigProvider = Layer.setConfigProvider(
  ConfigProvider.fromMap(
    new Map([["PADDLE_CLIENT_TOKEN", PADDLE_CLIENT_TOKEN]])
  )
);

const PaddleConfig = Config.all({
  clientToken: Config.string("PADDLE_CLIENT_TOKEN"),
});

const PaddleLive = Paddle.Live(PaddleConfig);

const MainLayer = Layer.mergeAll(PaddleLive).pipe(
  Layer.provide(ClientConfigProvider)
);

export const RuntimeClient = ManagedRuntime.make(MainLayer);
