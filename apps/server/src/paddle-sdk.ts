import * as _Paddle from "@paddle/paddle-node-sdk";
import { Config, Context, Effect, Layer, Redacted } from "effect";

interface PaddleSdkConfig {
  readonly apiKey: Redacted.Redacted;
}

const make = ({ apiKey }: PaddleSdkConfig) =>
  new _Paddle.Paddle(Redacted.value(apiKey), {
    environment: _Paddle.Environment.sandbox,
    logLevel: _Paddle.LogLevel.verbose,
  });

export class PaddleSdk extends Context.Tag("PaddleSdk")<
  PaddleSdk,
  ReturnType<typeof make>
>() {
  static readonly Default = (config: Config.Config.Wrap<PaddleSdkConfig>) =>
    Config.unwrap(config).pipe(Effect.map(make), Layer.effect(this));

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

      return new Test("");
    })
  );
}
