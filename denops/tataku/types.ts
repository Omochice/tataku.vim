import { $array, $object, $opt, $string, type Infer } from "./deps.ts";

const recipePage = $object({
  name: $string,
  options: $opt($object({}, false)),
});

export const validate = $object({
  collector: recipePage,
  processor: $array(recipePage),
  emitter: recipePage,
});

export type Recipe = Infer<typeof validate>;

export type Kind = "collector" | "processor" | "emitter";

export type Query = {
  kind: Kind;
  name: string;
};

export type Collector = ReadableStream<string[]>;
export type Processor = TransformStream<string[]>;
export type Emitter = WritableStream<string[]>;
