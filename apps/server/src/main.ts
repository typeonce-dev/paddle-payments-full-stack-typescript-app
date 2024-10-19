import "dotenv/config";

import { MainApi } from "@app/api-client";
import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Layer } from "effect";
import { createServer } from "node:http";
import { DatabaseLive } from "./database";
import { Paddle } from "./paddle";
import { PaddleApi, PaddleApiLive } from "./paddle-api";
import { PaddleSdk } from "./paddle-sdk";

const PaddleSdkConfig = Config.all({
  apiKey: Config.redacted("PADDLE_API_KEY"),
});

const PaddleSdkLive = PaddleSdk.Default(PaddleSdkConfig);
const PaddleLive = Paddle.Default.pipe(Layer.provide(PaddleSdkLive));

const MainApiLive = HttpApiBuilder.api(MainApi).pipe(
  Layer.provide(
    PaddleApiLive.pipe(
      Layer.provide(Layer.mergeAll(PaddleApi.Default, PaddleLive, DatabaseLive))
    )
  )
);

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(MainApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);

Layer.launch(HttpLive).pipe(NodeRuntime.runMain);
