import { CheckoutEventNames, type PaddleEventData } from "@paddle/paddle-js";
import { Effect } from "effect";
import { assertEvent, fromPromise, setup } from "xstate";
import { Paddle } from "~/services/paddle";
import { RuntimeClient } from "~/services/runtime-client";

type Input = { priceId: string };

const paddleInitActor = fromPromise(
  ({
    input: { eventCallback, priceId },
  }: {
    input: { eventCallback: (event: PaddleEventData) => void; priceId: string };
  }) =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        const _ = yield* Paddle;
        const paddle = yield* _(eventCallback);
        paddle.Checkout.open({ items: [{ priceId, quantity: 1 }] });
      })
    )
);

export const machine = setup({
  types: {
    input: {} as Input,
    events: {} as
      | Readonly<{ type: "xstate.init"; input: Input }>
      | Readonly<{ type: "checkout.completed" }>
      | Readonly<{ type: "checkout.created" }>,
  },
  actors: { paddleInitActor },
}).createMachine({
  id: "paddle-machine",
  initial: "Init",
  states: {
    Init: {
      invoke: {
        src: "paddleInitActor",
        input: ({ self, event }) => {
          assertEvent(event, "xstate.init");
          return {
            priceId: event.input.priceId,
            eventCallback: (event) => {
              if (event.name === CheckoutEventNames.CHECKOUT_CUSTOMER_CREATED) {
                self.send({ type: "checkout.created" });
              } else if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
                self.send({ type: "checkout.completed" });
              }
            },
          };
        },
        onError: { target: "Error" },
        onDone: { target: "Customer" },
      },
    },
    Customer: {
      on: {
        "checkout.created": { target: "Checkout" },
      },
    },
    Checkout: {
      on: {
        "checkout.completed": { target: "Success" },
      },
    },
    Error: {},
    Success: {
      type: "final",
    },
  },
});
