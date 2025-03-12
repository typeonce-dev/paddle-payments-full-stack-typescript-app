import { useMachine } from "@xstate/react";
import { Config, Effect } from "effect";
import { Breadcrumb, Breadcrumbs } from "~/components/Breadcrumbs";
import { PADDLE_CONTAINER_CLASS } from "~/constants";
import { machine } from "~/machines/paddle-machine";
import type { Route } from "./+types/home";

export async function loader() {
  return Effect.runPromise(
    Config.all({ paddleClientToken: Config.string("PADDLE_CLIENT_TOKEN") })
  );
}

// Testing cards: https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-payment-method
export default function Index({
  loaderData,
  params: { slug },
}: Route.ComponentProps) {
  const [snapshot] = useMachine(machine, {
    input: { clientToken: loaderData.paddleClientToken, slug },
  });
  return (
    <main className="mx-auto max-w-4xl my-12">
      <Breadcrumbs className="mb-8">
        <Breadcrumb data-selected={snapshot.matches("Customer")}>
          Customer
        </Breadcrumb>
        <Breadcrumb data-selected={snapshot.matches("Checkout")}>
          Checkout
        </Breadcrumb>
        <Breadcrumb data-selected={snapshot.matches("Success")}>
          Success
        </Breadcrumb>
      </Breadcrumbs>
      <div className={PADDLE_CONTAINER_CLASS}></div>
    </main>
  );
}
