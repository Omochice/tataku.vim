export type RecipePage = {
  name: string;
  options?: Record<string, unknown> | undefined;
};

export type Recipe = {
  collector: RecipePage;
  processor: RecipePage[];
  emitter: RecipePage;
};

export type Kind = "collector" | "processor" | "emitter";

export type Query = {
  kind: Kind;
  name: string;
};

export type Collector = ReadableStream<string[]>;
export type Processor = TransformStream<string[]>;
export type Emitter = WritableStream<string[]>;
