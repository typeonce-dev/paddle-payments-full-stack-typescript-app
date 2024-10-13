import { MainApi } from "@app/api-client";
import { HttpApiBuilder } from "@effect/platform";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { Paddle } from "../src/paddle";
import { PaddleApiLive } from "../src/paddle-api";
import { PaddleSdk } from "../src/paddle-sdk";
import { PgContainer } from "./pg-container";

export const MainApiTest = HttpApiBuilder.api(MainApi).pipe(
  Layer.provideMerge(
    PaddleApiLive.pipe(
      Layer.provideMerge(
        Layer.mergeAll(
          Paddle.Default.pipe(Layer.provide(PaddleSdk.Test)),
          PgDrizzle.layer.pipe(Layer.provide(PgContainer.ClientLive))
        )
      )
    )
  )
);

it.layer(MainApiTest, { timeout: "30 seconds" })("MainApi", (it) => {
  it.effect("insert helper", () =>
    Effect.gen(function* () {
      expect(true);
    })
  );
});
