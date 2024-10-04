import { fromCallback, setup } from "xstate";

const paddleInitActor = fromCallback(({ sendBack }) => {});

export const machine = setup({}).createMachine({
  id: "paddle-machine",
  initial: "Idle",
  states: {
    Idle: {},
  },
});
