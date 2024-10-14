import type { PaddlePrice, PaddleProduct } from "@app/api-client/schemas";
import { CheckoutEventNames, type Paddle as _Paddle } from "@paddle/paddle-js";
import { Effect } from "effect";
import { assertEvent, assign, fromPromise, setup } from "xstate";
import { Api } from "~/services/api";
import { Paddle } from "~/services/paddle";
import { RuntimeClient } from "~/services/runtime-client";

type Input = { slug: string; clientToken: string };

const loadProductActor = fromPromise(
  ({
    input: { slug },
  }: {
    input: {
      slug: string;
    };
  }) =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        const api = yield* Api;
        return yield* api.paddle.product({ path: { slug } });
      })
    )
);

const paddleInitActor = fromPromise(
  ({
    input: { clientToken },
  }: {
    input: {
      clientToken: string;
    };
  }) =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        const _ = yield* Paddle;
        return yield* _({ clientToken });
      })
    )
);

export const machine = setup({
  types: {
    input: {} as Input,
    context: {} as {
      paddle: _Paddle | null;
      clientToken: string;
      product: PaddleProduct | null;
      price: PaddlePrice | null;
    },
    events: {} as
      | Readonly<{ type: "xstate.init"; input: Input }>
      | Readonly<{ type: "checkout.completed" }>
      | Readonly<{ type: "checkout.created" }>,
  },
  actors: { loadProductActor, paddleInitActor },
}).createMachine({
  id: "paddle-machine",
  context: ({ input }) => ({
    paddle: null,
    product: null,
    price: null,
    clientToken: input.clientToken,
  }),
  initial: "LoadingProduct",
  states: {
    LoadingProduct: {
      invoke: {
        src: "loadProductActor",
        input: ({ event }) => {
          assertEvent(event, "xstate.init");
          return { slug: event.input.slug };
        },
        onError: { target: "Error" },
        onDone: {
          target: "Init",
          actions: assign(({ event }) => ({
            product: event.output.product,
            price: event.output.price,
          })),
        },
      },
    },
    Init: {
      invoke: {
        src: "paddleInitActor",
        input: ({ context }) => ({ clientToken: context.clientToken }),
        onError: { target: "Error" },
        onDone: {
          target: "Customer",
          actions: assign(({ event }) => ({ paddle: event.output })),
        },
      },
    },
    Customer: {
      always: {
        target: "Error",
        guard: ({ context }) => !context.product,
      },
      entry: [
        ({ context, self }) =>
          context.paddle?.Update({
            eventCallback: (event) => {
              if (event.name === CheckoutEventNames.CHECKOUT_CUSTOMER_CREATED) {
                self.send({ type: "checkout.created" });
              } else if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
                self.send({ type: "checkout.completed" });
              }
            },
          }),
        ({ context }) =>
          context.paddle?.Checkout.open({
            items: [{ priceId: context.price?.id!, quantity: 1 }],
          }),
      ],
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
