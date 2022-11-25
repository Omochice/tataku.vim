import { Denops } from "./deps.ts";

export interface Collector {
  run: (denops: Denops) => string[];
  option: Record<string, unknown>;
}

export interface Processor {
  run: (denops: Denops, source: string[]) => string[];
  option: Record<string, unknown>;
}

export interface Emitter {
  run: (denops: Denops, source: string[]) => void;
  option: Record<string, unknown>;
}
