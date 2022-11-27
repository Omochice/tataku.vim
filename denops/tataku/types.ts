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
