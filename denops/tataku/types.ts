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

export type TatakuModule = {
  run: Collector | Processor | Emitter;
};

export type Collector = (
  denops: Denops,
  options: Record<string, unknown>,
) => Promise<string[]>;

export type Processor = (
  denops: Denops,
  options: Record<string, unknown>,
  source: string[],
) => Promise<string[]>;

export type Emitter = (
  denops: Denops,
  options: Record<string, unknown>,
  source: string[],
) => Promise<void>;
