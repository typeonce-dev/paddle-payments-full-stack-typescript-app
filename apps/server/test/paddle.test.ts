import { MainApi } from "@app/api-client";
import { PaddleProduct, ProductId } from "@app/api-client/schemas";
import { HttpApiBuilder } from "@effect/platform";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { expect, it } from "@effect/vitest";
import { sql } from "drizzle-orm";
import { ConfigProvider, Effect, Layer } from "effect";
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

export const MainApiTest = HttpApiBuilder.api(MainApi).pipe(
  Layer.provideMerge(
    PaddleApiLive.pipe(
      Layer.provideMerge(
        Layer.mergeAll(
          PaddleApi.Default,
          Paddle.Default.pipe(Layer.provide(PaddleSdk.Test)),
          PgDrizzle.layer.pipe(Layer.provide(PgContainer.ClientLive))
        )
      )
    )
  ),
  Layer.provide(TestConfigProvider)
);

it.layer(MainApiTest, { timeout: "30 seconds" })("MainApi", (it) => {
  it.effect("paddle api webhook", () =>
    Effect.gen(function* () {
      const api = yield* PaddleApi;
      const result = yield* api.webhook({ paddleSignature: "", payload: "" });
      expect(result).toBe(true);
    })
  );

  it.effect("api get product", () =>
    Effect.gen(function* () {
      const api = yield* PaddleApi;
      const drizzle = yield* PgDrizzle.PgDrizzle;

      yield* drizzle.execute(sql`
          CREATE TABLE IF NOT EXISTS "product" (
            "id" integer PRIMARY KEY NOT NULL,
            "name" varchar(255),
            "price" integer NOT NULL
          );

          ALTER TABLE "product" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
          ALTER TABLE "product" ADD COLUMN "description" varchar(255);--> statement-breakpoint
          ALTER TABLE "product" ADD COLUMN "imageUrl" varchar(255);
          ALTER TABLE "product" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
          ALTER TABLE "product" ADD CONSTRAINT "product_slug_unique" UNIQUE("slug");
        `);

      yield* drizzle.insert(productTable).values({
        slug: "test",
        name: "Test",
        description: "Test",
        imageUrl: "https://example.com/image.png",
        price: 100,
      });

      const result = yield* api.getProduct({ slug: "test" });
      expect(result).toStrictEqual(
        PaddleProduct.make({
          id: ProductId.make(1),
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
