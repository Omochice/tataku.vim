import { is, type PredicateType } from "./deps.ts";

const recipePage = is.ObjectOf({
  name: is.String,
  options: is.OptionalOf(is.ObjectOf({})),
});

export const validate = is.ObjectOf({
  collector: recipePage,
  processor: is.ArrayOf(recipePage),
  emitter: recipePage,
});

export type Recipe = PredicateType<typeof validate>;

export type Kind = "collector" | "processor" | "emitter";

export type Query = {
  kind: Kind;
  name: string;
};

export type Collector = ReadableStream<string[]>;
export type Processor = TransformStream<string[]>;
export type Emitter = WritableStream<string[]>;
