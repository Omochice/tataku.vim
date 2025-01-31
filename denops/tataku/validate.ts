import { as, is, type Predicate } from "jsr:@core/unknownutil@4.3.0";
import type { Recipe, RecipePage } from "./types.ts";

const recipePage = is.ObjectOf({
  name: is.String,
  options: as.Optional(is.Record),
}) satisfies Predicate<RecipePage>;

export const validate = is.ObjectOf({
  collector: recipePage,
  processor: is.ArrayOf(recipePage),
  emitter: recipePage,
}) satisfies Predicate<Recipe>;
