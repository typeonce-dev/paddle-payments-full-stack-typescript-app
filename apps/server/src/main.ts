import { MainApi } from "@app/api-client";
import {
  HttpApiBuilder,
  HttpMiddleware,
  HttpServer,
  PlatformConfigProvider,
} from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { createServer } from "node:http";
import { PaddleApiLive } from "./paddle-api";

const DotEnvConfigProvider = PlatformConfigProvider.fromDotEnv(".env").pipe(
  Effect.map(Layer.setConfigProvider),
  Layer.unwrapEffect
);

const MainApiLive = HttpApiBuilder.api(MainApi).pipe(
  Layer.provide(PaddleApiLive),
  Layer.provide(DotEnvConfigProvider)
);

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(MainApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);

Layer.launch(HttpLive).pipe(NodeRuntime.runMain);
