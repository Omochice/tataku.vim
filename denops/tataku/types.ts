import { Denops } from "./deps.ts";

export type Recipe = {
  inputter: RecipePage;
  processor: RecipePage[];
  outputter: RecipePage;
};

export type RecipePage = {
  name: string;
  options: Record<string, unknown>;
};

export type Query = {
  type: "inputter" | "processor" | "outputter";
  name: string;
};

export type TatakuModule = {
  run: TatakuInputterMethod | TatakuProcessorMethod | TatakuOutputterMethod;
};

export type TatakuInputterMethod = (
  denops: Denops,
  options: Record<string, unknown>,
) => Promise<string[]>;

export type TatakuProcessorMethod = (
  denops: Denops,
  options: Record<string, unknown>,
  source: string[],
) => Promise<string[]>;

export type TatakuOutputterMethod = (
  denops: Denops,
  options: Record<string, unknown>,
  source: string[],
) => Promise<void>;
