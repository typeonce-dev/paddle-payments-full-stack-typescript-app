import { useMachine } from "@xstate/react";
import { Breadcrumb, Breadcrumbs } from "~/components/Breadcrumbs";
import { PADDLE_CONTAINER_CLASS } from "~/constants";
import { machine } from "~/machines/paddle-machine";
import { PADDLE_PRICE_ID } from "~/services/_env";

// Testing cards: https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-payment-method
export default function Index() {
  const [snapshot, send, actor] = useMachine(machine, {
    input: { priceId: PADDLE_PRICE_ID },
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
