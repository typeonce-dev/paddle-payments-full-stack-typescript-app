import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { Config, Effect, Redacted } from "effect";
import { Paddle } from "./paddle";

class ErrorMissingWebhookSecret extends Schema.TaggedError<ErrorMissingWebhookSecret>()(
  "ErrorMissingWebhookSecret",
  {}
) {}

class ErrorVerifySignature extends Schema.TaggedError<ErrorVerifySignature>()(
  "ErrorVerifySignature",
  {}
) {}

class PaddleApi extends HttpApiGroup.make("paddle").pipe(
  HttpApiGroup.add(
    HttpApiEndpoint.post("webhook", "/paddle/webhook").pipe(
      HttpApiEndpoint.addError(ErrorMissingWebhookSecret),
      HttpApiEndpoint.addError(ErrorVerifySignature),
      HttpApiEndpoint.setSuccess(Schema.Boolean),
      HttpApiEndpoint.setPayload(Schema.String),
      HttpApiEndpoint.setHeaders(
        Schema.Struct({
          "paddle-signature": Schema.NonEmptyString,
        })
      )
    )
  )
) {}

export class MainApi extends HttpApi.empty.pipe(HttpApi.addGroup(PaddleApi)) {}

export const PaddleApiLive = HttpApiBuilder.group(
  MainApi,
  "paddle",
  (handlers) =>
    handlers.pipe(
      // https://developer.paddle.com/webhooks/signature-verification#verify-sdks
      HttpApiBuilder.handle("webhook", ({ payload, headers }) =>
        Effect.gen(function* () {
          const paddle = yield* Paddle;
          const webhookSecret = yield* Config.redacted(
            "WEBHOOK_SECRET_KEY"
          ).pipe(Effect.mapError(() => new ErrorMissingWebhookSecret()));

          const eventData = yield* Effect.fromNullable(
            paddle.webhooks.unmarshal(
              payload,
              Redacted.value(webhookSecret),
              headers["paddle-signature"]
            )
          ).pipe(Effect.mapError(() => new ErrorVerifySignature()));

          yield* Effect.log(eventData);
          return true;
        })
      )
    )
);
