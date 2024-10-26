import { MainApi } from "@app/api-client";
import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { Config, Effect } from "effect";

export class Api extends Effect.Service<Api>()("Api", {
  effect: Effect.gen(function* () {
    const baseUrl = yield* Config.string("API_BASE_URL").pipe(
      Config.withDefault("http://localhost:3000")
    );
    return yield* HttpApiClient.make(MainApi, {
      baseUrl,
    });
  }),
  dependencies: [FetchHttpClient.layer],
}) {}
