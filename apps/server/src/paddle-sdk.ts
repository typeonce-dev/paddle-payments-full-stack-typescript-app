import * as _Paddle from "@paddle/paddle-node-sdk";
import { Config, Effect, Layer, Redacted } from "effect";

export class PaddleSdk extends Effect.Service<PaddleSdk>()("PaddleSdk", {
  effect: Effect.gen(function* () {
    const apiKey = yield* Config.redacted("PADDLE_API_KEY");
    return new _Paddle.Paddle(Redacted.value(apiKey), {
      environment: _Paddle.Environment.sandbox,
      logLevel: _Paddle.LogLevel.verbose,
    });
  }),
}) {
  static readonly Test = Layer.effect(
    this,
    Effect.sync(() => {
      class Test extends _Paddle.Paddle {
        override webhooks: _Paddle.Webhooks = {
          unmarshal(requestBody, secretKey, signature) {
            return {
              eventType: _Paddle.EventName.CustomerCreated,
            } as _Paddle.EventEntity;
          },
        } as _Paddle.Webhooks;

        override products: _Paddle.ProductsResource = {
          async get(productId) {
            return {
              id: productId,
              name: "Test",
              description: "Test",
              imageUrl: "https://example.com/image.png",
              price: 100,
            } as unknown as _Paddle.Product;
          },
        } as _Paddle.ProductsResource;
      }

      return PaddleSdk.make(new Test(""));
    })
  );
}
