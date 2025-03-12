// https://github.com/Effect-TS/effect/blob/main/packages/sql-pg/test/utils.ts
import { PgClient } from "@effect/sql-pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Config, Data, Effect, Layer, Redacted } from "effect";

export class ContainerError extends Data.TaggedError("ContainerError")<{
  cause: unknown;
}> {}

export class PgContainer extends Effect.Service<PgContainer>()("PgContainer", {
  scoped: Effect.acquireRelease(
    Effect.tryPromise({
      try: () => new PostgreSqlContainer("postgres:16-alpine").start(),
      catch: (cause) => new ContainerError({ cause }),
    }),
    (container) => Effect.promise(() => container.stop())
  ),
}) {
  static ClientLive = Layer.unwrapEffect(
    Effect.gen(function* () {
      const container = yield* PgContainer;
      return PgClient.layerConfig({
        url: Config.succeed(Redacted.make(container.getConnectionUri())),
      });
    })
  ).pipe(Layer.provide(this.Default));
}
