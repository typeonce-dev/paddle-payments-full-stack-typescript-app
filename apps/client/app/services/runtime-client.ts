import { Layer, ManagedRuntime } from "effect";
import { Api } from "./api";
import { Paddle } from "./paddle";

const MainLayer = Layer.mergeAll(Api.Default, Paddle.Default);

export const RuntimeClient = ManagedRuntime.make(MainLayer);
