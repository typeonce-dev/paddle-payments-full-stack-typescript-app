import { MainApi } from "@app/api-client";
import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { Config, Context, Effect, Layer } from "effect";

interface ApiConfig {
  readonly baseUrl: string;
}

const make = ({ baseUrl }: ApiConfig) =>
  HttpApiClient.make(MainApi, {
    baseUrl,
  });

export class Api extends Context.Tag("Api")<
  Api,
  Effect.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly Live = (config: Config.Config.Wrap<ApiConfig>) =>
    Config.unwrap(config).pipe(
      Effect.flatMap(make),
      Layer.effect(this),
      Layer.provide(FetchHttpClient.layer)
    );
}
