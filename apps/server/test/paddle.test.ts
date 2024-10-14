import { MainApi } from "@app/api-client";
import { PaddleProduct, ProductId } from "@app/api-client/schemas";
import { HttpApiBuilder, HttpApiClient, HttpServer } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { expect, it } from "@effect/vitest";
import { sql } from "drizzle-orm";
import { Cause, ConfigProvider, Console, Effect, Layer } from "effect";
import { Paddle } from "../src/paddle";
import { PaddleApi, PaddleApiLive } from "../src/paddle-api";
import { PaddleSdk } from "../src/paddle-sdk";
import { productTable } from "../src/schema/drizzle";
import { PgContainer } from "./pg-container";

const TestConfigProvider = Layer.setConfigProvider(
  ConfigProvider.fromMap(
    new Map([
      ["PADDLE_API_KEY", ""],
      ["PADDLE_PRODUCT_ID", ""],
      ["POSTGRES_PW", ""],
      ["WEBHOOK_SECRET_KEY", ""],
    ])
  )
);

const HttpGroupTest = <A, E, R>(groupLayer: Layer.Layer<A, E, R>) =>
  HttpApiBuilder.Router.unwrap(HttpServer.serve()).pipe(
    Layer.provideMerge(groupLayer),
    Layer.provideMerge(NodeHttpServer.layerTest)
  );

const LayerTest = HttpGroupTest(
  PaddleApiLive.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        PaddleApi.Default,
        Paddle.Default.pipe(Layer.provide(PaddleSdk.Test)),
        PgDrizzle.layer.pipe(Layer.provide(PgContainer.ClientLive))
      )
    )
  )
).pipe(Layer.provide(TestConfigProvider));

it.layer(LayerTest, { timeout: "30 seconds" })("MainApi", (it) => {
  it.effect("paddle api webhook", () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(MainApi);
      const result = yield* client.paddle
        .webhook({
          payload: "",
          headers: {
            "paddle-signature": "---",
          },
        })
        .pipe(
          Effect.tapErrorCause((cause) => Console.log(Cause.pretty(cause)))
        );
      expect(result).toBe(true);
    })
  );

  it.effect("api get product", () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(MainApi);
      const drizzle = yield* PgDrizzle.PgDrizzle;

      yield* drizzle.execute(sql`
          CREATE TABLE IF NOT EXISTS "product" (
            "id" varchar(255) PRIMARY KEY NOT NULL,
            "slug" varchar(255) NOT NULL,
            "name" varchar(255) NOT NULL,
            "description" varchar(255),
            "imageUrl" varchar(255)
          );
        `);

      yield* drizzle.insert(productTable).values({
        slug: "test",
        name: "Test",
        description: "Test",
        imageUrl: "https://example.com/image.png",
        id: "test",
      });

      const result = yield* client.paddle.product({ path: { slug: "test" } });
      expect(result).toStrictEqual(
        PaddleProduct.make({
          id: ProductId.make("test"),
          slug: "test",
          name: "Test",
          price: 100,
          description: "Test",
          imageUrl: "https://example.com/image.png",
        })
      );
    })
  );
});
