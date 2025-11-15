import type { Denops } from "jsr:@denops/std@8.2.0";
import type { Collector, Emitter, Kind, Processor, Recipe } from "./types.ts";

export type Factory<T> = (denops: Denops, options: unknown) => T | Promise<T>;

export type CollectorFactory = Factory<Collector>;
export type ProcessorFactory = Factory<Processor>;
export type EmitterFactory = Factory<Emitter>;

export type { Denops, Kind, Recipe };
