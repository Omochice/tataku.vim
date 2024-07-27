import type { Denops } from "./deps.ts";
import type { Collector, Emitter, Kind, Processor, Recipe } from "./types.ts";

type Factory<T> = (denops: Denops, options: unknown) => T;

export type CollectorFactory = Factory<Collector>;
export type ProcessorFactory = Factory<Processor>;
export type EmitterFactory = Factory<Emitter>;

export type { Denops, Kind, Recipe };

