import { MainApi } from "@app/api-client";
import { EntityId, PaddleProduct } from "@app/api-client/schemas";
import { HttpApi, HttpApiBuilder, HttpApiClient } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { expect, it } from "@effect/vitest";
import { sql } from "drizzle-orm";
import { ConfigProvider, Effect, Layer } from "effect";
import { Paddle } from "../src/paddle";
import { PaddleApi, PaddleApiLive } from "../src/paddle-api";
import { PaddleSdk } from "../src/paddle-sdk";
import { priceTable, productTable } from "../src/schema/drizzle";
import { PgContainer } from "./pg-container";

const TestConfigProvider = Layer.setConfigProvider(
  ConfigProvider.fromMap(
    new Map([
      ["PADDLE_API_KEY", ""],
      ["POSTGRES_PW", ""],
      ["WEBHOOK_SECRET_KEY", ""],
    ])
  )
);

// https://discord.com/channels/795981131316985866/1294957004791484476/1296039483782856777
const HttpGroupTest = <Api extends HttpApi.HttpApi.Any, A, E, R>(
  api: Api,
  groupLayer: Layer.Layer<A, E, R>
) =>
  HttpApiBuilder.serve().pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        groupLayer,
        HttpApiBuilder.api(api as any as HttpApi.HttpApi),
        NodeHttpServer.layerTest
      )
    )
  );

const LayerTest = HttpGroupTest(
  MainApi,
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
  it.effect("paddle api webhook success", () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(MainApi);
      const result = yield* client.paddle.webhook({
        headers: {
          "paddle-signature": "---",
        },
      });
      expect(result).toBe(true);
    })
  );

  // it.effect("paddle api webhook error", () =>
  //   Effect.gen(function* () {
  //     const client = yield* HttpApiClient.make(MainApi);
  //     const result = yield* client.paddle
  //       .webhook({
  //         headers: {
  //           "paddle-signature": "",
  //         },
  //       })
  //       .pipe(Effect.flip);
  //     expect(result._tag).toBe("HttpApiDecodeError");
  //   })
  // );

  it.effect("api get product", () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(MainApi);
      const drizzle = yield* PgDrizzle.PgDrizzle;

      yield* drizzle.execute(sql`
          DO $$ BEGIN
            CREATE TYPE "public"."currencyCode" AS ENUM('USD','EUR','GBP','JPY','AUD','CAD','CHF','HKD','SGD','SEK','ARS','BRL','CNY','COP','CZK','DKK','HUF','ILS','INR','KRW','MXN','NOK','NZD','PLN','RUB','THB','TRY','TWD','UAH', 'ZAR');
            EXCEPTION
            WHEN duplicate_object THEN null;
            END $$;

          CREATE TABLE IF NOT EXISTS "product" (
            "id" varchar(255) PRIMARY KEY NOT NULL,
            "slug" varchar(255) NOT NULL,
            "name" varchar(255) NOT NULL,
            "description" varchar(255),
            "imageUrl" varchar(255)
          );

          CREATE TABLE IF NOT EXISTS "price" (
            "id" varchar(255) PRIMARY KEY NOT NULL,
            "productId" varchar(255),
            "amount" varchar(255) NOT NULL,
            "currencyCode" "currencyCode" NOT NULL
          );
          --> statement-breakpoint
          DO $$ BEGIN
          ALTER TABLE "price" ADD CONSTRAINT "price_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
          EXCEPTION
          WHEN duplicate_object THEN null;
          END $$;
        `);

      yield* drizzle.insert(productTable).values({
        slug: "test",
        name: "Test",
        description: "Test",
        imageUrl: "https://example.com/image.png",
        id: "test",
      });

      yield* drizzle.insert(priceTable).values({
        productId: "test",
        amount: "100",
        currencyCode: "USD",
        id: "test",
      });

      const { product } = yield* client.paddle.product({
        path: { slug: "test" },
      });
      expect(product).toStrictEqual(
        PaddleProduct.make({
          id: EntityId.make("test"),
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
