import { Layer, ManagedRuntime } from "effect";
import { Paddle } from "./paddle";

const MainLayer = Layer.mergeAll(Paddle.Live);

export const RuntimeClient = ManagedRuntime.make(MainLayer);
