import { Denops } from "./deps.ts";

export type Recipe = {
  collector: RecipePage;
  processor: RecipePage[];
  emitter: RecipePage;
};

export type RecipePage = {
  name: string;
  options: Record<string, unknown>;
};

export type Kind = "collector" | "processor" | "emitter";

export type Query = {
  kind: Kind;
  name: string;
};

export type TatakuModule<T extends Collector | Processor | Emitter> = {
  run: T;
};

export type Collector = (
  denops: Denops,
  options?: Record<string, unknown>,
) => Promise<string[]>;

export type Processor = (
  denops: Denops,
  source: string[],
  options?: Record<string, unknown>,
) => Promise<string[]>;

export type Emitter = (
  denops: Denops,
  source: string[],
  options?: Record<string, unknown>,
) => Promise<void>;
