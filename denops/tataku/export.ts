import type { Denops } from "jsr:@denops/std@7.0.2";
import type { Collector, Emitter, Kind, Processor, Recipe } from "./types.ts";

type Factory<T> = (denops: Denops, options: unknown) => T;

export type CollectorFactory = Factory<Collector>;
export type ProcessorFactory = Factory<Processor>;
export type EmitterFactory = Factory<Emitter>;

export type { Denops, Kind, Recipe };
