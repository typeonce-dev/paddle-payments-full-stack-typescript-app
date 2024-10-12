import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Config, Layer } from "effect";

const PgLive = PgClient.layer({
  password: Config.redacted("POSTGRES_PW"),
  username: Config.succeed("postgres"),
  database: Config.succeed("app"),
  host: Config.succeed("localhost"),
  port: Config.succeed(5432),
});

const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));

export const DatabaseLive = Layer.mergeAll(PgLive, DrizzleLive);
