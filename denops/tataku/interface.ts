import { Denops } from "./deps.ts";

export interface Collector {
  run: (
    denops: Denops,
  ) => Promise<string[]>;
}

export interface Processor {
  run: (
    denops: Denops,
    source: string[],
  ) => Promise<string[]>;
}

export interface Emitter {
  run: (
    denops: Denops,
    source: string[],
  ) => Promise<void>;
}
