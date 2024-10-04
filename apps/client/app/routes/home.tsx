import { useMachine } from "@xstate/react";
import { PADDLE_CONTAINER_CLASS } from "~/constants";
import { machine } from "~/machines/paddle-machine";

export default function Index() {
  const [snapshot, send, actor] = useMachine(machine, {
    input: { priceId: "price_1M0l0o0j0O0J0O0J0" },
  });
  return (
    <main>
      <div className={PADDLE_CONTAINER_CLASS}></div>
    </main>
  );
}
